/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import DataboxCore, {DbPreparedData} from "./DataboxCore";
import Bag                           from "../Bag";
import UpSocket, {RespondFunction}   from "../../main/sc/socket";
import MemberCheckerUtils, {IsMemberChecker}             from "../../main/member/memberCheckerUtils";
import {ScExchange}                                      from "../../main/sc/scServer";
import {
    CudOperation,
    DATABOX_START_INDICATOR,
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
    IfOption,
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
    ChangeValue,
    DbToken,
    DbSelector,
    DbProcessedSelector,
    PotentialUpdateOption,
    PotentialInsertOption, IfOptionProcessed, DbClientInputSignalPackage, DataboxConnectReq, DataboxConnectRes
} from '../../main/databox/dbDefinitions';
import DataboxUtils           from "../../main/databox/databoxUtils";
import DbCudOperationSequence from "../../main/databox/dbCudOperationSequence";
import {ClientErrorName}      from "../../main/constants/clientErrorName";
import DataboxFetchManager, {FetchManagerBuilder} from "../../main/databox/databoxFetchManager";
import ZSocket                                    from "../../main/internalApi/zSocket";
import CloneUtils                                 from "../../main/utils/cloneUtils";
import {removeValueFromArray}                     from '../../main/utils/arrayUtils';
import {familyTypeSymbol}                         from '../../main/component/componentUtils';
import ObjectUtils                                from '../../main/utils/objectUtils';
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
 * family of Databoxes that only differ by an id (also named: member).
 * That is useful in a lot of cases, for example,
 * if you want to have a DataboxFamily for user profiles.
 * Than the Databoxes only differ by the ids of the users.
 *
 * You can override these methods:
 * - initialize
 * - fetch
 * - isMember
 *
 * events:
 * - beforeInsert
 * - beforeUpdate
 * - beforeDelete
 * - onConnection
 * - onDisconnection
 * - onReceivedSignal
 *
 * and the cud middleware methods:
 * - insertMiddleware
 * - updateMiddleware
 * - deleteMiddleware
 */
export default class DataboxFamily extends DataboxCore {

    /**
     * Maps the member to the sockets and remove socket function.
     */
    private readonly _regMember: Map<string,Map<UpSocket,DbSocketMemory>> = new Map();
    /**
     * Maps the sockets to the members.
     */
    private readonly _socketMembers: Map<UpSocket,Set<string>> = new Map<UpSocket, Set<string>>();
    private readonly _lastCudData: Map<string,{timestamp: number,id: string}> = new Map();
    private readonly _unregisterMemberTimeoutMap: Map<string,Timeout> = new Map();
    private readonly _isMemberCheck: IsMemberChecker;
    private readonly _dbEventPreFix: string;
    private readonly _scExchange: ScExchange;
    private readonly _workerFullId: string;
    private readonly _maxSocketInputChannels: number;

    private readonly _buildFetchManager: FetchManagerBuilder<typeof DataboxFamily.prototype._fetch>;
    private readonly _sendCudToSockets: (id: string,dbClientCudPackage: DbClientOutputCudPackage) => Promise<void> | void;
    private readonly _hasBeforeEventsListener: boolean;

    constructor(identifier: string, bag: Bag, dbPreparedData: DbPreparedData, apiLevel: number | undefined) {
        super(identifier,bag,dbPreparedData,apiLevel);
        this._isMemberCheck = MemberCheckerUtils.createIsMemberChecker(this.isMember.bind(this),this.bag);
        this._scExchange = bag.getWorker().scServer.exchange;
        this._workerFullId = bag.getWorker().getFullWorkerId();
        this._maxSocketInputChannels = dbPreparedData.maxSocketInputChannels;
        this._dbEventPreFix = `${DATABOX_START_INDICATOR}${this.identifier}${apiLevel !== undefined ? `@${apiLevel}`: ''}.`;

        this._buildFetchManager = DataboxFetchManager.buildFetchMangerBuilder
        (dbPreparedData.parallelFetch,dbPreparedData.maxBackpressure);
        this._sendCudToSockets = this._getSendCudToSocketsHandler();

        this._hasBeforeEventsListener = !this.beforeInsert[defaultSymbol] ||
            !this.beforeUpdate[defaultSymbol] || !this.beforeDelete[defaultSymbol];
    }

    /**
     * Returns the send cud to socket handler.
     * Uses only the complex send to socket cud (with middleware)
     * if at least one of the middleware function was overwritten.
     */
    private _getSendCudToSocketsHandler(): (member: string,dbClientCudPackage: DbClientOutputCudPackage) => Promise<void> | void {
        if(!this.insertMiddleware[defaultSymbol] ||
            !this.updateMiddleware[defaultSymbol] ||
            !this.deleteMiddleware[defaultSymbol])
        {
            return this._sendCudToSocketsWithMiddleware.bind(this);
        }
        else {
            return this._sendToSockets.bind(this);
        }
    }

    //Core
    async _processConRequest(socket: UpSocket, request: DataboxConnectReq): Promise<DataboxConnectRes> {
        const member = request.m;
        if(member == undefined){
            const err: any = new Error(`The family member is required to request a DataboxFamily.`);
            err.name = ClientErrorName.MemberMissing;
            throw err;
        }

        await this._isMember(member);
        await this._checkAccess(socket,{identifier: this.identifier,member});

        const dbToken: DbToken = typeof request.t === 'string' ?
            await this._processDbToken(request.t,member) : DataboxUtils.createDbToken(request.i);

        const processedInitData = await this._consumeInitInput(dbToken.rawInitData);
        if(typeof processedInitData === 'object'){ObjectUtils.deepFreeze(processedInitData);}

        const keys: DbRegisterResult = await this._registerSocket(socket,member,dbToken,processedInitData);

        return [keys.inputCh,keys.outputCh,this._getLastCudId(member),this.isParallelFetch()];
    }

    /**
     * @internal
     * **Not override this method.**
     * @param socket
     * @param member
     * @param dbToken
     * @param initData
     * @private
     */
    async _registerSocket(socket: UpSocket,member: string,dbToken: DbToken,initData: any): Promise<DbRegisterResult> {

        const {inputChIds,unregisterSocket} = this._connectSocket(socket,member);

        DataboxUtils.maxInputChannelsCheck(inputChIds.size,this._maxSocketInputChannels);

        //add input channel
        const chInputId = DataboxUtils.generateInputChId(inputChIds);
        inputChIds.add(chInputId);

        const outputCh = this._dbEventPreFix+member;
        const inputCh = outputCh+'-'+chInputId;

        const fetchManager = this._buildFetchManager();

        socket.on(inputCh,async (senderPackage: DbClientInputPackage, respond: RespondFunction) => {
            try {
                switch (senderPackage.a) {
                    case DbClientInputAction.signal:
                        if(typeof (senderPackage as DbClientInputSignalPackage).s as any === 'string'){
                            this.onReceivedSignal(member,socket.zSocket,(senderPackage as DbClientInputSignalPackage).s,
                                (senderPackage as DbClientInputSignalPackage).d);
                        }
                        else {
                            const err: any = new Error('Invalid package');
                            err.name = ClientErrorName.InvalidPackage;
                            // noinspection ExceptionCaughtLocallyJS
                            throw err;
                        }
                        break;
                    case DbClientInputAction.fetch:
                        const processedFetchInput = await this._consumeFetchInput((senderPackage as DbClientInputFetchPackage).i);
                        await fetchManager(
                            respond,
                            async () => {
                                return await this._fetch
                                (
                                    member,
                                    dbToken,
                                    processedFetchInput,
                                    initData,
                                    socket.zSocket,
                                    senderPackage.t
                                )
                            },DataboxUtils.isReloadTarget(senderPackage.t)
                        );
                        break;
                    case DbClientInputAction.resetSession:
                        respond(null,await this._resetSession(member,dbToken,senderPackage.t));
                        break;
                    case DbClientInputAction.copySession:
                        respond(null,await this._copySession(member,dbToken,senderPackage.t));
                        break;
                    case DbClientInputAction.disconnect:
                        unregisterSocket(chInputId);
                        respond(null);
                        break;
                    case DbClientInputAction.getLastCudId:
                        respond(null,this._getLastCudId(member));
                        break;
                    default :
                        const err: any = new Error('Unknown action');
                        err.name = ClientErrorName.UnknownAction;
                        // noinspection ExceptionCaughtLocallyJS
                        throw err;
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
     * @param member
     * @private
     */
    private _disconnectSocket(socket: UpSocket,disconnectHandler: () => void,member: string) {
        socket.off('disconnect',disconnectHandler);
        removeValueFromArray(socket.databoxes,this);
        this._rmSocket(socket,member);
        this.onDisconnection(member,socket.zSocket);
    }

    /**
     * @internal
     * **Not override this method.**
     * @param member
     * @private
     */
    _getLastCudId(member: string): string {
        const lastCudId = this._lastCudData.get(member);
        if(lastCudId){
            return lastCudId.id;
        }
        return DataboxUtils.generateStartCudId();
    }

    private async _fetch(member: string,dbToken: DbToken,fetchInput: any,initData: any,zSocket: ZSocket,target?: DBClientInputSessionTarget): Promise<DbClientInputFetchResponse> {
        const session = DataboxUtils.getSession(dbToken.sessions,target);
        const currentCounter = session.c;
        const clonedSessionData = CloneUtils.deepClone(session.d);
        try {
            const data = await this.fetch(member,currentCounter,clonedSessionData,fetchInput,initData,zSocket);

            //success fetch
            session.c++;
            session.d = clonedSessionData;

            return {
                c: currentCounter,
                d: data,
                t: await this._signDbToken(dbToken,member)
            };
        }
        catch (e) {
            e['counter'] = currentCounter;
            throw e;
        }
    }

    private async _resetSession(member: string,dbToken: DbToken,target?: DBClientInputSessionTarget): Promise<string> {
        DataboxUtils.resetSession(dbToken.sessions,target);
        return this._signDbToken(dbToken,member);
    }

    private async _copySession(member: string,dbToken: DbToken,target?: DBClientInputSessionTarget): Promise<string> {
        DataboxUtils.copySession(dbToken.sessions,target);
        return this._signDbToken(dbToken,member);
    }

    /**
     * @internal
     * **Not override this method.**
     * Is member check is used internally.
     * @param member
     * @private
     */
    _isMember(member: string): Promise<void> {
        return this._isMemberCheck(member);
    }

    /**
     * Returns the socket family member map or builds a new one and returns it.
     * @param member
     * @private
     */
    private _buildSocketFamilyMemberMap(member: string): Map<UpSocket,DbSocketMemory> {
        let memberMap = this._regMember.get(member);
        if(!memberMap){
            memberMap = this._registerMember(member);
        }
        else {
            this._clearUnregisterMemberTimeout(member);
        }
        return memberMap;
    }

    /**
     * Connects a socket internally with the Databox, if it's not already connected.
     * (To get updates of this family member)
     * @param socket
     * @param member
     * @private
     */
    private _connectSocket(socket: UpSocket,member: string): DbSocketMemory {
        const memberMap = this._buildSocketFamilyMemberMap(member);

        let socketMemoryData = memberMap.get(socket);
        if(!socketMemoryData){
            //new socket = connect
            const inputChPrefix = `${this._dbEventPreFix}${member}-`;
            const inputChIds = new Set<string>();

            const unregisterSocketFunction = (inputChannelId?: string) => {
                if(inputChannelId === undefined){
                    for(let inChId of inputChIds.values()) {
                       socket.off(inputChPrefix+inChId);
                    }
                    //will also delete the inputChannels set
                    this._disconnectSocket(socket,disconnectHandler,member);
                }
                else {
                    socket.off(inputChPrefix+inputChannelId);
                    inputChIds.delete(inputChannelId);
                    if(inputChIds.size === 0){
                        this._disconnectSocket(socket,disconnectHandler,member);
                    }
                }
            };

            //Otherwise, the disconnect event calls it with parameters.
            const disconnectHandler = () => unregisterSocketFunction();

            socketMemoryData = {
                inputChIds: inputChIds,
                unregisterSocket: unregisterSocketFunction
            };

            memberMap.set(socket,socketMemoryData);

            //socket member map
            let socketMemberSet = this._socketMembers.get(socket);
            if(!socketMemberSet){
                socketMemberSet = new Set<string>();
                this._socketMembers.set(socket,socketMemberSet);
            }
            socketMemberSet.add(member);

            socket.on('disconnect',disconnectHandler);
            socket.databoxes.push(this);
            this.onConnection(member,socket.zSocket);
        }
        return socketMemoryData;
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @param member
     * @private
     */
    private _rmSocket(socket: UpSocket,member: string){
        //main member socket map
        const memberMap = this._regMember.get(member);
        if(memberMap){
            memberMap.delete(socket);
            if(memberMap.size === 0){
                this._createUnregisterMemberTimeout(member);
            }
        }

        //socket member map
        const socketMemberSet = this._socketMembers.get(socket);
        if(socketMemberSet){
            socketMemberSet.delete(member);
            if(socketMemberSet.size === 0) {
                this._socketMembers.delete(socket);
            }
        }
    }

    /**
     * Clears the timeout to unregister the member.
     * @param member
     * @private
     */
    private _clearUnregisterMemberTimeout(member: string): void {
        const timeout = this._unregisterMemberTimeoutMap.get(member);
        if(timeout !== undefined){clearTimeout(timeout);}
        this._unregisterMemberTimeoutMap.delete(member);
    }

    /**
     * Creates (set or renew) the timeout to unregister a member.
     * @param member
     * @private
     */
    private _createUnregisterMemberTimeout(member: string): void {
        const timeout = this._unregisterMemberTimeoutMap.get(member);
        if(timeout !== undefined){clearTimeout(timeout);}
        this._unregisterMemberTimeoutMap.set(member,setTimeout(() => {
            this._unregisterMember(member);
            this._unregisterMemberTimeoutMap.delete(member);
        }, 120000));
    }

    /**
     * Registers for listening to a new family member.
     * @param member
     * @private
     */
    private _registerMember(member: string): Map<UpSocket,DbSocketMemory> {
        const memberMap = new Map<UpSocket,DbSocketMemory>();
        this._regMember.set(member,memberMap);
        this._lastCudData.set(member,{timestamp: Date.now(),id: DataboxUtils.generateStartCudId()});
        this._scExchange.subscribe(this._dbEventPreFix+member)
            .watch(async (data) => {
                if((data as DbWorkerCudPackage).w !== this._workerFullId) {
                    switch ((data as DbWorkerPackage).a) {
                        case DbWorkerAction.cud:
                            await this._processCudPackage(member,(data as DbWorkerCudPackage).d);
                            break;
                        case DbWorkerAction.close:
                            this._close(member,(data as DbWorkerClosePackage).d);
                            break;
                        case DbWorkerAction.broadcast:
                            this._sendToSockets(member,(data as DbWorkerBroadcastPackage).d);
                            break;
                        default:
                    }
                }
            });
        return memberMap;
    }

    /**
     * Unregisters for listening to a family member.
     * @param member
     * @private
     */
    private _unregisterMember(member: string) {
        this._regMember.delete(member);
        const channel = this._scExchange.channel(this._dbEventPreFix+member);
        channel.unwatch();
        channel.destroy();
        this._lastCudData.delete(member);
    }

    /**
     * Sends a Databox package to all sockets of a family member.
     * @param member
     * @param dbClientPackage
     */
    private _sendToSockets(member: string,dbClientPackage: DbClientOutputPackage) {
        const socketSet = this._regMember.get(member);
        if(socketSet){
            const outputCh = this._dbEventPreFix+member;
            for(let socket of socketSet.keys()) {
                socket.emit(outputCh,dbClientPackage);
            }
        }
    }

    /**
     * Sends a Databox cud package to sockets of the Databox after passing the cud middleware.
     * @param member
     * @param dbClientPackage
     * @private
     */
    private async _sendCudToSocketsWithMiddleware(member: string,dbClientPackage: DbClientOutputCudPackage) {

        const socketSet = this._regMember.get(member);

        if(socketSet){
            const outputCh = this._dbEventPreFix+member;
            const operations = dbClientPackage.d.o;
            const socketPromises: Promise<void>[] = [];

            for(let socket of socketSet.keys()) {

                const filteredOperations: CudOperation[] = [];
                const promises: Promise<void>[] = [];

                for(let i = 0; i < operations.length; i++){
                    const operation = CloneUtils.deepClone(operations[i]);
                    switch (operation.t) {
                        case CudType.update:
                            promises.push((async () => {
                                try {
                                    await this.updateMiddleware(member,socket.zSocket,operation.s,operation.v,(value) => {
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
                                    await this.insertMiddleware(member,socket.zSocket,operation.s,operation.v,(value) => {
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
                                    await this.deleteMiddleware(member,socket.zSocket,operation.s,operation.c,operation.d);
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
     * @param member
     * @param cudPackage
     */
    private async _processCudPackage(member: string,cudPackage: CudPackage){
        this._sendCudToSockets(member,{a: DbClientOutputEvent.cud,d: cudPackage} as DbClientOutputCudPackage);
        //updated last cud id.
        const lastCudId = this._lastCudData.get(member);
        if((lastCudId && lastCudId.timestamp <= cudPackage.t) || !lastCudId){
            this._lastCudData.set(member,{id: cudPackage.ci, timestamp: cudPackage.t});
        }
    }

    /**
     * Emit before events.
     * @param member
     * @param cudOperations
     */
    private async _emitBeforeEvents(member: string,cudOperations: CudOperation[]){
        let promises: (Promise<void> | void)[] = [];
        for(let i = 0; i < cudOperations.length;i++) {
            const operation = cudOperations[i];
            switch (operation.t) {
                case CudType.insert:
                    promises.push(this.beforeInsert(member,operation.s,operation.v,
                        {code: operation.c,data: operation.d,if: operation.i,potentialUpdate: !!operation.p,timestamp: operation.t}));
                    break;
                case CudType.update:
                    promises.push(this.beforeUpdate(member,operation.s,operation.v,
                        {code: operation.c,data: operation.d,if: operation.i,potentialInsert: !!operation.p,timestamp: operation.t}));
                    break;
                case CudType.delete:
                    promises.push(this.beforeDelete(member,operation.s,
                        {code: operation.c,data: operation.d,if: operation.i,timestamp: operation.t}));
                    break;
            }
        }
        await Promise.all(promises);
    }

    /**
     * @internal
     * **Not override this method.**
     * This method is used to send the cud package to
     * all workers and execute it on the current worker.
     * @param preCudPackage
     * @param member
     * @param timestamp
     */
    async _emitCudPackage(preCudPackage: PreCudPackage,member: string,timestamp?: number) {
        if(this._hasBeforeEventsListener) {
            await this._emitBeforeEvents(member,preCudPackage.o);
        }
        const cudPackage = DataboxUtils.buildCudPackage(preCudPackage,timestamp);
        this._sendToWorker(member,{
            a: DbWorkerAction.cud,
            d: cudPackage,
            w: this._workerFullId
        } as DbWorkerCudPackage);
        await this._processCudPackage(member,cudPackage);
    }

    private _broadcastToOtherSockets(member: string,clientPackage: DbClientOutputPackage) {
        this._sendToWorker(member,{
            a: DbWorkerAction.broadcast,
            d: clientPackage,
            w: this._workerFullId
        } as DbWorkerBroadcastPackage);
    }

    private _sendToWorker(member: string,workerPackage: DbWorkerPackage) {
        this._scExchange.publish(this._dbEventPreFix+member,workerPackage);
    }

    /**
     * Close the family member of this Databox.
     * @param member
     * @param closePackage
     * @private
     */
    private _close(member: string,closePackage: DbClientOutputClosePackage) {
        const memberMap = this._regMember.get(member);
        if(memberMap){
            const outputCh = this._dbEventPreFix+member;
            for(let [socket, socketMemory] of memberMap.entries()) {
                socket.emit(outputCh,closePackage);
                socketMemory.unregisterSocket();
            }
        }
    }

    /**
     * @internal
     * @param socket
     * @private
     */
    async _checkSocketHasStillAccess(socket: UpSocket): Promise<void> {
        const members = this.getSocketRegMembers(socket);
        for(let i = 0; i < members.length; i++){
            if(!(await this._preparedData.accessCheck(socket.authEngine,socket.zSocket,
                {identifier: this.identifier,member: members[i]})))
            {
                this.kickOut(members[i],socket);
            }
        }
    }

    /**
     * **Not override this method.**
     * Insert a new value in the Databox.
     * Notice that this method will only update the Databox.
     * It will not automatically update the database,
     * so you have to do it before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Insert behavior:
     * Notice that in every case, the insert only happens when the key
     * does not exist on the client.
     * Otherwise, the client will ignore or convert it to an
     * update when potentiallyUpdate is active.
     * Other conditions are that the timeout is newer than the existing
     * timeout and all if conditions are true.
     * Head (with selector [] or '') -> Inserts the value.
     * KeyArray -> Inserts the value at the end with the key.
     * But if you are using a compare function, it will insert the value in the correct position.
     * Object -> Insert the value with the key.
     * Array -> Key will be parsed to int if it is a number, then it will be inserted at the index.
     * Otherwise, it will be inserted at the end.
     * @param member The member of the family you want to update.
     * Number will be converted to a string.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value ($value or property value) by key ($key or property key) or
     * select all keys with {} (For better readability use the constant $all).
     * In the case of insertions, most times, the selector should end with
     * a new key instead of a query.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param value
     * @param ifContains
     * @param potentialUpdate
     * @param timestamp
     * @param code
     * @param data
     */
    async insert(member: string | number, selector: DbSelector, value: any, {if: ifOption,potentialUpdate,timestamp,code,data}: IfOption & PotentialUpdateOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildInsert(selector,value,ifOption,potentialUpdate,code,data)),
            typeof member === "string" ? member: member.toString(),timestamp);
    }

    /**
     * **Not override this method.**
     * Update a value in the Databox.
     * Notice that this method will only update the Databox.
     * It will not automatically update the database,
     * so you have to do it before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Update behavior:
     * Notice that in every case, the update only happens when the key
     * on the client does exist.
     * Otherwise, the client will ignore or convert it to an
     * insert when potentiallyInsert is active.
     * Other conditions are that the timeout is newer than the existing
     * timeout and all if conditions are true.
     * Head (with selector [] or '') -> Updates the complete structure.
     * KeyArray -> Updates the specific value.
     * Object -> Updates the specific value.
     * Array -> Key will be parsed to int if it is a number
     * it will update the specific value.
     * @param member The member of the family you want to update.
     * Number will be converted to a string.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value ($value or property value) by key ($key or property key) or
     * select all keys with {} (For better readability use the constant $all).
     * In the case of insertions, most times, the selector should end with
     * a new key instead of a query.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param value
     * @param ifContains
     * @param potentialInsert
     * @param timestamp
     * @param code
     * @param data
     */
    async update(member: string | number, selector: DbSelector, value: any, {if: ifOption,potentialInsert,timestamp,code,data}: IfOption & PotentialInsertOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildUpdate(selector,value,ifOption,potentialInsert,code,data)),
            typeof member === "string" ? member: member.toString(),timestamp);
    }

    /**
     * **Not override this method.**
     * Delete a value in the Databox.
     * Notice that this method will only update the Databox.
     * It will not automatically update the database,
     * so you have to do it before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Delete behavior:
     * Notice that in every case, the delete only happens when the key
     * on the client does exist.
     * Otherwise, the client will ignore it.
     * Other conditions are that the timeout is newer than the existing
     * timeout and all if conditions are true.
     * Head (with selector [] or '') -> Deletes the complete structure.
     * KeyArray -> Deletes the specific value.
     * Object -> Deletes the specific value.
     * Array -> Key will be parsed to int if it is a number it
     * will delete the specific value.
     * Otherwise, it will delete the last item.
     * @param member The member of the family you want to update.
     * Number will be converted to a string.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value ($value or property value) by key ($key or property key) or
     * select all keys with {} (For better readability use the constant $all).
     * In the case of insertions, most times, the selector should end with
     * a new key instead of a query.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param ifContains
     * @param timestamp
     * @param code
     * @param data
     */
    async delete(member: string | number, selector: DbSelector, {if: ifOption,timestamp,code,data}: IfOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildDelete(selector,ifOption,code,data)),
            typeof member === "string" ? member: member.toString(),timestamp);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Sequence edit the Databox.
     * This method is ideal for doing multiple changes on a Databox
     * because it will pack them all together and send them all in ones.
     * Notice that this method will only update the Databox.
     * It will not automatically update the database,
     * so you have to do it before calling this method.
     * @param member The member of the family you want to edit.
     * Numbers will be converted to a string.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(member: string | number,timestamp?: number): DbCudOperationSequence {
        return new DbCudOperationSequence(async (operations) => {
            await this._emitCudPackage(
                DataboxUtils.buildPreCudPackage(...operations),
                typeof member === "string" ? member: member.toString(),timestamp);
        });
    }

    /**
     * **Not override this method.**
     * The close function will close a Databox member for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param member The member of the family you want to close.
     * Numbers will be converted to a string.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(member: string | number,code?: number | string,data?: any,forEveryWorker: boolean = true){
        member = typeof member === "string" ? member: member.toString();
        const clientPackage = DataboxUtils.buildClientClosePackage(code,data);
        if(forEveryWorker){
            this._sendToWorker(member,
                {
                    a: DbWorkerAction.close,
                    d: clientPackage,
                    w: this._workerFullId
                } as DbWorkerClosePackage);
        }
        this._close(member,clientPackage);
    }

    /**
     * **Not override this method.**
     * The reload function will force all clients of the Databox member to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param member
     * Numbers will be converted to a string.
     * @param forEveryWorker
     * @param code
     * @param data
     */
    doReload(member: string | number,forEveryWorker: boolean = false,code?: number | string,data?: any){
        member = typeof member === "string" ? member: member.toString();
        const clientPackage = DataboxUtils.buildClientReloadPackage(code,data);
        if(forEveryWorker){
            this._broadcastToOtherSockets(member,clientPackage);
        }
        this._sendToSockets(member,clientPackage);
    }

    /**
     * **Not override this method.**
     * With this function, you can kick out a socket from a family member of the Databox.
     * This method is used internally.
     * @param member
     * @param socket
     * @param code
     * @param data
     */
    kickOut(member: string | number,socket: UpSocket,code?: number | string,data?: any): void {
        member = typeof member === "string" ? member: member.toString();
        const memberMap = this._regMember.get(member);
        if(memberMap){
            const socketMemory = memberMap.get(socket);
            if(socketMemory){
                socket.emit(this._dbEventPreFix+member,
                    {a: DbClientOutputEvent.kickOut,c: code,d: data} as DbClientOutputKickOutPackage);
                socketMemory.unregisterSocket();
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Transmit a signal to all client Databoxes that
     * are connected with a specific member of this Databox.
     * The clients can listen to any received signal.
     * You also can send additional data with the signal.
     * @param member
     * Numbers will be converted to a string.
     * @param signal
     * @param data
     * @param forEveryWorker
     */
    transmitSignal(member: string | number, signal: string, data?: any, forEveryWorker: boolean = true) {
        member = typeof member === "string" ? member: member.toString();
        const clientPackage = DataboxUtils.buildClientSignalPackage(signal,data);
        if(forEveryWorker){
            this._broadcastToOtherSockets(member,clientPackage);
        }
        this._sendToSockets(member,clientPackage);
    }

    /**
     * **Not override this method.**
     * This method returns a string array with all
     * members where the socket is registered.
     * This method is used internally.
     * @param socket
     */
    getSocketRegMembers(socket: UpSocket): string[] {
        const members = this._socketMembers.get(socket);
        return members ? Array.from(members): [];
    }

    /**
     * **Can be overridden.**
     * This method is used to fetch data for the clients of the Databox.
     * A client can call that method multiple times to fetch more and more data.
     * You usually request data from your database and return it, and if no more data is available,
     * you should throw a NoMoreDataAvailableError or call the internal noMoreDataAvailable method.
     * If no data is available, for example the profile with the id ten is not found,
     * you can throw a NoDataAvailableError or call the internal noDataAvailable method.
     * The counter parameter indicates the number of the current call, it starts counting at zero.
     * Notice that the counter only increases when the fetch was successful (means no error was thrown).
     * The client can send additional data when calling the fetch process (fetchInput),
     * this data is available as the input parameter.
     * Also, you extra get a session object, this object you can use to save variables that are
     * important to get more data in the future, for example, the last id of the item that the client had received.
     * The session object is only available on the server-side and can not be modified on the client-side.
     * If the fetch was not successful and you modified the session object in the fetch, all changes will be reverted.
     * Notice that you only can store JSON convertible data in the session.
     *
     * If you design the Databox in such a way that the next fetch is not depending on the previous one,
     * you can activate the parallelFetch option in the Databox config.
     *
     * The data that you are returning can be of any type.
     * The client will convert some data parts into specific databox storage components.
     * These components will allow you to access specific values with a selector.
     * There are three of them:
     * The Object:
     * It is a simple component that has no sequence, and you can access the values via property keys.
     * The client will convert each JSON object to this component.
     *
     * The KeyArray:
     * This component allows you to keep data in a specific sequence,
     * but you still able to access the values via a string key.
     * To build a key-array, you can use the buildKeyArray function.
     * Notice that JSON arrays will not be converted to this component type.
     *
     * The Array:
     * This component is a light way and simple component for an array.
     * Instead of the key-array, you only can access values via an array index.
     * Also, a difference is that the sequence of the elements is connected to the key (index).
     * That means sorting the values changes the keys.
     * All JSON arrays will be converted to this type.
     * If you need resorting, more specific keys, or you manipulate lots of data in the array,
     * you should use the key-array instead.
     *
     * When loading more data, the client will merge these data by using these components.
     * But notice that the client can only merge components from the same type.
     * Otherwise, the new value will override the old value.
     *
     * Whenever you are using the socket to filter secure data for a specific user,
     * you also have to use the cud middleware to filter the cud events for the socket.
     * You mostly should avoid this because if you are overwriting a cud middleware,
     * the Databox switches to a more costly performance implementation.
     * @param member
     * @param counter
     * @param session
     * @param input
     * @param initData
     * @param socket
     */
    protected fetch(member: string, counter: number, session: any, input: any, initData: any, socket: ZSocket): Promise<any> | any {
        this.noDataAvailable();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Can be overridden.**
     * Check if it is a member of the DataboxFamily.
     * Use this check only for security reason, for example,
     * checking the format of the value.
     * To mark the value as invalid,
     * you only need to return an object (that can be error information) or false.
     * Also if you throw an error, the value is marked as invalid.
     * If you want to mark the value as a member,
     * you have to return nothing or a true.
     * @param value
     * @param bag
     */
    public isMember(value: string, bag: Bag): Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the Databox.
     * The databox will only emit before events when you overwrite at least one of them.
     * @param member
     * @param selector
     * @param value
     * @param options
     */
    protected beforeInsert(member: string, selector: DbProcessedSelector, value: any,
                           options: IfOptionProcessed & PotentialUpdateOption & InfoOption & TimestampOption): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an update of data in the Databox.
     * The databox will only emit before events when you overwrite at least one of them.
     * @param member
     * @param selector
     * @param value
     * @param options
     */
    protected beforeUpdate(member: string, selector: DbProcessedSelector, value: any,
                           options: IfOptionProcessed & PotentialInsertOption & InfoOption & TimestampOption): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before a delete of data in the Databox.
     * The databox will only emit before events when you overwrite at least one of them.
     * @param member
     * @param selector
     * @param options
     */
    protected beforeDelete(member: string,selector: DbProcessedSelector,
                           options: IfOptionProcessed & InfoOption & TimestampOption): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a new socket is connected to the Databox.
     */
    protected onConnection(member: string,socket: ZSocket): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a socket is disconnected from the Databox.
     * Notice that means all input channels are closed.
     */
    protected onDisconnection(member: string,socket: ZSocket): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a
     * socket from this Databox received a signal.
     */
    protected onReceivedSignal(member: string, socket: ZSocket, signal: string, data: any): Promise<void> | void {
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
     * @param member
     * @param socket
     * @param selector
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected insertMiddleware(member: string, socket: ZSocket, selector: DbProcessedSelector, value: any, changeValue: ChangeValue,
                               code: string | number | undefined, data: any): Promise<void> | void {
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
     * @param member
     * @param socket
     * @param selector
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected updateMiddleware(member: string, socket: ZSocket, selector: DbProcessedSelector, value: any, changeValue: ChangeValue,
                               code: string | number | undefined, data: any): Promise<void> | void {
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
     * @param member
     * @param socket
     * @param selector
     * @param code
     * @param data
     */
    protected deleteMiddleware(member: string,socket: ZSocket,selector: DbProcessedSelector,
                                     code: string | number | undefined,data: any): Promise<void> | void {
    }
}

DataboxFamily.prototype[familyTypeSymbol] = true;

DataboxFamily.prototype['insertMiddleware'][defaultSymbol] = true;
DataboxFamily.prototype['updateMiddleware'][defaultSymbol] = true;
DataboxFamily.prototype['deleteMiddleware'][defaultSymbol] = true;

DataboxFamily.prototype['beforeInsert'][defaultSymbol] = true;
DataboxFamily.prototype['beforeUpdate'][defaultSymbol] = true;
DataboxFamily.prototype['beforeDelete'][defaultSymbol] = true;

export type DataboxFamilyClass = typeof DataboxFamily;