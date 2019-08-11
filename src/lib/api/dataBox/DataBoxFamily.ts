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
import {IdValidChecker}              from "../../helper/id/idValidCheckerUtils";
import {ScExchange}                  from "../../helper/sc/scServer";
import {
    CudAction,
    DATA_BOX_START_INDICATOR,
    DbClientReceiverEvent,
    DbClientPackage,
    DbWorkerAction,
    DbWorkerCudPackage,
    DbClientSenderAction,
    DbClientCudPackage,
    CudType,
    CudPackage,
    PreCudPackage,
    DbSessionData,
    InfoOption,
    TimestampOption,
    IfContainsOption,
    DBClientSenderSessionTarget,
    DbFetchDataClientResponse,
    DbWorkerBroadcastPackage,
    DbWorkerPackage,
    DbClientClosePackage,
    DbWorkerClosePackage,
    DbClientKickOutPackage,
    DbClientSenderPackage,
    DbClientFetchSenderPackage,
    DbSocketMemory,
    DbRegisterResult,
    ChangeValue
} from "../../helper/dataBox/dbDefinitions";
import DataBoxAccessHelper from "../../helper/dataBox/dataBoxAccessHelper";
import DataBoxUtils        from "../../helper/dataBox/dataBoxUtils";
import DbCudActionSequence from "../../helper/dataBox/dbCudActionSequence";
import RespondUtils        from "../../helper/utils/respondUtils";
import {ErrorName}         from "../../helper/constants/errorName";
import DataBoxFetchManager, {FetchManagerBuilder} from "../../helper/dataBox/dataBoxFetchManager";
import ZSocket                                    from "../../helper/internalApi/zSocket";
import CloneUtils                                 from "../../helper/utils/cloneUtils";
const DefaultSymbol                               = Symbol();

/**
 * If you want to present data on the client, the DataBox is the best choice.
 * The DataBox will keep the data up to date on the client in real time.
 * Also, it will handle all problematic cases, for example,
 * when the connection to the server is lost,
 * and the client did not get an update of the data.
 * It's also the right choice if you want to present a significant amount of data
 * because DataBoxes support the functionality to stream the data
 * to the clients whenever a client needs more data.
 * Additionally, it keeps the network traffic low because it
 * only sends the changed data information, not the whole data again.
 *
 * The DataBoxFamily class gives you the possibility to define a
 * family of DataBoxes that only differ by an id (also named memberId).
 * That is useful in a lot of cases, for example,
 * if you want to have a DataBoxFamily for user profiles.
 * Than the DataBoxes only differ by the ids of the users.
 */
export default class DataBoxFamily extends DataBoxCore {

    /**
     * Maps the member id to the sockets and remove socket function.
     */
    private readonly regMember : Map<string,Map<UpSocket,DbSocketMemory>> = new Map();
    /**
     * Maps the sockets to the member ids.
     */
    private readonly socketMembers : Map<UpSocket,Set<string>> = new Map<UpSocket, Set<string>>();
    private readonly lastCudData : Map<string,{timestamp : number,id : string}> = new Map();
    private readonly idValidCheck : IdValidChecker;
    private readonly dbEventPreFix : string;
    private readonly scExchange : ScExchange;
    private readonly workerFullId : string;
    private readonly maxSocketInputChannels : number;

    private readonly buildFetchManager : FetchManagerBuilder<typeof DataBoxFamily.prototype._fetchData>;
    private readonly sendCudToSockets : (id : string,dbClientCudPackage : DbClientCudPackage) => Promise<void> | void;

    static ___instance___ : DataBoxFamily;

    constructor(id : string, bag: Bag, dbPreparedData : DbPreparedData, idValidCheck : IdValidChecker, apiLevel : number | undefined) {
        super(id,bag,dbPreparedData,apiLevel);
        this.idValidCheck = idValidCheck;
        this.scExchange = bag.getWorker().scServer.exchange;
        this.workerFullId = bag.getWorker().getFullWorkerId();
        this.maxSocketInputChannels = dbPreparedData.maxSocketInputChannels;
        this.dbEventPreFix = `${DATA_BOX_START_INDICATOR}-${this.id}-${apiLevel !== undefined ? apiLevel : ''}-`;

        this.buildFetchManager = DataBoxFetchManager.buildFetchMangerBuilder
        (dbPreparedData.parallelFetch,dbPreparedData.maxBackpressure);
        this.sendCudToSockets = this.getSendCudToSocketsHandler();
    }

    /**
     * Returns the send cud to socket handler.
     * Uses only the complex send to socket cud (with middleware)
     * if at least one of the middleware function was overwritten.
     */
    private getSendCudToSocketsHandler() : (id : string,dbClientCudPackage : DbClientCudPackage) => Promise<void> | void {
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
     * @param id
     * @param inSessionData
     * @private
     */
    async _registerSocket(socket : UpSocket,id : string,inSessionData : undefined | DbSessionData) : Promise<DbRegisterResult> {

        const {inputChIds,unregisterSocket} = this._connectSocket(socket,id);

        DataBoxUtils.maxInputChannelsCheck(inputChIds.size,this.maxSocketInputChannels);

        //add input channel
        const chInputId = DataBoxUtils.generateInputChId(inputChIds);
        inputChIds.add(chInputId);

        const outputCh = this.dbEventPreFix+id;
        const inputCh = outputCh+'-'+chInputId;

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
                            id,
                            sessionData,
                            await this._consumeFetchInput((senderPackage as DbClientFetchSenderPackage).i),
                            senderPackage.t
                        );
                    }
                    catch (err) {
                        respond(err);
                    }
                    break;
                case DbClientSenderAction.resetSession:
                    await RespondUtils.respondWithFunc(respond,this._resetSession,id,sessionData,senderPackage.t);
                    break;
                case DbClientSenderAction.copySession:
                    await RespondUtils.respondWithFunc(respond,this._copySession,id,sessionData,senderPackage.t);
                    break;
                case DbClientSenderAction.close:
                    unregisterSocket(chInputId);
                    respond(null);
                    break;
                case DbClientSenderAction.getLastCudId:
                    respond(null,this._getLastCudId(id));
                    break;
                default :
                    const err : any = new Error('Unknown action');
                    err.name = ErrorName.UNKNOWN_ACTION;
                    respond(err);
            }
        });

        return {inputCh, outputCh}
    }

    /**
     * Disconnects a socket.
     * @param socket
     * @param disconnectHandler
     * @param id
     * @private
     */
    private _disconnectSocket(socket : UpSocket,disconnectHandler : () => void,id : string) {
        socket.off('disconnect',disconnectHandler);
        DataBoxAccessHelper.rmDb(this,socket);
        this._rmSocket(socket,id);
    }

    /**
     * **Not override this method.**
     * @param id
     * @private
     */
    _getLastCudId(id : string) : string {
        const lastCudId = this.lastCudData.get(id);
        if(lastCudId){
            return lastCudId.id;
        }
        return '';
    }

    private async _fetchData(id : string,sessionData : DbSessionData,fetchInput : any,target ?: DBClientSenderSessionTarget) : Promise<DbFetchDataClientResponse> {
        const session = DataBoxUtils.getSession(sessionData,target);

        const currentCounter = session.c;
        session.c++;
        const data = await this.fetchData(id,currentCounter,fetchInput,session.d);

        return {
            c : currentCounter,
            d : data,
            t : await this._signSessionToken(sessionData,id)
        };
    }

    private async _resetSession(id : string,sessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : Promise<string> {
        DataBoxUtils.resetSession(sessionData,target);
        return this._signSessionToken(sessionData,id);
    }

    private async _copySession(id : string,sessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : Promise<string> {
        DataBoxUtils.copySession(sessionData,target);
        return this._signSessionToken(sessionData,id);
    }

    /**
     * **Not override this method.**
     * Id valid check is used internally.
     * @param id
     * @private
     */
    async _checkIdIsValid(id : string) : Promise<void> {
        await this.idValidCheck(id);
    }

    /**
     * Returns the socket family member map or builds a new one and returns it.
     * @param id
     * @private
     */
    private _buildSocketFamilyMemberMap(id : string) : Map<UpSocket,DbSocketMemory> {
        let memberMap = this.regMember.get(id);
        if(!memberMap){
            memberMap = new Map<UpSocket,DbSocketMemory>();
            this._registerMember(id);
            this.regMember.set(id,memberMap);
        }
        return memberMap;
    }

    /**
     * Connects a socket internally with the DataBox, if it's not already connected.
     * (To get updates of this family member)
     * @param socket
     * @param id
     * @private
     */
    private _connectSocket(socket : UpSocket,id : string) : DbSocketMemory {
        const memberMap = this._buildSocketFamilyMemberMap(id);

        let socketMemoryData = memberMap.get(socket);
        if(!socketMemoryData){
            //new socket = connect
            const inputChPrefix = `${this.dbEventPreFix}${id}-`;
            const inputChIds = new Set<string>();

            const unregisterSocketFunction = (inputChannelId ?: string) => {
                if(inputChannelId === undefined){
                    for(let inChId of inputChIds.values()) {
                       socket.off(inputChPrefix+inChId);
                    }
                    //will also delete the inputChannels set
                    this._disconnectSocket(socket,unregisterSocketFunction,id);
                }
                else {
                    socket.off(inputChPrefix+inputChannelId);
                    inputChIds.delete(inputChannelId);
                    if(inputChIds.size === 0){
                        this._disconnectSocket(socket,unregisterSocketFunction,id);
                    }
                }
            };

            socketMemoryData = {
                inputChIds: inputChIds,
                unregisterSocket : unregisterSocketFunction
            };

            memberMap.set(socket,socketMemoryData);

            //socket member map
            let socketMemberSet = this.socketMembers.get(socket);
            if(!socketMemberSet){
                socketMemberSet = new Set<string>();
                this.socketMembers.set(socket,socketMemberSet);
            }
            socketMemberSet.add(id);

            socket.on('disconnect',unregisterSocketFunction);
            DataBoxAccessHelper.addDb(this,socket);
        }
        return socketMemoryData;
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @param id
     * @private
     */
    private _rmSocket(socket : UpSocket,id : string){
        //main member socket map
        const memberMap = this.regMember.get(id);
        if(memberMap){
            memberMap.delete(socket);
            if(memberMap.size === 0){
                this.regMember.delete(id);
                this._unregisterMember(id);
            }
        }

        //socket member map
        const socketMemberSet = this.socketMembers.get(socket);
        if(socketMemberSet){
            socketMemberSet.delete(id);
            if(socketMemberSet.size === 0) {
                this.socketMembers.delete(socket);
            }
        }
    }

    /**
     * Registers for listening to a new family member.
     * @param id
     * @private
     */
    private _registerMember(id : string) {
        this.lastCudData.set(id,{timestamp : Date.now(),id : ''});
        this.scExchange.subscribe(this.dbEventPreFix+id)
            .watch(async (data) => {
                if((data as DbWorkerCudPackage).w !== this.workerFullId) {
                    switch (data.action) {
                        case DbWorkerAction.cud:
                            await this._processCudPackage(id,(data as DbWorkerCudPackage).d);
                            break;
                        case DbWorkerAction.close:
                            this._close(id,(data as DbWorkerClosePackage).d);
                            break;
                        case DbWorkerAction.broadcast:
                            this._sendToSockets(id,(data as DbWorkerBroadcastPackage).d);
                            break;
                        default:
                    }
                }
            });
    }

    /**
     * Unregisters for listening to a family member.
     * @param id
     * @private
     */
    private _unregisterMember(id : string) {
        const channel = this.scExchange.channel(this.dbEventPreFix+id);
        channel.unwatch();
        channel.destroy();
        this.lastCudData.delete(id);
    }

    /**
     * Sends a DataBox package to all sockets of a family member.
     * @param id
     * @param dbClientPackage
     */
    private _sendToSockets(id : string,dbClientPackage : DbClientPackage) {
        const socketSet = this.regMember.get(id);
        if(socketSet){
            const outputCh = this.dbEventPreFix+id;
            for(let socket of socketSet.keys()) {
                socket.emit(outputCh,dbClientPackage);
            }
        }
    }

    /**
     * Sends a DataBox cud package to sockets of the DataBox after passing the cud middleware.
     * @param id
     * @param dbClientPackage
     * @private
     */
    private async _sendCudToSocketsWithMiddleware(id : string,dbClientPackage : DbClientCudPackage) {

        const socketSet = this.regMember.get(id);

        if(socketSet){
            const outputCh = this.dbEventPreFix+id;
            const actions = dbClientPackage.d.a;
            const socketPromises : Promise<void>[] = [];

            for(let socket of socketSet.keys()) {

                const filteredActions : CudAction[] = [];
                const promises : Promise<void>[] = [];

                for(let i = 0; i < actions.length; i++){
                    const action = CloneUtils.deepClone(actions[i]);
                    switch (action.t) {
                        case CudType.update:
                            promises.push((async () => {
                                try {
                                    await this.updateMiddleware(id,socket.zSocket,action.k,action.v,(value) => {
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
                                    await this.insertMiddleware(id,socket.zSocket,action.k,action.v,(value) => {
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
                                    await this.deleteMiddleware(id,socket.zSocket,action.k,action.c,action.d);
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
                        socket.emit(outputCh,dbClientPackage);
                    }
                }));
            }
            await Promise.all(socketPromises);

        }
    }

    /**
     * Processes new cud packages.
     * @param id
     * @param cudPackage
     */
    private async _processCudPackage(id : string,cudPackage : CudPackage){
        this.sendCudToSockets(id,{a : DbClientReceiverEvent.cud,d : cudPackage} as DbClientCudPackage);
        //updated last cud id.
        const lastCudId = this.lastCudData.get(id);
        if((lastCudId && lastCudId.timestamp <= cudPackage.t) || !lastCudId){
            this.lastCudData.set(id,{id : cudPackage.ci, timestamp : cudPackage.t});
        }
    }

    /**
     * Fire before events.
     * @param id
     * @param cudActions
     */
    private async _fireBeforeEvents(id : string,cudActions : CudAction[]){
        let promises : Promise<void>[] = [];
        for(let i = 0; i < cudActions.length;i++) {
            const action = cudActions[i];
            switch (action.t) {
                case CudType.insert:
                    promises.push(this.beforeInsert(id,action.k,action.v));
                    break;
                case CudType.update:
                    promises.push(this.beforeUpdate(id,action.k,action.v));
                    break;
                case CudType.delete:
                    promises.push(this.beforeDelete(id,action.k));
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
     * @param id
     * @param timestamp
     */
    async _emitCudPackage(preCudPackage : PreCudPackage,id : string,timestamp ?: number) {
        await this._fireBeforeEvents(id,preCudPackage.a);
        const cudPackage = DataBoxUtils.buildCudPackage(preCudPackage,timestamp);
        this._sendToWorker(id,{
            a : DbWorkerAction.cud,
            d : cudPackage,
            w : this.workerFullId
        } as DbWorkerCudPackage);
        await this._processCudPackage(id,cudPackage);
    }

    private _broadcastToOtherSockets(id : string,clientPackage : DbClientPackage) {
        this._sendToWorker(id,{
            a : DbWorkerAction.broadcast,
            d : clientPackage,
            w : this.workerFullId
        } as DbWorkerBroadcastPackage);
    }

    private _sendToWorker(id : string,workerPackage : DbWorkerPackage) {
        this.scExchange.publish(this.dbEventPreFix+id,workerPackage);
    }

    /**
     * Close the family member of this DataBox.
     * @param id
     * @param closePackage
     * @private
     */
    private _close(id : string,closePackage : DbClientClosePackage) {
        const memberMap = this.regMember.get(id);
        if(memberMap){
            const outputCh = this.dbEventPreFix+id;
            for(let [socket, socketMemory] of memberMap.entries()) {
                socket.emit(outputCh,closePackage);
                socketMemory.unregisterSocket();
            }
        }
    }

    /**
     * **Not override this method.**
     * Insert a new value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * @param value
     * @param ifContains
     * @param timestamp
     * @param code
     * @param data
     */
    async insert(id : string | number,keyPath : string[] | string, value : any,{ifContains,timestamp,code,data} : IfContainsOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataBoxUtils.buildPreCudPackage(
                DataBoxUtils.buildInsert(keyPath,value,ifContains,code,data)),
            typeof id === "string" ? id : id.toString(),timestamp);
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
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * @param value
     * @param timestamp
     * @param code
     * @param data
     */
    async update(id : string | number,keyPath : string[] | string, value : any,{timestamp,code,data} : InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataBoxUtils.buildPreCudPackage(
                DataBoxUtils.buildUpdate(keyPath,value,code,data)),
            typeof id === "string" ? id : id.toString(),timestamp);
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
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * @param timestamp
     * @param code
     * @param data
     */
    async delete(id : string | number,keyPath : string[] | string,{timestamp,code,data} : InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataBoxUtils.buildPreCudPackage(
                DataBoxUtils.buildDelete(keyPath,code,data)),
            typeof id === "string" ? id : id.toString(),timestamp);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Sequence edit the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-events.
     * This method is ideal for doing multiple changes on a DataBox
     * because it will pack them all together and send them all in ones.
     * It will not automatically update the databank,
     * so you have to do it in the before-events or before calling this method.
     * @param id The member of the family you want to edit.
     * Numbers will be converted to a string.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(id : string | number,timestamp ?: number) : DbCudActionSequence {
        return new DbCudActionSequence(async (actions) => {
            await this._emitCudPackage(
                DataBoxUtils.buildPreCudPackage(...actions),
                typeof id === "string" ? id : id.toString(),timestamp);
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
     * @param id
     * @param counter
     * @param input
     * @param sessionData
     */
    protected async fetchData<T extends object = object>(id : string,counter : number,input : any,sessionData : T) : Promise<any>{
        this.noMoreDataAvailable();
    }


    // noinspection JSUnusedGlobalSymbols
    /**
     * **Can be overridden.**
     * Check if the member id is valid for this DataBoxFamily.
     * To block the id, you only need to return an object (that can be error information) or false.
     * If you want to allow the id, you have to return nothing or a true.
     * @param id
     * @param bag
     */
    public isIdValid(id : string,bag : Bag) : Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void {
    }

    /**
     * **Not override this method.**
     * The close function will close the DataBox with the id for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param id The member of the family you want to close.
     * Numbers will be converted to a string.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(id : string | number,code ?: number | string,data ?: any,forEveryWorker : boolean = true){
        id = typeof id === "string" ? id : id.toString();
        const clientPackage = DataBoxUtils.buildClientClosePackage(code,data);
        if(forEveryWorker){
            this._sendToWorker(id,
                {
                    a : DbWorkerAction.close,
                    d : clientPackage,
                    w : this.workerFullId
                } as DbWorkerClosePackage);
        }
        this._close(id,clientPackage);
    }

    /**
     * **Not override this method.**
     * The reload function will force all clients of the DataBox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param id The member of the family you want to force to reload.
     * Numbers will be converted to a string.
     * @param forEveryWorker
     * @param code
     * @param data
     */
    doReload(id : string | number,forEveryWorker : boolean = false,code ?: number | string,data ?: any){
        id = typeof id === "string" ? id : id.toString();
        const clientPackage = DataBoxUtils.buildClientReloadPackage(code,data);
        if(forEveryWorker){
            this._broadcastToOtherSockets(id,clientPackage);
        }
        this._sendToSockets(id,clientPackage);
    }

    /**
     * **Not override this method.**
     * With this function, you can kick out a socket from all DataBoxes of this family.
     * This method is used internally.
     * @param socket
     * @param code
     * @param data
     */
    kickOut(socket : UpSocket,code ?: number | string,data ?: any) : void {
        const memberIds = this.socketMembers.get(socket);
        if(memberIds){
            for(let id of memberIds.values()) {
                const socketMap = this.regMember.get(id);
                if(socketMap){
                    const socketMemory = socketMap.get(socket);
                    if(socketMemory){
                        socket.emit(this.dbEventPreFix+id,
                            {a : DbClientReceiverEvent.kickOut,c : code,d : data} as DbClientKickOutPackage);
                        socketMemory.unregisterSocket();
                    }
                }
            }
        }
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the DataBox.
     * Can be used to insert the data in the database.
     * @param id
     * @param keyPath
     * @param value
     */
    protected async beforeInsert(id : string,keyPath : string[],value : any) {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an update of data in the DataBox.
     * Can be used to update the data in the database.
     * @param id
     * @param keyPath
     * @param value
     */
    protected async beforeUpdate(id : string,keyPath : string[],value : any) {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before a delete of data in the DataBox.
     * Can be used to delete the data in the database.
     * @param id
     * @param keyPath
     */
    protected async beforeDelete(id : string,keyPath : string[]) {
    }

    /**
     * **Can be overridden.**
     * The insert middleware.
     * You should only use a cud middleware in advance use cases because they
     * create a performance overhead.
     * You should not invoke long process tasks in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket variables.
     * The middleware will be called before each socket reaches a cud operation.
     * You can change the value with the parameter changeValue by simply calling
     * the function with the new value.
     * With this functionality, you can make parts of the data invisible to some clients.
     * You are also able to block the complete operation for the socket
     * by calling the internal block method or throwing any error.
     * @param id
     * @param socket
     * @param keyPath
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected async insertMiddleware(id : string,socket : ZSocket,keyPath : string[],value : any,changeValue : ChangeValue,
                                     code : string | number | undefined,data : any) : Promise<void> {
    }

    /**
     * **Can be overridden.**
     * The update middleware.
     * You should only use a cud middleware in advance use cases because they
     * create a performance overhead.
     * You should not invoke long process tasks in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket variables.
     * The middleware will be called before each socket reaches a cud operation.
     * You can change the value with the parameter changeValue by simply calling
     * the function with the new value.
     * With this functionality, you can make parts of the data invisible to some clients.
     * You are also able to block the complete operation for the socket
     * by calling the internal block method or throwing any error.
     * @param id
     * @param socket
     * @param keyPath
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected async updateMiddleware(id : string,socket : ZSocket,keyPath : string[],value : any,changeValue : ChangeValue,
                                     code : string | number | undefined,data : any) : Promise<void> {
    }

    /**
     * **Can be overridden.**
     * The delete middleware.
     * You should only use a cud middleware in advance use cases because they
     * create a performance overhead.
     * You should not invoke long process tasks in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket variables.
     * The middleware will be called before each socket reaches a cud operation.
     * You are able to block the complete operation for the socket
     * by calling the internal block method or throwing any error.
     * @param id
     * @param socket
     * @param keyPath
     * @param code
     * @param data
     */
    protected async deleteMiddleware(id : string,socket : ZSocket,keyPath : string[],
                                     code : string | number | undefined,data : any) : Promise<void> {
    }
}

DataBoxFamily.prototype['insertMiddleware'][DefaultSymbol] = true;
DataBoxFamily.prototype['updateMiddleware'][DefaultSymbol] = true;
DataBoxFamily.prototype['deleteMiddleware'][DefaultSymbol] = true;

export interface DataBoxFamilyClass {
    config: DataBoxConfig;

    new(id : string, bag: Bag, dbPreparedData : DbPreparedData, idValidCheck : IdValidChecker, apiLevel : number | undefined): DataBoxFamily;

    prototype: any;
    name : string;

    readonly ___instance___ : DataBoxFamily | undefined;
}
