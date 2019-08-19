/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataboxConfig}               from "../../main/config/definitions/databoxConfig";
import Bag                           from "../Bag";
import DataboxCore, {DbPreparedData} from "./DataboxCore";
import UpSocket, {RespondFunction}   from "../../main/sc/socket";
import {
    CudAction,
    CudPackage,
    CudType,
    DATA_BOX_START_INDICATOR,
    DbClientOutputClosePackage,
    DbClientOutputCudPackage, DbClientInputFetchPackage,
    DbClientOutputKickOutPackage,
    DbClientOutputPackage,
    DbClientOutputEvent,
    DbClientInputAction,
    DbClientInputPackage,
    DBClientInputSessionTarget,
    DbClientInputFetchResponse,
    DbWorkerAction,
    DbWorkerBroadcastPackage,
    DbWorkerClosePackage,
    DbWorkerCudPackage,
    DbWorkerPackage,
    IfContainsOption,
    InfoOption,
    PreCudPackage,
    TimestampOption, DbRegisterResult, DbSocketMemory, ChangeValue, DbToken
} from "../../main/databox/dbDefinitions";
import DataboxAccessHelper from "../../main/databox/databoxAccessHelper";
import {ScExchange}        from "../../main/sc/scServer";
import DataboxUtils        from "../../main/databox/databoxUtils";
import DbCudActionSequence from "../../main/databox/dbCudActionSequence";
import RespondUtils        from "../../main/utils/respondUtils";
import {ClientErrorName}   from "../../main/constants/clientErrorName";
import DataboxFetchManager, {FetchManagerBuilder} from "../../main/databox/databoxFetchManager";
import ZSocket                                    from "../../main/internalApi/zSocket";
import CloneUtils                                 from "../../main/utils/cloneUtils";
const DefaultSymbol                              = Symbol();

/**
 * If you always want to present the most recent data on the client,
 * the Databox is the best choice.
 * The Databox will keep the data up to date on the client in real-time.
 * Also, it will handle all problematic cases, for example,
 * when the connection to the server is lost,
 * and the client did not get an update of the data.
 * It's also the right choice if you want to present a significant amount of data
 * because Databoxes support the functionality to stream the data
 * to the clients whenever a client needs more data.
 * Additionally, it keeps the network traffic low because it
 * only sends the changed data information, not the whole data again.
 *
 * You can override these methods:
 * - initialize
 * - fetchData
 * - beforeInsert
 * - beforeUpdate
 * - beforeDelete
 * - onConnection
 * - onDisconnection
 *
 * and the cud middleware methods:
 * - insertMiddleware
 * - updateMiddleware
 * - deleteMiddleware
 */
export default class Databox extends DataboxCore {

    private readonly _regSockets : Map<UpSocket,DbSocketMemory> = new Map();
    private _lastCudData : {timestamp : number,id : string} = {timestamp : Date.now(),id : ''};
    private readonly _scExchange : ScExchange;
    private readonly _workerFullId : string;
    private readonly _dbEvent : string;
    private readonly _maxSocketInputChannels : number;

    private readonly _buildFetchManager : FetchManagerBuilder<typeof Databox.prototype._fetchData>;
    private readonly _sendCudToSockets : (dbClientCudPackage : DbClientOutputCudPackage) => Promise<void> | void;

    static ___instance___ : Databox;

    constructor(id : string, bag: Bag, dbPreparedData : DbPreparedData, apiLevel : number | undefined) {
        super(id,bag,dbPreparedData,apiLevel);
        this._scExchange = bag.getWorker().scServer.exchange;
        this._workerFullId = bag.getWorker().getFullWorkerId();
        this._maxSocketInputChannels = dbPreparedData.maxSocketInputChannels;
        this._dbEvent = `${DATA_BOX_START_INDICATOR}-${this.name}-${apiLevel !== undefined ? apiLevel : ''}`;

        this._buildFetchManager = DataboxFetchManager.buildFetchMangerBuilder
        (dbPreparedData.parallelFetch,dbPreparedData.maxBackpressure);
        this._sendCudToSockets = this._getSendCudToSocketsHandler();

        this._reg();
    }

    /**
     * Returns the send cud to socket handler.
     * Uses only the complex send to socket cud (with middleware)
     * if at least one of the middleware function was overwritten.
     */
    private _getSendCudToSocketsHandler() : (dbClientCudPackage : DbClientOutputCudPackage) => Promise<void> | void {
        if(!this.insertMiddleware[DefaultSymbol] ||
            !this.updateMiddleware[DefaultSymbol] ||
            !this.deleteMiddleware[DefaultSymbol])
        {
            return this._sendCudToSocketsWithMiddleware;
        }
        else {
            return this._sendToSockets;
        }
    }

    //Core
    /**
     * **Not override this method.**
     * @param socket
     * @param dbToken
     * @param initData
     * @private
     */
    async _registerSocket(socket : UpSocket,dbToken : DbToken,initData : any) : Promise<DbRegisterResult> {

        const {inputChIds,unregisterSocket} = this._connectSocket(socket);

        DataboxUtils.maxInputChannelsCheck(inputChIds.size,this._maxSocketInputChannels);

        //add input channel
        const chInputId = DataboxUtils.generateInputChId(inputChIds);
        inputChIds.add(chInputId);

        const inputCh = this._dbEvent+'-'+chInputId;

        const fetchManager = this._buildFetchManager();

        socket.on(inputCh,async (senderPackage : DbClientInputPackage, respond : RespondFunction) => {
            switch (senderPackage.a) {
                case DbClientInputAction.fetchData:
                    //try because _consumeFetchInput can throw an error.
                    try {
                        await fetchManager(
                            respond,
                            this._fetchData,
                            dbToken,
                            await this._consumeFetchInput((senderPackage as DbClientInputFetchPackage).i),
                            initData,
                            socket.zSocket,
                            senderPackage.t
                        );
                    }
                    catch (err) {
                        respond(err);
                    }
                    break;
                case DbClientInputAction.resetSession:
                    await RespondUtils.respondWithFunc(respond,this._resetSession,dbToken,senderPackage.t);
                    break;
                case DbClientInputAction.copySession:
                    await RespondUtils.respondWithFunc(respond,this._copySession,dbToken,senderPackage.t);
                    break;
                case DbClientInputAction.getLastCudId:
                    respond(null,this._getLastCudId());
                    break;
                case DbClientInputAction.disconnect:
                    unregisterSocket(chInputId);
                    respond(null);
                    break;
                default :
                    const err : any = new Error('Unknown action');
                    err.name = ClientErrorName.UNKNOWN_ACTION;
                    respond(err);
            }
        });

        return {inputCh, outputCh : this._dbEvent}
    }

    private _disconnectSocket(socket : UpSocket,disconnectHandler : () => void) {
        socket.off('disconnect',disconnectHandler);
        DataboxAccessHelper.rmDb(this,socket);
        this._rmSocket(socket);
        this.onDisconnection(socket.zSocket);
    }

    /**
     * **Not override this method.**
     * @private
     */
    _getLastCudId() : string {
        return this._lastCudData.id;
    }

    private async _fetchData(dbToken : DbToken,fetchInput : any,initData : any,zSocket : ZSocket,target ?: DBClientInputSessionTarget) : Promise<DbClientInputFetchResponse> {
        const session = DataboxUtils.getSession(dbToken.sessions,target);

        const currentCounter = session.c;
        session.c++;
        const data = await this.fetchData(currentCounter,session.d,fetchInput,initData,zSocket);

        return {
            c : currentCounter,
            d : data,
            t : await this._signDbToken(dbToken)
        };
    }

    private async _resetSession(dbToken : DbToken,target ?: DBClientInputSessionTarget) : Promise<string> {
        DataboxUtils.resetSession(dbToken.sessions,target);
        return this._signDbToken(dbToken);
    }

    private async _copySession(dbToken : DbToken,target ?: DBClientInputSessionTarget) : Promise<string> {
        DataboxUtils.copySession(dbToken.sessions,target);
        return this._signDbToken(dbToken);
    }

    /**
     * Adds a socket internally in the map. (For getting updates of this family member)
     * @param socket
     * @private
     */
    private _connectSocket(socket : UpSocket) : DbSocketMemory {

        let socketMemoryData = this._regSockets.get(socket);
        if(!socketMemoryData){
            //new socket = connect
            const inputChPrefix = `${this._dbEvent}-`;
            const inputChIds = new Set<string>();

            const unregisterSocketFunction = (inputChannelId ?: string) => {
                if(inputChannelId === undefined){
                    for(let inChId of inputChIds.values()) {
                        socket.off(inputChPrefix+inChId);
                    }
                    //will also delete the inputChannels set
                    this._disconnectSocket(socket,unregisterSocketFunction);
                }
                else {
                    socket.off(inputChPrefix+inputChannelId);
                    inputChIds.delete(inputChannelId);
                    if(inputChIds.size === 0){
                        this._disconnectSocket(socket,unregisterSocketFunction);
                    }
                }
            };

            socketMemoryData = {
                inputChIds : inputChIds,
                unregisterSocket : unregisterSocketFunction
            };

            this._regSockets.set(socket,socketMemoryData);

            socket.on('disconnect',unregisterSocketFunction);
            DataboxAccessHelper.addDb(this,socket);
            this.onConnection(socket.zSocket);
        }
        return socketMemoryData;
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @private
     */
    private _rmSocket(socket : UpSocket){
        this._regSockets.delete(socket);
    }

    /**
     * Registers for listening to the Databox channel.
     * @private
     */
    private _reg() {
        this._scExchange.subscribe(this._dbEvent)
            .watch(async (data) => {
                if((data as DbWorkerCudPackage).w !== this._workerFullId) {
                    switch (data.action) {
                        case DbWorkerAction.cud:
                            await this._processCudActions((data as DbWorkerCudPackage).d);
                            break;
                        case DbWorkerAction.close:
                            this._close((data as DbWorkerClosePackage).d);
                            break;
                        case DbWorkerAction.broadcast:
                            this._sendToSockets((data as DbWorkerBroadcastPackage).d);
                            break;
                        default:
                    }
                }
            });
    }

    /**
     * Sends a Databox package to all sockets of the Databox.
     * @param dbClientPackage
     */
    private _sendToSockets(dbClientPackage : DbClientOutputPackage) {
        for(let socket of this._regSockets.keys()) {
            socket.emit(this._dbEvent,dbClientPackage);
        }
    }

    /**
     * Sends a Databox cud package to sockets of the Databox after passing the cud middleware.
     * @param dbClientPackage
     * @private
     */
    private async _sendCudToSocketsWithMiddleware(dbClientPackage : DbClientOutputCudPackage) {

        const actions = dbClientPackage.d.a;
        const socketPromises : Promise<void>[] = [];

        for(let socket of this._regSockets.keys()) {

            const filteredActions : CudAction[] = [];
            const promises : Promise<void>[] = [];

            for(let i = 0; i < actions.length; i++){
                const action = CloneUtils.deepClone(actions[i]);
                switch (action.t) {
                    case CudType.update:
                        promises.push((async () => {
                            try {
                                await this.updateMiddleware(socket.zSocket,action.k,action.v,(value) => {
                                    action.d = value;
                                },action.c,action.d);
                                filteredActions.push(action);
                            }
                            catch (e) {}
                        })());
                        break;
                    case CudType.insert:
                        promises.push((async () => {
                            try {
                                await this.insertMiddleware(socket.zSocket,action.k,action.v,(value) => {
                                    action.d = value;
                                },action.c,action.d);
                                filteredActions.push(action);
                            }
                            catch (e) {}
                        })());
                        break;
                    case CudType.delete:
                        promises.push((async () => {
                            try {
                                await this.deleteMiddleware(socket.zSocket,action.k,action.c,action.d);
                                filteredActions.push(action);
                            }
                            catch (e) {}
                        })());
                        break;
                }
            }

            socketPromises.push(Promise.all(promises).then(() => {
                if(filteredActions.length > 0){
                    dbClientPackage.d.a = filteredActions;
                    socket.emit(this._dbEvent,dbClientPackage);
                }
            }));
        }
        await Promise.all(socketPromises);
    }

    /**
     * Processes new cud packages.
     * @param cudPackage
     */
    private async _processCudActions(cudPackage : CudPackage){
        await this._sendCudToSockets({a : DbClientOutputEvent.cud,d : cudPackage} as DbClientOutputCudPackage);
        //updated last cud id.
        if(this._lastCudData.timestamp <= cudPackage.t){
            this._lastCudData = {id : cudPackage.ci, timestamp : cudPackage.t};
        }
    }

    /**
     * Fire before events.
     * @param cudActions
     */
    private async _fireBeforeEvents(cudActions : CudAction[]){
        let promises : (Promise<void> | void)[] = [];
        for(let i = 0; i < cudActions.length;i++) {
            const action = cudActions[i];
            switch (action.t) {
                case CudType.insert:
                    promises.push(this.beforeInsert(action.k,action.v));
                    break;
                case CudType.update:
                    promises.push(this.beforeUpdate(action.k,action.v));
                    break;
                case CudType.delete:
                    promises.push(this.beforeDelete(action.k));
                    break;
            }
        }
        await Promise.all(promises);
    }

    /**
     * **Not override this method.**
     * This method is used to send the cud package to
     * all workers and execute it on the current worker.
     * @param preCudPackage
     * @param timestamp
     */
    async _emitCudPackage(preCudPackage : PreCudPackage,timestamp ?: number) {
        await this._fireBeforeEvents(preCudPackage.a);
        const cudPackage = DataboxUtils.buildCudPackage(preCudPackage,timestamp);
        this._sendToWorker({
            a : DbWorkerAction.cud,
            d : cudPackage,
            w : this._workerFullId
        } as DbWorkerCudPackage);
        await this._processCudActions(cudPackage);
    }

    private _broadcastToOtherSockets(clientPackage : DbClientOutputPackage) {
        this._sendToWorker({
            a : DbWorkerAction.broadcast,
            d : clientPackage,
            w : this._workerFullId
        } as DbWorkerBroadcastPackage);
    }

    private _sendToWorker(workerPackage : DbWorkerPackage) {
        this._scExchange.publish(this._dbEvent,workerPackage);
    }

    /**
     * Close this Databox.
     * @param closePackage
     * @private
     */
    private _close(closePackage : DbClientOutputClosePackage) {
        for(let [socket, socketMemory] of this._regSockets.entries()) {
            socket.emit(this._dbEvent,closePackage);
            socketMemory.unregisterSocket();
        }
    }

    /**
     * **Not override this method.**
     * Insert a new value in the Databox.
     * Notice that this method will only update the Databox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Insert behavior:
     * Without ifContains (ifContains exists):
     * Base (with keyPath [] or '') -> Nothing
     * KeyArray -> Inserts the value at the end with the key
     * (if the key does not exist). But if you are using a compare function,
     * it will insert the value in the correct position.
     * Object -> Inserts the value with the key (if the key does not exist).
     * Array -> Key will be parsed to int if it is a number then it will be inserted at the index.
     * Otherwise, it will be added at the end.
     * With ifContains (ifContains exists):
     * Base (with keyPath [] or '') -> Nothing
     * KeyArray -> Inserts the value before the ifContains element with the key
     * (if the key does not exist). But if you are using a compare function,
     * it will insert the value in the correct position.
     * Object -> Inserts the value with the key (if the key does not exist).
     * Array -> Key will be parsed to int if it is a number then it will be inserted at the index.
     * Otherwise, it will be added at the end.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param value
     * @param ifContains
     * @param timestamp
     * @param code
     * @param data
     */
    async insert(keyPath : string[] | string, value : any,{ifContains,timestamp,code,data} : IfContainsOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildInsert(keyPath,value,ifContains,code,data)),timestamp);
    }

    /**
     * **Not override this method.**
     * Update a value in the Databox.
     * Notice that this method will only update the Databox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Update behavior:
     * Base (with keyPath [] or '') -> Updates the complete structure.
     * KeyArray -> Updates the specific value (if the key does exist).
     * Object -> Updates the specific value (if the key does exist).
     * Array -> Key will be parsed to int if it is a number it will
     * update the specific value (if the index exist).
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param value
     * @param timestamp
     * @param code
     * @param data
     */
    async update(keyPath : string[] | string, value : any,{timestamp,code,data} : InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildUpdate(keyPath,value,code,data)),timestamp);
    }

    /**
     * **Not override this method.**
     * Delete a value in the Databox.
     * Notice that this method will only update the Databox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Delete behavior:
     * Base (with keyPath [] or '') -> Deletes the complete structure.
     * KeyArray -> Deletes the specific value (if the key does exist).
     * Object -> Deletes the specific value (if the key does exist).
     * Array -> Key will be parsed to int if it is a number it will delete the
     * specific value (if the index does exist). Otherwise, it will delete the last item.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param timestamp
     * @param code
     * @param data
     */
    async delete(keyPath : string[] | string,{timestamp,code,data} : InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildDelete(keyPath,code,data)),timestamp);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Sequence edit the Databox.
     * Notice that this method will only update the Databox and invoke the before-events.
     * This method is ideal for doing multiple changes on a Databox
     * because it will pack them all together and send them all in ones.
     * It will not automatically update the database,
     * so you have to do it in the before-events or before calling this method.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(timestamp ?: number) : DbCudActionSequence {
        return new DbCudActionSequence(async (actions) => {
            await this._emitCudPackage(
                DataboxUtils.buildPreCudPackage(...actions),timestamp);
        });
    }

    /**
     * **Not override this method.**
     * The close function will close the Databox for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(code ?: number | string,data ?: any,forEveryWorker : boolean = true){
        const clientPackage = DataboxUtils.buildClientClosePackage(code,data);
        if(forEveryWorker){
            this._sendToWorker(
                {
                    a : DbWorkerAction.close,
                    d : clientPackage,
                    w : this._workerFullId
                } as DbWorkerClosePackage);
        }
        this._close(clientPackage);
    }

    /**
     * **Not override this method.**
     * The reload function will force all clients of the Databox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param forEveryWorker
     * @param code
     * @param data
     */
    doReload(forEveryWorker : boolean = false,code ?: number | string,data ?: any){
        const clientPackage = DataboxUtils.buildClientReloadPackage(code,data);
        if(forEveryWorker){
            this._broadcastToOtherSockets(clientPackage);
        }
        this._sendToSockets(clientPackage);
    }

    /**
     * **Not override this method.**
     * With this function, you can kick out a socket from this Databox.
     * This method is used internally.
     * @param socket
     * @param code
     * @param data
     */
    kickOut(socket : UpSocket,code ?: number | string,data ?: any) : void {
        const socketMemory = this._regSockets.get(socket);
        if(socketMemory){
            socket.emit(this._dbEvent,
                {a : DbClientOutputEvent.kickOut,c : code,d : data} as DbClientOutputKickOutPackage);
            socketMemory.unregisterSocket();
        }
    }

    /**
     * **Can be overridden.**
     * This method is used to fetch data for the clients of the Databox.
     * A client can call that method multiple times to fetch more and more data.
     * You usually request data from your database and return it, and if no more data is available,
     * you should throw a NoMoreDataAvailableError or call the internal noMoreDataAvailable method.
     * The counter parameter indicates the number of the current call, it starts counting at zero.
     * The client can send additional data when calling the fetch process (fetchInput),
     * this data is available as the input parameter.
     * Also, you extra get a session object, this object you can use to save variables that are
     * important to get more data in the future, for example, the last id of the item that the client had received.
     * The session object is only available on the server-side and can not be modified on the client-side.
     * Notice that you only can store JSON convertible data in the session.
     * If you design the Databox in such a way that the next fetch is not depending on the previous one,
     * you can activate the parallelFetch option in the Databox config.
     * The data what you are returning can be of any type.
     * But if you want to return more complex data,
     * it is recommended that the information consists of key-value able components
     * so that you can identify each value with a key path.
     * That can be done by using an object or a key-array.
     * To build a key-array, you can use the buildKeyArray method.
     * Whenever you are using the socket to filter the data for a specific user,
     * you also have to use the cud middleware to filter the cud events for the socket.
     * You mostly should avoid this because if you are overwriting a cud middleware,
     * the Databox switches to a more costly performance implementation.
     * @param counter
     * @param session
     * @param input
     * @param initData
     * @param socket
     */
    protected fetchData<T extends object = object>(counter : number,session : T,input : any,initData : any,socket : ZSocket) : Promise<any> | any {
        this.noMoreDataAvailable();
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the Databox.
     * Can be used to insert the data in the database.
     * @param keyPath
     * @param value
     */
    protected beforeInsert(keyPath : string[],value : any) : Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an update of data in the Databox.
     * Can be used to update the data in the database.
     * @param keyPath
     * @param value
     */
    protected beforeUpdate(keyPath : string[],value : any) : Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before a delete of data in the Databox.
     * Can be used to delete the data in the database.
     * @param keyPath
     */
    protected beforeDelete(keyPath : string[]) : Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a new socket is connected to the Databox.
     */
    protected onConnection(socket : ZSocket) : Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a socket is disconnected from the Databox.
     * Notice that means all input channels are closed.
     */
    protected onDisconnection(socket : ZSocket) : Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * The insert middleware.
     * You should only use a cud middleware if you can find no other way
     * because when your overwrite at least one of them, the Databox
     * switches to a more costly performance implementation.
     * You should not invoke long process tasks in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket variables.
     * The middleware will be called before each socket reaches a cud operation.
     * You can change the value with the parameter changeValue by simply calling
     * the function with the new value.
     * With this functionality, you can make parts of the data invisible to some clients.
     * You are also able to block the complete operation for the socket
     * by calling the internal block method or throwing any error.
     * @param socket
     * @param keyPath
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected insertMiddleware(socket : ZSocket,keyPath : string[],value : any,changeValue : ChangeValue,
                                     code : string | number | undefined,data : any) : Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * The update middleware.
     * You should only use a cud middleware if you can find no other way
     * because when your overwrite at least one of them, the Databox
     * switches to a more costly performance implementation.
     * You should not invoke long process tasks in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket variables.
     * The middleware will be called before each socket reaches a cud operation.
     * You can change the value with the parameter changeValue by simply calling
     * the function with the new value.
     * With this functionality, you can make parts of the data invisible to some clients.
     * You are also able to block the complete operation for the socket
     * by calling the internal block method or throwing any error.
     * @param socket
     * @param keyPath
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected updateMiddleware(socket : ZSocket,keyPath : string[],value : any,changeValue : ChangeValue,
                                     code : string | number | undefined,data : any) : Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * The delete middleware.
     * You should only use a cud middleware if you can find no other way
     * because when your overwrite at least one of them, the Databox
     * switches to a more costly performance implementation.
     * You should not invoke long process tasks in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket variables.
     * The middleware will be called before each socket reaches a cud operation.
     * You are able to block the complete operation for the socket
     * by calling the internal block method or throwing any error.
     * @param socket
     * @param keyPath
     * @param code
     * @param data
     */
    protected deleteMiddleware(socket : ZSocket,keyPath : string[],
                                     code : string | number | undefined,data : any) : Promise<void> | void {
    }
}

Databox.prototype['insertMiddleware'][DefaultSymbol] = true;
Databox.prototype['updateMiddleware'][DefaultSymbol] = true;
Databox.prototype['deleteMiddleware'][DefaultSymbol] = true;

export interface DataboxClass {
    config: DataboxConfig;

    new(name : string, bag: Bag, dbPreparedData : DbPreparedData, apiLevel : number | undefined): Databox;

    prototype: any;
    name : string;

    readonly ___instance___ : Databox | undefined;
}