/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import DataboxCore, {DbPreparedData} from "./DataboxCore";
import Bag                           from "../Bag";
import {RespondFunction}             from "../../main/sc/socket";
// noinspection ES6PreferShortImport
import {block}                                           from '../../main/middlewares/block';
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
    DbToken,
    DbSelector,
    DbProcessedSelector,
    PotentialUpdateOption,
    PotentialInsertOption,
    IfOptionProcessed,
    DbClientInputSignalPackage,
    DataboxConnectReq,
    DataboxConnectRes,
    DbClientOutputSignalPackage,
    DbWorkerSignalPackage, DbWorkerCudDataRequestPackage, DbMemberMemory, DbLastCudDataMemory, DbWorkerCudDataResponsePackage, DbWorkerRecheckMemberAccessPackage
} from '../../main/databox/dbDefinitions';
import {DbFamilyInConnection,
    DeleteAction,
    FetchRequest,
    InsertAction,
    SignalAction,
    UpdateAction} from './DataboxApiDefinitions';
import DataboxUtils           from "../../main/databox/databoxUtils";
import DbCudOperationSequence from "../../main/databox/dbCudOperationSequence";
import {ClientErrorName}      from "../../main/definitions/clientErrorName";
import DataboxFetchManager, {FetchManagerBuilder} from "../../main/databox/databoxFetchManager";
import Socket                                     from "../Socket";
import CloneUtils                                 from "../../main/utils/cloneUtils";
import {removeValueFromArray}                     from '../../main/utils/arrayUtils';
import {familyTypeSymbol}                         from '../../main/component/componentUtils';
import ObjectUtils                                from '../../main/utils/objectUtils';
import FuncUtils                                  from '../../main/utils/funcUtils';
import {isDefaultImpl, markAsDefaultImpl}         from '../../main/utils/defaultImplUtils';
import Timeout                                    = NodeJS.Timeout;
import NoDataError                                from '../../main/databox/noDataError';
import MiddlewaresPreparer, {MiddlewareInvoker}   from '../../main/middlewares/middlewaresPreparer';

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
 * - fetch / singleFetch
 *
 * events:
 * - onConnection
 * - onDisconnection
 * - onReceivedSignal
 * - (beforeInsert)
 * - (beforeUpdate)
 * - (beforeDelete)
 *
 * middleware methods:
 * cud
 * - insertMiddleware
 * - updateMiddleware
 * - deleteMiddleware
 * other
 * - memberMiddleware
 * - signalMiddleware
 */
export default class DataboxFamily extends DataboxCore {

    /**
     * Holds all information about every registered member.
     */
    private readonly _regMembers: Map<string,DbMemberMemory> = new Map();
    /**
     * Maps the sockets to the members.
     */
    private readonly _socketMembers: Map<Socket,Set<string>> = new Map<Socket, Set<string>>();

    private readonly _unregisterMemberTimeoutMap: Map<string,Timeout> = new Map();
    private readonly _dbEventPreFix: string;
    private readonly _scExchange: ScExchange;
    private readonly _workerFullId: string;
    private readonly _maxSocketInputChannels: number;
    private readonly _maxSocketMembers: number;

    private readonly _fetchImpl: (request: FetchRequest, connection: DbFamilyInConnection, session: Record<string, any>) => Promise<any> | any;
    private readonly _buildFetchManager: FetchManagerBuilder<typeof DataboxFamily.prototype._fetch>;
    private readonly _sendCudToSockets: (member: string,dbClientCudPackage: DbClientOutputCudPackage) => Promise<void> | void;
    private readonly _sendSignalToSockets: (member: string,dbClientPackage: DbClientOutputSignalPackage) => Promise<void> | void;
    private readonly _definedInsertMiddleware = !isDefaultImpl(this.insertMiddleware);
    private readonly _definedUpdateMiddleware = !isDefaultImpl(this.updateMiddleware);
    private readonly _definedDeleteMiddleware = !isDefaultImpl(this.deleteMiddleware);
    private readonly _hasBeforeEventsListener: boolean;

    private readonly _onConnection: (member: string, socket: Socket) => Promise<void> | void;
    private readonly _onDisconnection: (member: string, socket: Socket) => Promise<void> | void;
    private readonly _onReceivedSignal: (connection: DbFamilyInConnection, signal: string, data: any) => Promise<void> | void;
    private readonly _memberMiddleware: MiddlewareInvoker<typeof DataboxFamily['prototype']['memberMiddleware']>;

    constructor(identifier: string, bag: Bag, dbPreparedData: DbPreparedData, apiLevel: number | undefined) {
        super(identifier,bag,dbPreparedData,apiLevel);
        this._scExchange = bag.getWorker().scServer.exchange;
        this._workerFullId = bag.getWorker().getFullWorkerId();
        this._maxSocketInputChannels = dbPreparedData.maxSocketInputChannels;
        this._maxSocketMembers = dbPreparedData.maxSocketMembers;
        this._dbEventPreFix = `${DATABOX_START_INDICATOR}${this.identifier}${apiLevel !== undefined ? `@${apiLevel}`: ''}.`;

        this._fetchImpl = this._getFetchImpl();
        this._buildFetchManager = DataboxFetchManager.buildFetchMangerBuilder
        (dbPreparedData.parallelFetch,dbPreparedData.maxBackpressure);
        this._sendCudToSockets = this._getSendCudToSocketsHandler();
        this._sendSignalToSockets = isDefaultImpl(this.transmitSignalMiddleware) ?
            this._sendToSockets.bind(this) : this._sendSignalToSocketsWithMiddleware.bind(this);

        this._hasBeforeEventsListener = !isDefaultImpl(this.beforeInsert) ||
            !isDefaultImpl(this.beforeUpdate) || !isDefaultImpl(this.beforeDelete);

        const errMessagePrefix = this.toString() + ' error was thrown in the function';
        this._onConnection = FuncUtils.createSafeCaller(this.onConnection,
            `${errMessagePrefix} onConnection`,this._errorEvent);
        this._onDisconnection = FuncUtils.createSafeCaller(this.onDisconnection,
            `${errMessagePrefix} onDisconnection`,this._errorEvent);
        this._onReceivedSignal = FuncUtils.createSafeCaller(this.onReceivedSignal,
            `${errMessagePrefix} onReceivedSignal`,this._errorEvent);
        this._memberMiddleware = MiddlewaresPreparer.createMiddlewareAsyncSafeInvoker(
            !isDefaultImpl(this.memberMiddleware) ? this.memberMiddleware : undefined,
            true, this.toString() + ' error was thrown in the member middleware', this._errorEvent);
    }

    private _getFetchImpl(): (request: FetchRequest, connection: DbFamilyInConnection, session: Record<string, any>) => Promise<any> | any {
        if(!isDefaultImpl(this.singleFetch)) {
            return (request,connection) => {
                if(request.counter === 0){
                    return this.singleFetch(request,connection);
                }
                else throw new NoDataError(1);
            };
        }
        else {
            return this.fetch.bind(this);
        }
    }

    /**
     * Returns the send cud to socket handler.
     * Uses only the complex send to socket cud (with middleware)
     * if at least one of the middleware function was overwritten.
     */
    private _getSendCudToSocketsHandler(): (member: string,dbClientCudPackage: DbClientOutputCudPackage) => Promise<void> | void {
        if(this._definedInsertMiddleware ||
            this._definedUpdateMiddleware ||
            this._definedDeleteMiddleware)
        {
            return this._sendCudToSocketsWithMiddleware.bind(this);
        }
        else {
            return this._sendToSockets.bind(this);
        }
    }

    //Core
    async _processConRequest(socket: Socket, request: DataboxConnectReq): Promise<DataboxConnectRes> {
        const member = request.m;
        if(member == undefined){
            const err: any = new Error(`The family member is required to request a DataboxFamily.`);
            err.name = ClientErrorName.MemberMissing;
            throw err;
        }

        const memberMidRes = await this._memberMiddleware(member);
        if(memberMidRes) throw memberMidRes;

        await this._checkAccess(socket,{identifier: this.identifier,member});

        const memberSet = this._socketMembers.get(socket);
        DataboxUtils.maxMembersCheck(memberSet ? memberSet.size : 0,this._maxSocketMembers);

        const dbToken: DbToken = typeof request.t === 'string' ?
            await this._processDbToken(request.t,member) : DataboxUtils.createDbToken(request.o);

        const processedOptions = await this._consumeOptionsInput(dbToken.rawOptions);
        if(typeof processedOptions === 'object') ObjectUtils.deepFreeze(processedOptions);

        const keys: DbRegisterResult = await this._registerSocket(socket,member,dbToken,processedOptions);
        const resp: DataboxConnectRes = {
            i: keys.inputCh,
            o: keys.outputCh,
            lc: this._getLastCudId(member),
            p: this.isParallelFetch(),
        };
        if(this._initialData !== undefined) resp.id = this._initialData;
        if(this._parsedReloadStrategy != null) resp.rs = this._parsedReloadStrategy;
        return resp;
    }

    /**
     * @internal
     * **Not override this method.**
     * @param socket
     * @param member
     * @param dbToken
     * @param options
     * @private
     */
    private async _registerSocket(socket: Socket, member: string, dbToken: DbToken, options: any): Promise<DbRegisterResult> {

        const {inputChIds,unregisterSocket} = await this._connectSocket(socket,member);

        DataboxUtils.maxInputChannelsCheck(inputChIds.size,this._maxSocketInputChannels);

        //add input channel
        const chInputId = DataboxUtils.generateInputChId(inputChIds);
        inputChIds.add(chInputId);

        const outputCh = this._dbEventPreFix+member;
        const inputCh = outputCh+'-'+chInputId;
        const dbInConnection: DbFamilyInConnection = Object.freeze({member,socket,options: options,created: Date.now()});

        const fetchManager = this._buildFetchManager();

        socket._on(inputCh,async (senderPackage: DbClientInputPackage, respond: RespondFunction) => {
            try {
                switch (senderPackage.a) {
                    case DbClientInputAction.signal:
                        if(typeof (senderPackage as DbClientInputSignalPackage).s as any === 'string'){
                            this._onReceivedSignal(dbInConnection,(senderPackage as DbClientInputSignalPackage).s,
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
                            async () => this._fetch
                            (
                                dbToken,
                                processedFetchInput,
                                dbInConnection,
                                senderPackage.t
                            ),DataboxUtils.isReloadTarget(senderPackage.t)
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
    private _disconnectSocket(socket: Socket, disconnectHandler: () => void, member: string) {
        socket._off('disconnect',disconnectHandler);
        removeValueFromArray(socket.getDataboxes(),this);
        this._rmSocket(socket,member);
        this._onDisconnection(member,socket);
    }

    /**
     * @internal
     * **Not override this method.**
     * @param member
     * @private
     */
    _getLastCudId(member: string): string {
        const lastCudId = this._regMembers.get(member);
        if(lastCudId) return lastCudId.lastCudData.id;
        return DataboxUtils.generateStartCudId();
    }

    private async _fetch(dbToken: DbToken, fetchInput: any, connection: DbFamilyInConnection, target?: DBClientInputSessionTarget): Promise<DbClientInputFetchResponse> {
        const session = DataboxUtils.getSession(dbToken.sessions,target);
        const currentCounter = session.c;
        const clonedSessionData = CloneUtils.deepClone(session.d);
        const timestamp = Date.now();
        try {
            const data = this._fetchImpl({
                counter: currentCounter,
                input: fetchInput,
                reload: target === DBClientInputSessionTarget.reloadSession
            },connection,clonedSessionData);

            if(data == null) { // noinspection ExceptionCaughtLocallyJS
                throw new NoDataError(2);
            }

            //success fetch
            session.c++;
            session.d = clonedSessionData;

            return {
                c: currentCounter,
                d: data,
                t: await this._signDbToken(dbToken,connection.member),
                ti: timestamp
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
     * Access the socket family member mem securely.
     * Will automatically build unknown members.
     * @param member
     * @private
     */
    private async _accessFamilyMember(member: string): Promise<DbMemberMemory> {
        let memberMem = this._regMembers.get(member);
        if(!memberMem) memberMem = await this._registerMember(member);
        else this._clearUnregisterMemberTimeout(member);
        if(memberMem.lastCudData.fetchPromise) await memberMem.lastCudData.fetchPromise;
        return memberMem;
    }

    /**
     * Connects a socket internally with the Databox, if it's not already connected.
     * (To get updates of this family member)
     * @param socket
     * @param member
     * @private
     */
    private async _connectSocket(socket: Socket, member: string): Promise<DbSocketMemory> {
        const memberMem = await this._accessFamilyMember(member);

        let socketMemoryData = memberMem.sockets.get(socket);
        if(!socketMemoryData){
            //new socket = connect
            const inputChPrefix = `${this._dbEventPreFix}${member}-`;
            const inputChIds = new Set<string>();

            const unregisterSocketFunction = (inputChannelId?: string) => {
                if(inputChannelId === undefined){
                    for(let inChId of inputChIds.values()) {
                       socket._off(inputChPrefix+inChId);
                    }
                    //will also delete the inputChannels set
                    this._disconnectSocket(socket,disconnectHandler,member);
                }
                else {
                    socket._off(inputChPrefix+inputChannelId);
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

            memberMem.sockets.set(socket,socketMemoryData);

            //socket member map
            let socketMemberSet = this._socketMembers.get(socket);
            if(!socketMemberSet){
                socketMemberSet = new Set<string>();
                this._socketMembers.set(socket,socketMemberSet);
            }
            socketMemberSet.add(member);

            socket._on('disconnect',disconnectHandler);
            socket.getDataboxes().push(this);
            this._onConnection(member,socket);
        }
        return socketMemoryData;
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @param member
     * @private
     */
    private _rmSocket(socket: Socket, member: string){
        //main member socket map
        const memberMap = this._regMembers.get(member);
        if(memberMap){
            memberMap.sockets.delete(socket);
            if(memberMap.sockets.size === 0){
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
        if(timeout !== undefined) clearTimeout(timeout);
        this._unregisterMemberTimeoutMap.delete(member);
    }

    /**
     * Creates (set or renew) the timeout to unregister a member.
     * @param member
     * @private
     */
    private _createUnregisterMemberTimeout(member: string): void {
        const timeout = this._unregisterMemberTimeoutMap.get(member);
        if(timeout !== undefined) clearTimeout(timeout);
        this._unregisterMemberTimeoutMap.set(member,setTimeout(() => {
            this._unregisterMember(member);
            this._unregisterMemberTimeoutMap.delete(member);
        }, this._unregisterDelay));
    }

    private _initLastCudDataMemory(member: string): DbLastCudDataMemory {
        if(this._preparedData.fetchLastCudData) {
            const lastCudData: Partial<DbLastCudDataMemory> = {
                id: DataboxUtils.generateStartCudId(),
                timestamp: 0
            };
            lastCudData.fetchPromise = new Promise<void>((res) => {
                const timeout = setTimeout(() => {
                    lastCudData.fetchResolve = undefined;
                    res();
                },this._preparedData.fetchLastCudData as number);
                lastCudData.fetchResolve = () => {
                    lastCudData.fetchResolve = undefined;
                    clearTimeout(timeout);
                    res();
                };
                this._sendToWorkers(member,[this._workerFullId,DbWorkerAction.cudDataRequest] as DbWorkerCudDataRequestPackage);
            });
            return lastCudData as DbLastCudDataMemory;
        }
        else return {
            id: DataboxUtils.generateStartCudId(),
            timestamp: 0
        }
    }

    /**
     * Registers for listening to a new family member.
     * @param member
     * @private
     */
    private _registerMember(member: string): DbMemberMemory {

        //Important non-async usage otherwise, the risk of missing a worker response to a cud request exists.
        const lastCudData = this._initLastCudDataMemory(member)
        const memberMap: DbMemberMemory = {
            sockets: new Map<Socket,DbSocketMemory>(),
            lastCudData: lastCudData
        };
        this._regMembers.set(member,memberMap);


        this._scExchange.subscribe(this._dbEventPreFix+member)
            .watch(async (data: DbWorkerPackage) => {
                if(data[0] !== this._workerFullId) {
                    switch (data[1]) {
                        case DbWorkerAction.cud:
                            await this._processCudPackage(member,(data as DbWorkerCudPackage)[2]);
                            break;
                        case DbWorkerAction.signal:
                            await this._sendSignalToSockets(member,(data as DbWorkerSignalPackage)[2]);
                            break;
                        case DbWorkerAction.close:
                            this._close(member,(data as DbWorkerClosePackage)[2]);
                            break;
                        case DbWorkerAction.broadcast:
                            this._sendToSockets(member,(data as DbWorkerBroadcastPackage)[2]);
                            break;
                        case DbWorkerAction.cudDataRequest:
                            if(lastCudData.timestamp <= 0) return;
                            this._sendToWorkers(member,[this._workerFullId,DbWorkerAction.cudDataResponse,
                                lastCudData.timestamp, lastCudData.id] as DbWorkerCudDataResponsePackage);
                            break;
                        case DbWorkerAction.cudDataResponse:
                            this._updateLastCudData(member,(data as DbWorkerCudDataResponsePackage)[2],(data as DbWorkerCudDataResponsePackage)[3]);
                            break;
                        case DbWorkerAction.recheckMemberAccess:
                            await this._recheckMemberAccess(member);
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
        this._regMembers.delete(member);
        const channel = this._scExchange.channel(this._dbEventPreFix+member);
        channel.unwatch();
        channel.destroy();
    }

    /**
     * Sends a Databox package to all sockets of a family member.
     * @param member
     * @param dbClientPackage
     */
    private _sendToSockets(member: string,dbClientPackage: DbClientOutputPackage) {
        const socketSet = this._regMembers.get(member);
        if(socketSet){
            const outputCh = this._dbEventPreFix+member;
            for(const socket of socketSet.sockets.keys()) {
                socket._emit(outputCh,dbClientPackage);
            }
        }
    }

    /**
     * Sends a Databox signal package to sockets of the Databox after passing the signal middleware.
     * @param member
     * @param dbClientPackage
     * @private
     */
    private async _sendSignalToSocketsWithMiddleware(member: string,dbClientPackage: DbClientOutputSignalPackage) {

        const memberMem = this._regMembers.get(member);
        if(!memberMem) return;

        const outputCh = this._dbEventPreFix+member;
        const preAction = {signal: dbClientPackage.s, data: dbClientPackage.d};
        const middlewareInvoker = async (socket: Socket) => {
            try {
                let dbPackage = dbClientPackage;
                await this.transmitSignalMiddleware(member,socket,{...preAction, changeData: (data) => {
                    dbPackage = {...dbPackage,d: data};
                }})
                socket._emit(outputCh,dbPackage);
            }
            catch (err) {
                if(err !== block)
                    this._handleUnexpectedMiddlewareError(err,nameof<DataboxFamily>(s => s.transmitSignalMiddleware))
            }
        }

        const promises: Promise<void>[] = [];
        for(const socket of memberMem.sockets.keys())
            promises.push(middlewareInvoker(socket));
        await Promise.all(promises);
    }

    /**
     * Sends a Databox cud package to sockets of the Databox after passing the cud middleware.
     * @param member
     * @param dbClientPackage
     * @private
     */
    private async _sendCudToSocketsWithMiddleware(member: string,dbClientPackage: DbClientOutputCudPackage) {

        const memberMem = this._regMembers.get(member);
        if(!memberMem) return;

        const operations = dbClientPackage.d.o;
        const operationsLookUps: ((socket: Socket, filteredOperations: CudOperation[]) => Promise<void>)[] = [];
        const startOperations: CudOperation[] = [];

        const operationsLen = operations.length;
        for(let i = 0; i < operationsLen; i++) {
            const operation = operations[i];
            switch (operation.t) {
                case CudType.update:
                    if(!this._definedUpdateMiddleware) startOperations.push(operation);
                    else {
                        const preAction = {selector: operation.s,value: operation.v,code: operation.c,data: operation.d};
                        operationsLookUps.push(async (socket, filteredOperations) => {
                            try {
                                let innerOperation = operation;
                                await this.updateMiddleware(member, socket,{...preAction, changeValue: (value) => {
                                        innerOperation = {...innerOperation,v: value};
                                    }});
                                filteredOperations.push(innerOperation);
                            }
                            catch (err) {
                                if(err !== block)
                                    this._handleUnexpectedMiddlewareError(err,nameof<DataboxFamily>(s => s.updateMiddleware))
                            }
                        })
                    }
                    continue;
                case CudType.insert:
                    if(!this._definedInsertMiddleware) startOperations.push(operation);
                    else {
                        const preAction = {selector: operation.s,value: operation.v,code: operation.c,data: operation.d};
                        operationsLookUps.push(async (socket, filteredOperations) => {
                            try {
                                let innerOperation = operation;
                                await this.insertMiddleware(member, socket,{...preAction, changeValue: (value) => {
                                        innerOperation = {...innerOperation,v: value};
                                    }});
                                filteredOperations.push(innerOperation);
                            }
                            catch (err) {
                                if(err !== block)
                                    this._handleUnexpectedMiddlewareError(err,nameof<DataboxFamily>(s => s.insertMiddleware))
                            }
                        })
                    }
                    continue;
                case CudType.delete:
                    if(!this._definedDeleteMiddleware) startOperations.push(operation);
                    else {
                        const preAction = {selector: operation.s,code: operation.c,data: operation.d};
                        operationsLookUps.push(async (socket, filteredOperations) => {
                            try {
                                await this.deleteMiddleware(member, socket,{...preAction});
                                filteredOperations.push(operation);
                            }
                            catch (err) {
                                if(err !== block)
                                    this._handleUnexpectedMiddlewareError(err,nameof<DataboxFamily>(s => s.deleteMiddleware))
                            }
                        })
                    }
            }
        }

        const outputCh = this._dbEventPreFix+member;
        const operationsLookupLength = operationsLookUps.length;
        if(operationsLookupLength === 0) {
            for(const socket of memberMem.sockets.keys())
                socket._emit(outputCh,dbClientPackage);
        }
        else {
            const socketPromises: Promise<void>[] = [];
            for(const socket of memberMem.sockets.keys()) {
                const promises: Promise<void>[] = [];
                const filteredOperations: CudOperation[] = [...startOperations];
                for(let i = 0; i < operationsLookupLength; i++)
                    promises.push(operationsLookUps[i](socket,filteredOperations))
                socketPromises.push(Promise.all(promises).then(() => {
                    if(filteredOperations.length > 0){
                        dbClientPackage.d.o = filteredOperations;
                        socket._emit(outputCh,dbClientPackage);
                    }
                }));
            }
            await Promise.all(socketPromises);
        }
    }


    private _updateLastCudData(member: string, timestamp: number, id: string) {
        const memberMem = this._regMembers.get(member);
        if(memberMem && memberMem.lastCudData.timestamp <= timestamp) {
            memberMem.lastCudData.id = id;
            memberMem.lastCudData.timestamp = timestamp;
            if(memberMem.lastCudData.fetchResolve) memberMem.lastCudData.fetchResolve();
        }
    }

    /**
     * Processes new cud packages.
     * @param member
     * @param cudPackage
     */
    private async _processCudPackage(member: string,cudPackage: CudPackage){
        this._sendCudToSockets(member,{a: DbClientOutputEvent.cud,d: cudPackage} as DbClientOutputCudPackage);
        this._updateLastCudData(member,cudPackage.t,cudPackage.ci);
    }

    /**
     * Emit before events.
     * @param member
     * @param cudOperations
     */
    private async _emitBeforeEvents(member: string,cudOperations: CudOperation[]){
        const promises: (Promise<void> | void)[] = [];
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
        this._sendToWorkers(member,[this._workerFullId,DbWorkerAction.cud,cudPackage] as DbWorkerCudPackage)
        await this._processCudPackage(member,cudPackage);
    }

    private _broadcastToOtherSockets(member: string,clientPackage: DbClientOutputPackage) {
        this._sendToWorkers(member,[this._workerFullId,DbWorkerAction.broadcast,clientPackage] as DbWorkerBroadcastPackage);
    }

    private _sendToWorkers(member: string,workerPackage: DbWorkerPackage) {
        this._scExchange.publish(this._dbEventPreFix+member,workerPackage);
    }

    /**
     * Close the family member of this Databox.
     * @param member
     * @param closePackage
     * @private
     */
    private _close(member: string,closePackage: DbClientOutputClosePackage) {
        const memberMem = this._regMembers.get(member);
        if(memberMem){
            const outputCh = this._dbEventPreFix+member;
            for(const [socket, socketMemory] of memberMem.sockets.entries()) {
                socket._emit(outputCh,closePackage);
                socketMemory.unregisterSocket();
            }
        }
    }

    /**
     * @internal
     * @param socket
     * @private
     */
    async _recheckSocketAccess(socket: Socket): Promise<void> {
        const members = this.getSocketRegMembers(socket);
        await Promise.all(members.map(async member => {
            if(!(await this._preparedData.checkAccess(socket,
                {identifier: this.identifier,member}))) {
                this.kickOut(member,socket);
            }
        }));
    }

    /**
     * @internal
     * @param member
     * @private
     */
    private async _recheckMemberAccess(member: string): Promise<void> {
        const memberMem = this._regMembers.get(member);
        if(!memberMem) return;
        const promises: Promise<void>[] = [];
        for(const socket of memberMem.sockets.keys()) {
            promises.push((async () => {
                if(!(await this._preparedData.checkAccess(socket,
                    {identifier: this.identifier,member}))) {
                    this.kickOut(member,socket);
                }
            })())
        }
        await Promise.all(promises);
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
            this._sendToWorkers(member,[this._workerFullId,DbWorkerAction.close,clientPackage] as DbWorkerClosePackage);
        }
        this._close(member,clientPackage);
    }

    /**
     * **Not override this method.**
     * The reload function will force all connected
     * clients of the Databox member to reload the data.
     * @param member
     * Numbers will be converted to a string.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    doReload(member: string | number, code?: number | string, data?: any, forEveryWorker: boolean = true){
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
    kickOut(member: string | number, socket: Socket, code?: number | string, data?: any): void {
        member = typeof member === "string" ? member: member.toString();
        const memberMap = this._regMembers.get(member);
        if(memberMap){
            const socketMemory = memberMap.sockets.get(socket);
            if(socketMemory){
                socket._emit(this._dbEventPreFix+member,
                    {a: DbClientOutputEvent.kickOut,c: code,d: data} as DbClientOutputKickOutPackage);
                socketMemory.unregisterSocket();
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * With this function, you can do a recheck of all sockets on a specific member.
     * It can be useful when the access rights to member have changed,
     * and you want to kick out all sockets that not have access anymore.
     * @param member
     * @param forEveryWorker
     */
    async recheckMemberAccess(member: string | number, forEveryWorker: boolean = true): Promise<void> {
        member = typeof member === "string" ? member: member.toString();
        if(forEveryWorker){
            this._sendToWorkers(member,
                [this._workerFullId,DbWorkerAction.recheckMemberAccess] as DbWorkerRecheckMemberAccessPackage);
        }
        await this._recheckMemberAccess(member);
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
        if(forEveryWorker)
            this._sendToWorkers(member,[this._workerFullId,DbWorkerAction.signal,clientPackage] as DbWorkerSignalPackage);
        this._sendSignalToSockets(member,clientPackage);
    }

    /**
     * **Not override this method.**
     * This method returns a string array with all
     * members where the socket is registered.
     * This method is used internally.
     * @param socket
     */
    getSocketRegMembers(socket: Socket): string[] {
        const members = this._socketMembers.get(socket);
        return members ? Array.from(members): [];
    }

    /**
     * **Can be overridden.**
     * This method is used to fetch data for the clients of the Databox.
     * A client can call that method multiple times to fetch more and more data.
     * If you don't want to stream data you should look at the singleFetch method.
     * Notice that only one method can be overridden.
     * You usually request data from your database and return it, and if no more data is available,
     * you should throw a NoDataError. If you return undefined or null, the NoDataError is automatically thrown.
     * The counter property of the request indicates the number of the current call, it starts counting at zero.
     * Notice that the counter only increases when the fetch was successful (means no error was thrown).
     * The client can send additional data when calling the fetch process (fetchInput),
     * this data is available in the input property of the request.
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
     * The client will convert each JSON object into this component.
     *
     * The KeyArray:
     * This component allows you to keep data in a specific sequence,
     * but you still able to access the values via a string key.
     * To build a key-array, you can use the buildKeyArray function.
     * Notice that JSON arrays will not be converted into this component type.
     *
     * The Array:
     * This component is a light way and simple component for an array.
     * Instead of the key-array, you only can access values via an array index.
     * Also, a difference is that the sequence of the elements is connected to the key (index).
     * That means sorting the values changes the keys.
     * All JSON arrays will be converted into this type.
     * If you need resorting, more specific keys, or you manipulate lots of data in the array,
     * you should use the key-array instead.
     *
     * When loading more data, the client will merge these data by using these components.
     * But notice that the client can only merge components from the same type.
     * Otherwise, the new value will override the old value.
     *
     * Whenever you are using the socket to filter secure data for a specific user,
     * you also have to use the cud middleware to filter the cud events for the socket.
     * But keep in mind when you overwrite a cud middleware the Databox switches
     * to a less performant implementation.
     * @param request {counter: number, input?: any, reload: boolean}
     * @param connection {member: string, socket: Socket, options?: any}
     * @param session
     */
    protected fetch(request: FetchRequest, connection: DbFamilyInConnection, session: Record<string,any>): Promise<any> | any {
        throw new NoDataError();
    }

    /**
     * **Can be overridden.**
     * This method is used to fetch data for the clients of the Databox.
     * A client can call that method to fetch the data of this Databox.
     * Instead of the fetch method, this method uses the counter internally to allow
     * the client to fetch data only one time.
     * If you want more freedom or stream data you should look at the fetch method.
     * Notice that only one method can be overridden.
     * You usually request data from your database and return it.
     * The client can send additional data when calling the fetch process (fetchInput),
     * this data is available in the input property of the request.
     *
     * The data that you are returning can be of any type.
     * The client will convert some data parts into specific databox storage components.
     * These components will allow you to access specific values with a selector.
     * There are three of them:
     * The Object:
     * It is a simple component that has no sequence, and you can access the values via property keys.
     * The client will convert each JSON object into this component.
     *
     * The KeyArray:
     * This component allows you to keep data in a specific sequence,
     * but you still able to access the values via a string key.
     * To build a key-array, you can use the buildKeyArray function.
     * Notice that JSON arrays will not be converted into this component type.
     *
     * The Array:
     * This component is a light way and simple component for an array.
     * Instead of the key-array, you only can access values via an array index.
     * Also, a difference is that the sequence of the elements is connected to the key (index).
     * That means sorting the values changes the keys.
     * All JSON arrays will be converted into this type.
     * If you need resorting, more specific keys, or you manipulate lots of data in the array,
     * you should use the key-array instead.
     *
     * Whenever you are using the socket to filter secure data for a specific user,
     * you also have to use the cud middleware to filter the cud events for the socket.
     * But keep in mind when you overwrite a cud middleware the Databox switches
     * to a less performant implementation.
     * @param request {counter: number, input?: any, reload: boolean}
     * @param connection {member: string, socket: Socket, options?: any}
     */
    protected singleFetch(request: FetchRequest, connection: DbFamilyInConnection): Promise<any> | any {
        throw new NoDataError();
    }

    /**
     * **Can be overridden.**
     * With the member middleware, you can protect your DataboxFamily against invalid members.
     * For example, when you have a Databox for user-profiles and the member represents
     * the user id you can block invalid user ids. To block the member, you can return an error (You can make use of the InvalidMemberError),
     * false or the block symbol or throwing the block symbol.
     * If you don't return anything, the member will be allowed.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @param member
     */
    public memberMiddleware(member: string): Promise<boolean | object | any> | boolean | object | any {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the Databox.
     * The databox will only emit before events when you overwrite at least one of them.
     * Notice that thrown errors in this method will be thrown up to
     * the call of the insert/update/delete or sequence edit method.
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
     * Notice that thrown errors in this method will be thrown up to
     * the call of the insert/update/delete or sequence edit method.
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
     * Notice that thrown errors in this method will be thrown up to
     * the call of the insert/update/delete or sequence edit method.
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
    protected onConnection(member: string,socket: Socket): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a socket is disconnected from the Databox.
     * Notice that means all input channels are closed.
     */
    protected onDisconnection(member: string,socket: Socket): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a
     * socket from this Databox received a signal.
     */
    protected onReceivedSignal(connection: DbFamilyInConnection, signal: string, data: any): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * The insert middleware.
     * Notice that when you overwrite at least one of the cud middlewares,
     * the Databox switches to a less performant implementation.
     * It is not recommended to invoke long processes in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket attachment.
     * The middleware will be called before each socket reaches a cud operation.
     * You can change the value for a socket with the property changeValue of the action by simply calling
     * the function with the new value.
     * With this functionality, you can make parts of the data invisible to some clients.
     * You are also able to block the complete operation for a socket
     * by throwing the block symbol.
     * @param member
     * @param socket
     * @param insertAction
     */
    protected insertMiddleware(member: string, socket: Socket, insertAction: InsertAction): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * The update middleware.
     * Notice that when you overwrite at least one of the cud middlewares,
     * the Databox switches to a less performant implementation.
     * It is not recommended to invoke long processes in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket attachment.
     * The middleware will be called before each socket reaches a cud operation.
     * You can change the value for a socket with the property changeValue of the action by simply calling
     * the function with the new value.
     * With this functionality, you can make parts of the data invisible to some clients.
     * You are also able to block the complete operation for a socket
     * by throwing the block symbol.
     * @param member
     * @param socket
     * @param updateAction
     */
    protected updateMiddleware(member: string, socket: Socket, updateAction: UpdateAction): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * The delete middleware.
     * Notice that when you overwrite at least one of the cud middlewares,
     * the Databox switches to a less performant implementation.
     * It is not recommended to invoke long processes in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket attachment.
     * The middleware will be called before each socket reaches a cud operation.
     * You are able to block the complete operation for a socket
     * by throwing the block symbol.
     * @param member
     * @param socket
     * @param deleteAction
     */
    protected deleteMiddleware(member: string, socket: Socket, deleteAction: DeleteAction): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * The transmit signal middleware.
     * Notice that when you overwrite the transmit signal middleware,
     * the Databox switches to a less performant implementation of processing signals.
     * It is not recommended to invoke long processes in this middleware.
     * Instead, try to prepare stuff in the token of the socket or the socket attachment.
     * The middleware will be called before each socket reaches a transmitted signal.
     * You can change the data for a socket with the property changeData of the action by simply calling
     * the function with the new data.
     * You are also able to block the complete action for a socket
     * by throwing the block symbol.
     * @param member
     * @param socket
     * @param signalAction
     */
    protected transmitSignalMiddleware(member: string, socket: Socket, signalAction: SignalAction): Promise<void> | void {
    }
}

DataboxFamily[familyTypeSymbol] = true;
DataboxFamily.prototype[familyTypeSymbol] = true;

markAsDefaultImpl(DataboxFamily.prototype['insertMiddleware']);
markAsDefaultImpl(DataboxFamily.prototype['updateMiddleware']);
markAsDefaultImpl(DataboxFamily.prototype['deleteMiddleware']);
markAsDefaultImpl(DataboxFamily.prototype['transmitSignalMiddleware']);

markAsDefaultImpl(DataboxFamily.prototype['memberMiddleware']);

markAsDefaultImpl(DataboxFamily.prototype['beforeInsert']);
markAsDefaultImpl(DataboxFamily.prototype['beforeUpdate']);
markAsDefaultImpl(DataboxFamily.prototype['beforeDelete']);

markAsDefaultImpl(DataboxFamily.prototype['fetch']);
markAsDefaultImpl(DataboxFamily.prototype['singleFetch']);

export type DataboxFamilyClass = typeof DataboxFamily;