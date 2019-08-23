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
import {IdValidChecker}              from "../../main/id/idValidCheckerUtils";
import {ScExchange}                  from "../../main/sc/scServer";
import {
    CudOperation,
    DATA_BOX_START_INDICATOR,
    DbClientOutputEvent,
    DbClientOutputPackage,
    DbWorkerAction,
    DbWorkerCudPackage,
    DbClientInputAction,
    DbClientOutputCudPackage,
    CudType,
    CudPackage,
    PreCudPackage,
    InfoOption,
    TimestampOption,
    IfContainsOption,
    DBClientInputSessionTarget,
    DbClientInputFetchResponse,
    DbWorkerBroadcastPackage,
    DbWorkerPackage,
    DbClientOutputClosePackage,
    DbWorkerClosePackage,
    DbClientOutputKickOutPackage,
    DbClientInputPackage,
    DbClientInputFetchPackage,
    DbSocketMemory,
    DbRegisterResult,
    ChangeValue, DbToken
} from "../../main/databox/dbDefinitions";
import DataboxAccessHelper    from "../../main/databox/databoxAccessHelper";
import DataboxUtils           from "../../main/databox/databoxUtils";
import DbCudOperationSequence from "../../main/databox/dbCudOperationSequence";
import {ClientErrorName}      from "../../main/constants/clientErrorName";
import DataboxFetchManager, {FetchManagerBuilder} from "../../main/databox/databoxFetchManager";
import ZSocket                                    from "../../main/internalApi/zSocket";
import CloneUtils                                 from "../../main/utils/cloneUtils";
import {databoxInstanceSymbol}                    from "../../main/databox/databoxPrepare";
import Timeout                                    = NodeJS.Timeout;
const defaultSymbol                               = Symbol();

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
 * The DataboxFamily class gives you the possibility to define a
 * family of Databoxes that only differ by an id (also named memberId).
 * That is useful in a lot of cases, for example,
 * if you want to have a DataboxFamily for user profiles.
 * Than the Databoxes only differ by the ids of the users.
 *
 * You can override these methods:
 * - initialize
 * - fetchData
 * - isIdValid
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
export default class DataboxFamily extends DataboxCore {

    /**
     * Maps the member id to the sockets and remove socket function.
     */
    private readonly _regMember : Map<string,Map<UpSocket,DbSocketMemory>> = new Map();
    /**
     * Maps the sockets to the member ids.
     */
    private readonly _socketMembers : Map<UpSocket,Set<string>> = new Map<UpSocket, Set<string>>();
    private readonly _lastCudData : Map<string,{timestamp : number,id : string}> = new Map();
    private readonly _unregisterMemberTimeoutMap : Map<string,Timeout> = new Map();
    private readonly _idValidCheck : IdValidChecker;
    private readonly _dbEventPreFix : string;
    private readonly _scExchange : ScExchange;
    private readonly _workerFullId : string;
    private readonly _maxSocketInputChannels : number;

    private readonly _buildFetchManager : FetchManagerBuilder<typeof DataboxFamily.prototype._fetchData>;
    private readonly _sendCudToSockets : (id : string,dbClientCudPackage : DbClientOutputCudPackage) => Promise<void> | void;

    static [databoxInstanceSymbol] : DataboxFamily;

    constructor(id : string, bag: Bag, dbPreparedData : DbPreparedData, idValidCheck : IdValidChecker, apiLevel : number | undefined) {
        super(id,bag,dbPreparedData,apiLevel);
        this._idValidCheck = idValidCheck;
        this._scExchange = bag.getWorker().scServer.exchange;
        this._workerFullId = bag.getWorker().getFullWorkerId();
        this._maxSocketInputChannels = dbPreparedData.maxSocketInputChannels;
        this._dbEventPreFix = `${DATA_BOX_START_INDICATOR}-${this.name}-${apiLevel !== undefined ? apiLevel : ''}-`;

        this._buildFetchManager = DataboxFetchManager.buildFetchMangerBuilder
        (dbPreparedData.parallelFetch,dbPreparedData.maxBackpressure);
        this._sendCudToSockets = this._getSendCudToSocketsHandler();
    }

    /**
     * Returns the send cud to socket handler.
     * Uses only the complex send to socket cud (with middleware)
     * if at least one of the middleware function was overwritten.
     */
    private _getSendCudToSocketsHandler() : (id : string,dbClientCudPackage : DbClientOutputCudPackage) => Promise<void> | void {
        if(!this.insertMiddleware[defaultSymbol] ||
            !this.updateMiddleware[defaultSymbol] ||
            !this.deleteMiddleware[defaultSymbol])
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
     * @param dbToken
     * @param initData
     * @private
     */
    async _registerSocket(socket : UpSocket,id : string,dbToken : DbToken,initData : any) : Promise<DbRegisterResult> {

        const {inputChIds,unregisterSocket} = this._connectSocket(socket,id);

        DataboxUtils.maxInputChannelsCheck(inputChIds.size,this._maxSocketInputChannels);

        //add input channel
        const chInputId = DataboxUtils.generateInputChId(inputChIds);
        inputChIds.add(chInputId);

        const outputCh = this._dbEventPreFix+id;
        const inputCh = outputCh+'-'+chInputId;

        const fetchManager = this._buildFetchManager();

        socket.on(inputCh,async (senderPackage : DbClientInputPackage, respond : RespondFunction) => {
            try {
                switch (senderPackage.a) {
                    case DbClientInputAction.fetchData:
                        await fetchManager(
                            respond,
                            async () => {
                                return await this._fetchData
                                (
                                    id,
                                    dbToken,
                                    await this._consumeFetchInput((senderPackage as DbClientInputFetchPackage).i),
                                    initData,
                                    socket.zSocket,
                                    senderPackage.t
                                )
                            }
                        );
                        break;
                    case DbClientInputAction.resetSession:
                        respond(null,await this._resetSession(id,dbToken,senderPackage.t));
                        break;
                    case DbClientInputAction.copySession:
                        respond(null,await this._copySession(id,dbToken,senderPackage.t));
                        break;
                    case DbClientInputAction.disconnect:
                        unregisterSocket(chInputId);
                        respond(null);
                        break;
                    case DbClientInputAction.getLastCudId:
                        respond(null,this._getLastCudId(id));
                        break;
                    default :
                        const err : any = new Error('Unknown action');
                        err.name = ClientErrorName.UNKNOWN_ACTION;
                        respond(err);
                }
            }
            catch (err) {respond(err);}
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
        DataboxAccessHelper.rmDb(this,socket);
        this._rmSocket(socket,id);
        this.onDisconnection(id,socket.zSocket);
    }

    /**
     * **Not override this method.**
     * @param id
     * @private
     */
    _getLastCudId(id : string) : string {
        const lastCudId = this._lastCudData.get(id);
        if(lastCudId){
            return lastCudId.id;
        }
        return DataboxUtils.generateStartCudId();
    }

    private async _fetchData(id : string,dbToken : DbToken,fetchInput : any,initData : any,zSocket : ZSocket,target ?: DBClientInputSessionTarget) : Promise<DbClientInputFetchResponse> {
        const session = DataboxUtils.getSession(dbToken.sessions,target);

        const currentCounter = session.c;
        session.c++;
        const data = await this.fetchData(id,currentCounter,session.d,fetchInput,initData,zSocket);

        return {
            c : currentCounter,
            d : data,
            t : await this._signDbToken(dbToken,id)
        };
    }

    private async _resetSession(id : string,dbToken : DbToken,target ?: DBClientInputSessionTarget) : Promise<string> {
        DataboxUtils.resetSession(dbToken.sessions,target);
        return this._signDbToken(dbToken,id);
    }

    private async _copySession(id : string,dbToken : DbToken,target ?: DBClientInputSessionTarget) : Promise<string> {
        DataboxUtils.copySession(dbToken.sessions,target);
        return this._signDbToken(dbToken,id);
    }

    /**
     * **Not override this method.**
     * Id valid check is used internally.
     * @param id
     * @private
     */
    async _checkIdIsValid(id : string) : Promise<void> {
        await this._idValidCheck(id);
    }

    /**
     * Returns the socket family member map or builds a new one and returns it.
     * @param id
     * @private
     */
    private _buildSocketFamilyMemberMap(id : string) : Map<UpSocket,DbSocketMemory> {
        let memberMap = this._regMember.get(id);
        if(!memberMap){
            memberMap = this._registerMember(id);
        }
        else {
            this._clearUnregisterMemberTimeout(id);
        }
        return memberMap;
    }

    /**
     * Connects a socket internally with the Databox, if it's not already connected.
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
            const inputChPrefix = `${this._dbEventPreFix}${id}-`;
            const inputChIds = new Set<string>();

            const unregisterSocketFunction = (inputChannelId ?: string) => {
                if(inputChannelId === undefined){
                    for(let inChId of inputChIds.values()) {
                       socket.off(inputChPrefix+inChId);
                    }
                    //will also delete the inputChannels set
                    this._disconnectSocket(socket,disconnectHandler,id);
                }
                else {
                    socket.off(inputChPrefix+inputChannelId);
                    inputChIds.delete(inputChannelId);
                    if(inputChIds.size === 0){
                        this._disconnectSocket(socket,disconnectHandler,id);
                    }
                }
            };

            //Otherwise, the disconnect event calls it with parameters.
            const disconnectHandler = () => unregisterSocketFunction();

            socketMemoryData = {
                inputChIds: inputChIds,
                unregisterSocket : unregisterSocketFunction
            };

            memberMap.set(socket,socketMemoryData);

            //socket member map
            let socketMemberSet = this._socketMembers.get(socket);
            if(!socketMemberSet){
                socketMemberSet = new Set<string>();
                this._socketMembers.set(socket,socketMemberSet);
            }
            socketMemberSet.add(id);

            socket.on('disconnect',disconnectHandler);
            DataboxAccessHelper.addDb(this,socket);
            this.onConnection(id,socket.zSocket);
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
        const memberMap = this._regMember.get(id);
        if(memberMap){
            memberMap.delete(socket);
            if(memberMap.size === 0){
                this._createUnregisterMemberTimeout(id);
            }
        }

        //socket member map
        const socketMemberSet = this._socketMembers.get(socket);
        if(socketMemberSet){
            socketMemberSet.delete(id);
            if(socketMemberSet.size === 0) {
                this._socketMembers.delete(socket);
            }
        }
    }

    /**
     * Clears the timeout to unregister the member.
     * @param id
     * @private
     */
    private _clearUnregisterMemberTimeout(id : string) : void {
        const timeout = this._unregisterMemberTimeoutMap.get(id);
        if(timeout !== undefined){clearTimeout(timeout);}
        this._unregisterMemberTimeoutMap.delete(id);
    }

    /**
     * Creates (set or renew) the timeout to unregister a member.
     * @param id
     * @private
     */
    private _createUnregisterMemberTimeout(id : string) : void {
        const timeout = this._unregisterMemberTimeoutMap.get(id);
        if(timeout !== undefined){clearTimeout(timeout);}
        this._unregisterMemberTimeoutMap.set(id,setTimeout(() => {
            this._unregisterMember(id);
            this._unregisterMemberTimeoutMap.delete(id);
        }, 120000));
    }

    /**
     * Registers for listening to a new family member.
     * @param id
     * @private
     */
    private _registerMember(id : string) : Map<UpSocket,DbSocketMemory> {
        const memberMap = new Map<UpSocket,DbSocketMemory>();
        this._regMember.set(id,memberMap);
        this._lastCudData.set(id,{timestamp : Date.now(),id : DataboxUtils.generateStartCudId()});
        this._scExchange.subscribe(this._dbEventPreFix+id)
            .watch(async (data) => {
                if((data as DbWorkerCudPackage).w !== this._workerFullId) {
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
        return memberMap;
    }

    /**
     * Unregisters for listening to a family member.
     * @param id
     * @private
     */
    private _unregisterMember(id : string) {
        this._regMember.delete(id);
        const channel = this._scExchange.channel(this._dbEventPreFix+id);
        channel.unwatch();
        channel.destroy();
        this._lastCudData.delete(id);
    }

    /**
     * Sends a Databox package to all sockets of a family member.
     * @param id
     * @param dbClientPackage
     */
    private _sendToSockets(id : string,dbClientPackage : DbClientOutputPackage) {
        const socketSet = this._regMember.get(id);
        if(socketSet){
            const outputCh = this._dbEventPreFix+id;
            for(let socket of socketSet.keys()) {
                socket.emit(outputCh,dbClientPackage);
            }
        }
    }

    /**
     * Sends a Databox cud package to sockets of the Databox after passing the cud middleware.
     * @param id
     * @param dbClientPackage
     * @private
     */
    private async _sendCudToSocketsWithMiddleware(id : string,dbClientPackage : DbClientOutputCudPackage) {

        const socketSet = this._regMember.get(id);

        if(socketSet){
            const outputCh = this._dbEventPreFix+id;
            const operations = dbClientPackage.d.o;
            const socketPromises : Promise<void>[] = [];

            for(let socket of socketSet.keys()) {

                const filteredOperations : CudOperation[] = [];
                const promises : Promise<void>[] = [];

                for(let i = 0; i < operations.length; i++){
                    const operation = CloneUtils.deepClone(operations[i]);
                    switch (operation.t) {
                        case CudType.update:
                            promises.push((async () => {
                                try {
                                    await this.updateMiddleware(id,socket.zSocket,operation.k,operation.v,(value) => {
                                        operation.d = value;
                                    },operation.c,operation.d);
                                    filteredOperations.push(operation);
                                }
                                catch (e) {}
                            })());
                            break;
                        case CudType.insert:
                            promises.push((async () => {
                                try {
                                    await this.insertMiddleware(id,socket.zSocket,operation.k,operation.v,(value) => {
                                        operation.d = value;
                                    },operation.c,operation.d);
                                    filteredOperations.push(operation);
                                }
                                catch (e) {}
                            })());
                            break;
                        case CudType.delete:
                            promises.push((async () => {
                                try {
                                    await this.deleteMiddleware(id,socket.zSocket,operation.k,operation.c,operation.d);
                                    filteredOperations.push(operation);
                                }
                                catch (e) {}
                            })());
                            break;
                    }
                }

                socketPromises.push(Promise.all(promises).then(() => {
                    if(filteredOperations.length > 0){
                        dbClientPackage.d.o = filteredOperations;
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
        this._sendCudToSockets(id,{a : DbClientOutputEvent.cud,d : cudPackage} as DbClientOutputCudPackage);
        //updated last cud id.
        const lastCudId = this._lastCudData.get(id);
        if((lastCudId && lastCudId.timestamp <= cudPackage.t) || !lastCudId){
            this._lastCudData.set(id,{id : cudPackage.ci, timestamp : cudPackage.t});
        }
    }

    /**
     * Fire before events.
     * @param id
     * @param cudOperations
     */
    private async _fireBeforeEvents(id : string,cudOperations : CudOperation[]){
        let promises : (Promise<void> | void)[] = [];
        for(let i = 0; i < cudOperations.length;i++) {
            const operation = cudOperations[i];
            switch (operation.t) {
                case CudType.insert:
                    promises.push(this.beforeInsert(id,operation.k,operation.v));
                    break;
                case CudType.update:
                    promises.push(this.beforeUpdate(id,operation.k,operation.v));
                    break;
                case CudType.delete:
                    promises.push(this.beforeDelete(id,operation.k));
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
        await this._fireBeforeEvents(id,preCudPackage.o);
        const cudPackage = DataboxUtils.buildCudPackage(preCudPackage,timestamp);
        this._sendToWorker(id,{
            a : DbWorkerAction.cud,
            d : cudPackage,
            w : this._workerFullId
        } as DbWorkerCudPackage);
        await this._processCudPackage(id,cudPackage);
    }

    private _broadcastToOtherSockets(id : string,clientPackage : DbClientOutputPackage) {
        this._sendToWorker(id,{
            a : DbWorkerAction.broadcast,
            d : clientPackage,
            w : this._workerFullId
        } as DbWorkerBroadcastPackage);
    }

    private _sendToWorker(id : string,workerPackage : DbWorkerPackage) {
        this._scExchange.publish(this._dbEventPreFix+id,workerPackage);
    }

    /**
     * Close the family member of this Databox.
     * @param id
     * @param closePackage
     * @private
     */
    private _close(id : string,closePackage : DbClientOutputClosePackage) {
        const memberMap = this._regMember.get(id);
        if(memberMap){
            const outputCh = this._dbEventPreFix+id;
            for(let [socket, socketMemory] of memberMap.entries()) {
                socket.emit(outputCh,closePackage);
                socketMemory.unregisterSocket();
            }
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
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param value
     * @param ifContains
     * @param timestamp
     * @param code
     * @param data
     */
    async insert(id : string | number,keyPath : string[] | string, value : any,{ifContains,timestamp,code,data} : IfContainsOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildInsert(keyPath,value,ifContains,code,data)),
            typeof id === "string" ? id : id.toString(),timestamp);
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
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param value
     * @param timestamp
     * @param code
     * @param data
     */
    async update(id : string | number,keyPath : string[] | string, value : any,{timestamp,code,data} : InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildUpdate(keyPath,value,code,data)),
            typeof id === "string" ? id : id.toString(),timestamp);
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
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param timestamp
     * @param code
     * @param data
     */
    async delete(id : string | number,keyPath : string[] | string,{timestamp,code,data} : InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildDelete(keyPath,code,data)),
            typeof id === "string" ? id : id.toString(),timestamp);
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
     * @param id The member of the family you want to edit.
     * Numbers will be converted to a string.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(id : string | number,timestamp ?: number) : DbCudOperationSequence {
        return new DbCudOperationSequence(async (operations) => {
            await this._emitCudPackage(
                DataboxUtils.buildPreCudPackage(...operations),
                typeof id === "string" ? id : id.toString(),timestamp);
        });
    }

    /**
     * **Not override this method.**
     * The close function will close the Databox with the id for every client on every server.
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
        const clientPackage = DataboxUtils.buildClientClosePackage(code,data);
        if(forEveryWorker){
            this._sendToWorker(id,
                {
                    a : DbWorkerAction.close,
                    d : clientPackage,
                    w : this._workerFullId
                } as DbWorkerClosePackage);
        }
        this._close(id,clientPackage);
    }

    /**
     * **Not override this method.**
     * The reload function will force all clients of the Databox to reload the data.
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
        const clientPackage = DataboxUtils.buildClientReloadPackage(code,data);
        if(forEveryWorker){
            this._broadcastToOtherSockets(id,clientPackage);
        }
        this._sendToSockets(id,clientPackage);
    }

    /**
     * **Not override this method.**
     * With this function, you can kick out a socket from a family member of the Databox.
     * This method is used internally.
     * @param id
     * @param socket
     * @param code
     * @param data
     */
    kickOut(id : string,socket : UpSocket,code ?: number | string,data ?: any) : void {
        const socketMap = this._regMember.get(id);
        if(socketMap){
            const socketMemory = socketMap.get(socket);
            if(socketMemory){
                socket.emit(this._dbEventPreFix+id,
                    {a : DbClientOutputEvent.kickOut,c : code,d : data} as DbClientOutputKickOutPackage);
                socketMemory.unregisterSocket();
            }
        }
    }

    /**
     * **Not override this method.**
     * This method returns a string array with all
     * member ids where the socket is registered.
     * This method is used internally.
     * @param socket
     */
    getSocketRegIds(socket : UpSocket) : string[] {
        const memberIds = this._socketMembers.get(socket);
        return memberIds ? Array.from(memberIds) : [];
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
     * Notice that the client can only merge components from the same type.
     * Otherwise, the new value will override the old value.
     * Whenever you are using the socket to filter secure data for a specific user,
     * you also have to use the cud middleware to filter the cud events for the socket.
     * You mostly should avoid this because if you are overwriting a cud middleware,
     * the Databox switches to a more costly performance implementation.
     * @param id
     * @param counter
     * @param session
     * @param input
     * @param initData
     * @param socket
     */
    protected fetchData(id : string,counter : number,session : any,input : any,initData : any,socket : ZSocket) : Promise<any> | any {
        this.noMoreDataAvailable();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Can be overridden.**
     * Check if the member id is valid for this DataboxFamily.
     * To block the id, you only need to return an object (that can be error information) or false.
     * If you want to allow the id, you have to return nothing or a true.
     * @param id
     * @param bag
     */
    public isIdValid(id : string,bag : Bag) : Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the Databox.
     * Can be used to insert the data in the database.
     * @param id
     * @param keyPath
     * @param value
     */
    protected beforeInsert(id : string,keyPath : string[],value : any) : Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an update of data in the Databox.
     * Can be used to update the data in the database.
     * @param id
     * @param keyPath
     * @param value
     */
    protected beforeUpdate(id : string,keyPath : string[],value : any) : Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before a delete of data in the Databox.
     * Can be used to delete the data in the database.
     * @param id
     * @param keyPath
     */
    protected beforeDelete(id : string,keyPath : string[]) : Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a new socket is connected to the Databox.
     */
    protected onConnection(id : string,socket : ZSocket) : Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a socket is disconnected from the Databox.
     * Notice that means all input channels are closed.
     */
    protected onDisconnection(id : string,socket : ZSocket) : Promise<void> | void {
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
     * @param id
     * @param socket
     * @param keyPath
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected insertMiddleware(id : string,socket : ZSocket,keyPath : string[],value : any,changeValue : ChangeValue,
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
     * @param id
     * @param socket
     * @param keyPath
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected updateMiddleware(id : string,socket : ZSocket,keyPath : string[],value : any,changeValue : ChangeValue,
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
     * @param id
     * @param socket
     * @param keyPath
     * @param code
     * @param data
     */
    protected deleteMiddleware(id : string,socket : ZSocket,keyPath : string[],
                                     code : string | number | undefined,data : any) : Promise<void> | void {
    }
}

DataboxFamily.prototype['insertMiddleware'][defaultSymbol] = true;
DataboxFamily.prototype['updateMiddleware'][defaultSymbol] = true;
DataboxFamily.prototype['deleteMiddleware'][defaultSymbol] = true;

export interface DataboxFamilyClass {
    config: DataboxConfig;

    new(name : string, bag: Bag, dbPreparedData : DbPreparedData, idValidCheck : IdValidChecker, apiLevel : number | undefined): DataboxFamily;

    prototype: any;
    name : string;

    readonly [databoxInstanceSymbol] : DataboxFamily | undefined;
}
