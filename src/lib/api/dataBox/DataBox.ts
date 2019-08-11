/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataBoxConfig}               from "../../helper/config/definitions/dataBoxConfig";
import Bag                           from "../Bag";
import DataBoxCore, {DbPreparedData} from "./DataBoxCore";
import UpSocket, {RespondFunction}   from "../../helper/sc/socket";
import {
    CudAction,
    CudPackage,
    CudType,
    DATA_BOX_START_INDICATOR,
    DbClientClosePackage,
    DbClientCudPackage, DbClientFetchSenderPackage,
    DbClientKickOutPackage,
    DbClientPackage,
    DbClientReceiverEvent,
    DbClientSenderAction,
    DbClientSenderPackage,
    DBClientSenderSessionTarget,
    DbFetchDataClientResponse,
    DbSessionData,
    DbWorkerAction,
    DbWorkerBroadcastPackage,
    DbWorkerClosePackage,
    DbWorkerCudPackage,
    DbWorkerPackage,
    IfContainsOption,
    InfoOption,
    PreCudPackage,
    TimestampOption, DbRegisterResult, DbSocketMemory, ChangeValue
} from "../../helper/dataBox/dbDefinitions";
import DataBoxAccessHelper from "../../helper/dataBox/dataBoxAccessHelper";
import {ScExchange}        from "../../helper/sc/scServer";
import DataBoxUtils        from "../../helper/dataBox/dataBoxUtils";
import DbCudActionSequence from "../../helper/dataBox/dbCudActionSequence";
import RespondUtils        from "../../helper/utils/respondUtils";
import {ErrorName}         from "../../helper/constants/errorName";
import DataBoxFetchManager, {FetchManagerBuilder} from "../../helper/dataBox/dataBoxFetchManager";
import ZSocket                                    from "../../helper/internalApi/zSocket";
import CloneUtils                                 from "../../helper/utils/cloneUtils";
const DefaultSymbol                              = Symbol();

/**
 * If you want to present data on the client, the DataBox is the best choice.
 * The DataBox will keep the data up to date on the client in real time.
 * Also, it will handle all problematic cases, for example,
 * when the connection to the server is lost,
 * and the client did not get an update of the data.
 * It's also the right choice if you want to present a significant amount of data
 * because DataBoxes support the functionality to stream the data
 * to the client whenever the client need more data.
 * Additionally, it keeps the network traffic low because it
 * only sends the changed data information, not the whole data again.
 */
export default class DataBox extends DataBoxCore {

    private readonly regSockets : Map<UpSocket,DbSocketMemory> = new Map();
    private lastCudData : {timestamp : number,id : string} = {timestamp : Date.now(),id : ''};
    private readonly scExchange : ScExchange;
    private readonly workerFullId : string;
    private readonly dbEvent : string;
    private readonly maxSocketInputChannels : number;

    private readonly buildFetchManager : FetchManagerBuilder<typeof DataBox.prototype._fetchData>;
    private readonly sendCudToSockets : (dbClientCudPackage : DbClientCudPackage) => Promise<void> | void;

    static ___instance___ : DataBox;

    constructor(id : string, bag: Bag, dbPreparedData : DbPreparedData, apiLevel : number | undefined) {
        super(id,bag,dbPreparedData,apiLevel);
        this.scExchange = bag.getWorker().scServer.exchange;
        this.workerFullId = bag.getWorker().getFullWorkerId();
        this.maxSocketInputChannels = dbPreparedData.maxSocketInputChannels;
        this.dbEvent = `${DATA_BOX_START_INDICATOR}-${this.name}-${apiLevel !== undefined ? apiLevel : ''}`;

        this.buildFetchManager = DataBoxFetchManager.buildFetchMangerBuilder
        (dbPreparedData.parallelFetch,dbPreparedData.maxBackpressure);
        this.sendCudToSockets = this.getSendCudToSocketsHandler();

        this._reg();
    }

    /**
     * Returns the send cud to socket handler.
     * Uses only the complex send to socket cud (with middleware)
     * if at least one of the middleware function was overwritten.
     */
    private getSendCudToSocketsHandler() : (dbClientCudPackage : DbClientCudPackage) => Promise<void> | void {
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
     * @param inSessionData
     * @private
     */
    async _registerSocket(socket : UpSocket,inSessionData : undefined | DbSessionData) : Promise<DbRegisterResult> {

        const {inputChIds,unregisterSocket} = this._connectSocket(socket);

        DataBoxUtils.maxInputChannelsCheck(inputChIds.size,this.maxSocketInputChannels);

        //add input channel
        const chInputId = DataBoxUtils.generateInputChId(inputChIds);
        inputChIds.add(chInputId);

        const inputCh = this.dbEvent+'-'+chInputId;

        const sessionData = inSessionData ? inSessionData : DataBoxUtils.createDbSessionData();

        const fetchManager = this.buildFetchManager();

        socket.on(inputCh,async (senderPackage : DbClientSenderPackage, respond : RespondFunction) => {
            switch (senderPackage.a) {
                case DbClientSenderAction.fetchData:
                    //try because _consumeFetchInput can throw an error.
                    try {
                        await fetchManager(
                            respond,
                            this._fetchData,
                            sessionData,
                            await this._consumeFetchInput((senderPackage as DbClientFetchSenderPackage).i),
                            socket.zSocket,
                            senderPackage.t
                        );
                    }
                    catch (err) {
                        respond(err);
                    }
                    break;
                case DbClientSenderAction.resetSession:
                    await RespondUtils.respondWithFunc(respond,this._resetSession,sessionData,senderPackage.t);
                    break;
                case DbClientSenderAction.copySession:
                    await RespondUtils.respondWithFunc(respond,this._copySession,sessionData,senderPackage.t);
                    break;
                case DbClientSenderAction.getLastCudId:
                    respond(null,this._getLastCudId());
                    break;
                case DbClientSenderAction.close:
                    unregisterSocket(chInputId);
                    respond(null);
                    break;
                default :
                    const err : any = new Error('Unknown action');
                    err.name = ErrorName.UNKNOWN_ACTION;
                    respond(err);
            }
        });

        return {inputCh, outputCh : this.dbEvent}
    }

    private _disconnectSocket(socket : UpSocket,disconnectHandler : () => void) {
        socket.off('disconnect',disconnectHandler);
        DataBoxAccessHelper.rmDb(this,socket);
        this._rmSocket(socket);
    }

    /**
     * **Not override this method.**
     * @private
     */
    _getLastCudId() : string {
        return this.lastCudData.id;
    }

    private async _fetchData(sessionData : DbSessionData,fetchInput : any,zSocket : ZSocket,target ?: DBClientSenderSessionTarget) : Promise<DbFetchDataClientResponse> {
        const session = DataBoxUtils.getSession(sessionData,target);

        const currentCounter = session.c;
        session.c++;
        const data = await this.fetchData(currentCounter,session.d,fetchInput,zSocket);

        return {
            c : currentCounter,
            d : data,
            t : await this._signSessionToken(sessionData)
        };
    }

    private async _resetSession(sessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : Promise<string> {
        DataBoxUtils.resetSession(sessionData,target);
        return this._signSessionToken(sessionData);
    }

    private async _copySession(sessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : Promise<string> {
        DataBoxUtils.copySession(sessionData,target);
        return this._signSessionToken(sessionData);
    }

    /**
     * Adds a socket internally in the map. (For getting updates of this family member)
     * @param socket
     * @private
     */
    private _connectSocket(socket : UpSocket) : DbSocketMemory {

        let socketMemoryData = this.regSockets.get(socket);
        if(!socketMemoryData){
            //new socket = connect
            const inputChPrefix = `${this.dbEvent}-`;
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

            this.regSockets.set(socket,socketMemoryData);

            socket.on('disconnect',unregisterSocketFunction);
            DataBoxAccessHelper.addDb(this,socket);
        }
        return socketMemoryData;
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @private
     */
    private _rmSocket(socket : UpSocket){
        this.regSockets.delete(socket);
    }

    /**
     * Registers for listening to the DataBox channel.
     * @private
     */
    private _reg() {
        this.scExchange.subscribe(this.dbEvent)
            .watch(async (data) => {
                if((data as DbWorkerCudPackage).w !== this.workerFullId) {
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
     * Sends a DataBox package to all sockets of the DataBox.
     * @param dbClientPackage
     */
    private _sendToSockets(dbClientPackage : DbClientPackage) {
        for(let socket of this.regSockets.keys()) {
            socket.emit(this.dbEvent,dbClientPackage);
        }
    }

    /**
     * Sends a DataBox cud package to sockets of the DataBox after passing the cud middleware.
     * @param dbClientPackage
     * @private
     */
    private async _sendCudToSocketsWithMiddleware(dbClientPackage : DbClientCudPackage) {

        const actions = dbClientPackage.d.a;
        const socketPromises : Promise<void>[] = [];

        for(let socket of this.regSockets.keys()) {

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
                    socket.emit(this.dbEvent,dbClientPackage);
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
        await this.sendCudToSockets({a : DbClientReceiverEvent.cud,d : cudPackage} as DbClientCudPackage);
        //updated last cud id.
        if(this.lastCudData.timestamp <= cudPackage.t){
            this.lastCudData = {id : cudPackage.ci, timestamp : cudPackage.t};
        }
    }

    /**
     * Fire before events.
     * @param cudActions
     */
    private async _fireBeforeEvents(cudActions : CudAction[]){
        let promises : Promise<void>[] = [];
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
        const cudPackage = DataBoxUtils.buildCudPackage(preCudPackage,timestamp);
        this._sendToWorker({
            a : DbWorkerAction.cud,
            d : cudPackage,
            w : this.workerFullId
        } as DbWorkerCudPackage);
        await this._processCudActions(cudPackage);
    }

    private _broadcastToOtherSockets(clientPackage : DbClientPackage) {
        this._sendToWorker({
            a : DbWorkerAction.broadcast,
            d : clientPackage,
            w : this.workerFullId
        } as DbWorkerBroadcastPackage);
    }

    private _sendToWorker(workerPackage : DbWorkerPackage) {
        this.scExchange.publish(this.dbEvent,workerPackage);
    }

    /**
     * Close this DataBox.
     * @param closePackage
     * @private
     */
    private _close(closePackage : DbClientClosePackage) {
        for(let [socket, socketMemory] of this.regSockets.entries()) {
            socket.emit(this.dbEvent,closePackage);
            socketMemory.unregisterSocket();
        }
    }

    /**
     * **Not override this method.**
     * Insert a new value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the databank,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * @param keyPath
     * @param value
     * @param ifContains
     * @param timestamp
     * @param code
     * @param data
     */
    async insert(keyPath : string[] | string, value : any,{ifContains,timestamp,code,data} : IfContainsOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataBoxUtils.buildPreCudPackage(
                DataBoxUtils.buildInsert(keyPath,value,ifContains,code,data)),timestamp);
    }

    /**
     * **Not override this method.**
     * Update a value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the databank,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * @param keyPath
     * @param value
     * @param timestamp
     * @param code
     * @param data
     */
    async update(keyPath : string[] | string, value : any,{timestamp,code,data} : InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataBoxUtils.buildPreCudPackage(
                DataBoxUtils.buildUpdate(keyPath,value,code,data)),timestamp);
    }

    /**
     * **Not override this method.**
     * Delete a value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the databank,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * @param keyPath
     * @param timestamp
     * @param code
     * @param data
     */
    async delete(keyPath : string[] | string,{timestamp,code,data} : InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataBoxUtils.buildPreCudPackage(
                DataBoxUtils.buildDelete(keyPath,code,data)),timestamp);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Sequence edit the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-events.
     * This method is ideal for doing multiple changes on a DataBox
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
                DataBoxUtils.buildPreCudPackage(...actions),timestamp);
        });
    }

    /**
     * **Can be overridden.**
     * This method is used to fetch data for the clients of the DataBox.
     * A client can call that method multiple times to fetch more and more data.
     * You usually request data from your database and return it, and if no more data is available,
     * you should throw a NoMoreDataAvailableError or call the internal noMoreDataAvailable method.
     * The counter parameter indicates the number of the current call, it starts counting at zero.
     * The client can send additional data when calling the fetch process,
     * this data is available as the fetch input parameter.
     * Also, you extra get a session object, this object you can use to save variables that are
     * important to get more data in the future, for example, the last id of the item that the client had received.
     * The session object is only available on the server-side and can not be modified on the client-side.
     * If you design the DataBox in such a way that the next fetch is not depending on the previous one,
     * you can activate the parallelFetch option in the DataBox config.
     * The data what you are returning can be of any type.
     * But if you want to return more complex data,
     * it is recommended that the information consists of key-value able components
     * so that you can identify each value with a key path.
     * That can be done by using an object or a key-array.
     * Whenever you are using the socket parameter to filter the data for the specific user,
     * you also have to use the cud middleware to filter the cud events for the socket.
     * You mostly should avoid this because if you are overwriting a cud middleware,
     * the DataBox switches to a more costly performance implementation.
     * @param counter
     * @param sessionData
     * @param input
     * @param socket
     */
    protected async fetchData<T extends object = object>(counter : number,sessionData : T,input : any,socket : ZSocket) : Promise<any>{
        this.noMoreDataAvailable();
    }

    /**
     * **Not override this method.**
     * The close function will close the DataBox for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(code ?: number | string,data ?: any,forEveryWorker : boolean = true){
        const clientPackage = DataBoxUtils.buildClientClosePackage(code,data);
        if(forEveryWorker){
            this._sendToWorker(
                {
                    a : DbWorkerAction.close,
                    d : clientPackage,
                    w : this.workerFullId
                } as DbWorkerClosePackage);
        }
        this._close(clientPackage);
    }

    /**
     * **Not override this method.**
     * The reload function will force all clients of the DataBox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param forEveryWorker
     * @param code
     * @param data
     */
    doReload(forEveryWorker : boolean = false,code ?: number | string,data ?: any){
        const clientPackage = DataBoxUtils.buildClientReloadPackage(code,data);
        if(forEveryWorker){
            this._broadcastToOtherSockets(clientPackage);
        }
        this._sendToSockets(clientPackage);
    }

    /**
     * **Not override this method.**
     * With this function, you can kick out a socket from this DataBox.
     * This method is used internally.
     * @param socket
     * @param code
     * @param data
     */
    kickOut(socket : UpSocket,code ?: number | string,data ?: any) : void {
        const socketMemory = this.regSockets.get(socket);
        if(socketMemory){
            socket.emit(this.dbEvent,
                {a : DbClientReceiverEvent.kickOut,c : code,d : data} as DbClientKickOutPackage);
            socketMemory.unregisterSocket();
        }
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the DataBox.
     * Can be used to insert the data in the database.
     * @param keyPath
     * @param value
     */
    protected async beforeInsert(keyPath : string[],value : any) {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an update of data in the DataBox.
     * Can be used to update the data in the database.
     * @param keyPath
     * @param value
     */
    protected async beforeUpdate(keyPath : string[],value : any) {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before a delete of data in the DataBox.
     * Can be used to delete the data in the database.
     * @param keyPath
     */
    protected async beforeDelete(keyPath : string[]) {
    }

    /**
     * **Can be overridden.**
     * The insert middleware.
     * You should only use a cud middleware if you can find no other way
     * because when your overwrite at least one of them, the DataBox
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
    protected async insertMiddleware(socket : ZSocket,keyPath : string[],value : any,changeValue : ChangeValue,
                                     code : string | number | undefined,data : any) : Promise<void> {
    }

    /**
     * **Can be overridden.**
     * The update middleware.
     * You should only use a cud middleware if you can find no other way
     * because when your overwrite at least one of them, the DataBox
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
    protected async updateMiddleware(socket : ZSocket,keyPath : string[],value : any,changeValue : ChangeValue,
                                     code : string | number | undefined,data : any) : Promise<void> {
    }

    /**
     * **Can be overridden.**
     * The delete middleware.
     * You should only use a cud middleware if you can find no other way
     * because when your overwrite at least one of them, the DataBox
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
    protected async deleteMiddleware(socket : ZSocket,keyPath : string[],
                                     code : string | number | undefined,data : any) : Promise<void> {
    }
}

DataBox.prototype['insertMiddleware'][DefaultSymbol] = true;
DataBox.prototype['updateMiddleware'][DefaultSymbol] = true;
DataBox.prototype['deleteMiddleware'][DefaultSymbol] = true;

export interface DataBoxClass {
    config: DataBoxConfig;

    new(name : string, bag: Bag, dbPreparedData : DbPreparedData, apiLevel : number | undefined): DataBox;

    prototype: any;
    name : string;

    readonly ___instance___ : DataBox | undefined;
}
