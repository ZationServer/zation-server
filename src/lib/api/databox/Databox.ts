/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag                           from '../Bag';
import DataboxCore, {DbPreparedData} from './DataboxCore';
import {RespondFunction}             from '../../main/sc/socket';
// noinspection ES6PreferShortImport
import {block}                       from '../../main/middlewares/block';
import {
    CudOperation,
    CudPackage,
    CudType,
    DATABOX_START_INDICATOR,
    DataboxConnectReq,
    DataboxConnectRes,
    DbClientInputAction,
    DbClientInputFetchPackage,
    DbClientInputFetchResponse,
    DbClientInputPackage,
    DBClientInputSessionTarget,
    DbClientInputSignalPackage,
    DbClientOutputClosePackage,
    DbClientOutputCudPackage,
    DbClientOutputEvent,
    DbClientOutputKickOutPackage,
    DbClientOutputPackage,
    DbClientOutputSignalPackage,
    DbProcessedSelector,
    DbRegisterResult,
    DbSelector,
    DbSocketMemory,
    DbToken,
    DbWorkerAction,
    DbWorkerBroadcastPackage,
    DbWorkerClosePackage,
    DbWorkerCudPackage,
    DbWorkerPackage,
    DbWorkerSignalPackage,
    IfOption,
    IfOptionProcessed,
    InfoOption,
    PotentialInsertOption,
    PotentialUpdateOption,
    PreCudPackage,
    TimestampOption,
    DbWorkerCudDataResponsePackage,
    DbWorkerCudDataRequestPackage, DbLastCudDataMemory, DbSessionData,
} from '../../main/databox/dbDefinitions';
import {
    DbInConnection,
    DeleteAction,
    FetchRequest,
    InsertAction,
    SignalAction,
    UpdateAction
} from './DataboxApiDefinitions';
import {ScExchange}                               from '../../main/sc/scServer';
import DataboxUtils                               from '../../main/databox/databoxUtils';
import DbCudOperationSequence                     from '../../main/databox/dbCudOperationSequence';
import {ClientErrorName}                          from '../../main/definitions/clientErrorName';
import DataboxFetchManager, {FetchManagerBuilder} from '../../main/databox/databoxFetchManager';
import Socket                                     from '../Socket';
import CloneUtils                                 from '../../main/utils/cloneUtils';
import {removeValueFromArray}                     from '../../main/utils/arrayUtils';
import FuncUtils                                  from '../../main/utils/funcUtils';
import {isDefaultImpl, markAsDefaultImpl}         from '../../main/utils/defaultImplUtils';
import {DataboxConfig}                            from '../../main/config/definitions/parts/databoxConfig';
import NoDataError                                from '../../main/databox/noDataError';
import {Writable}                                 from '../../main/utils/typeUtils';
import {deepFreeze}                               from '../../main/utils/deepFreeze';

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
 * - signalMiddleware
 */
export default class Databox extends DataboxCore {

    private readonly _regSockets: Map<Socket,DbSocketMemory> = new Map();
    private _lastCudData: DbLastCudDataMemory;
    private readonly _scExchange: ScExchange;
    private readonly _workerFullId: string;
    private readonly _dbEvent: string;
    private readonly _maxSocketInputChannels: number;

    private _internalRegistered: boolean = false;
    private _unregisterTimout: NodeJS.Timeout | undefined;

    private readonly _fetchImpl: (request: FetchRequest, connection: DbInConnection, session: DbSessionData) => Promise<any> | any;
    private readonly _buildFetchManager: FetchManagerBuilder<typeof Databox.prototype._fetch>;
    private readonly _sendCudToSockets: (dbClientCudPackage: DbClientOutputCudPackage) => Promise<void> | void;
    private readonly _sendSignalToSockets: (dbClientPackage: DbClientOutputSignalPackage) => Promise<void> | void;
    private readonly _definedInsertMiddleware = !isDefaultImpl(this.insertMiddleware);
    private readonly _definedUpdateMiddleware = !isDefaultImpl(this.updateMiddleware);
    private readonly _definedDeleteMiddleware = !isDefaultImpl(this.deleteMiddleware);
    private readonly _hasBeforeEventsListener: boolean;

    private readonly _onConnection: (socket: Socket) => Promise<void> | void;
    private readonly _onDisconnection: (socket: Socket) => Promise<void> | void;
    private readonly _onReceivedSignal: (connection: DbInConnection, signal: string, data: any) => Promise<void> | void;

    constructor(identifier: string, bag: Bag, dbPreparedData: DbPreparedData, apiLevel: number | undefined) {
        super(identifier,bag,dbPreparedData,apiLevel);
        this._scExchange = bag.getWorker().scServer.exchange;
        this._workerFullId = bag.getWorker().getFullWorkerId();
        this._maxSocketInputChannels = dbPreparedData.maxSocketInputChannels;
        this._dbEvent = `${DATABOX_START_INDICATOR}${this.identifier}${apiLevel !== undefined ? `@${apiLevel}`: ''}`;

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
    }

    private _initLastCudDataMemory(): DbLastCudDataMemory {
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
                this._sendToWorkers([this._workerFullId,DbWorkerAction.cudDataRequest] as DbWorkerCudDataRequestPackage);
            });
            return lastCudData as DbLastCudDataMemory;
        }
        else return {
            id: DataboxUtils.generateStartCudId(),
            timestamp: 0
        }
    }

    private _updateLastCudData(timestamp: number,id: string) {
        if(this._lastCudData.timestamp <= timestamp){
            this._lastCudData.id = id;
            this._lastCudData.timestamp = timestamp;
            if(this._lastCudData.fetchResolve) this._lastCudData.fetchResolve();
        }
    }

    private _getFetchImpl(): (request: FetchRequest, connection: DbInConnection, session: DbSessionData) => Promise<any> | any {
        if(!isDefaultImpl(this.singleFetch)) {
            return (request,connection) => {
                if(request.counter === 0){
                    return this.singleFetch(request,connection);
                }
                else throw new NoDataError(1)
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
    private _getSendCudToSocketsHandler(): (dbClientCudPackage: DbClientOutputCudPackage) => Promise<void> | void {
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
    async _processConRequest(socket: Socket, request: DataboxConnectReq, sendResponse: (response: DataboxConnectRes) => void): Promise<void> {
        if(request.m != undefined){
            const err: any = new Error(`Unnecessary member provided to request a Databox.`);
            err.name = ClientErrorName.UnnecessaryMember;
            throw err;
        }

        await this._checkAccess(socket,{identifier: this.identifier});

        const dbToken: DbToken = typeof request.t === 'string' ?
            await this._processDbToken(request.t) : DataboxUtils.createDbToken(request.o);

        const processedOptions = await this._consumeOptionsInput(dbToken.rawOptions);
        deepFreeze(processedOptions);

        const dbInConnection: DbInConnection = {socket,options: processedOptions,created: Date.now()};
        const keys: DbRegisterResult = await this._registerSocket(socket,dbToken,dbInConnection);
        const resp: DataboxConnectRes = {
            i: keys.inputCh,
            o: keys.outputCh,
            lc: this._getLastCudId(),
            p: this.isParallelFetch(),
        };
        if(this._initialData !== undefined) resp.id = this._initialData;
        if(this._parsedReloadStrategy != null) resp.rs = this._parsedReloadStrategy;
        sendResponse(resp);

        //update connection created timestamp
        (dbInConnection as Writable<DbInConnection>).created = Date.now();
        Object.freeze(dbInConnection);
    }

    /**
     * @internal
     * **Not override this method.**
     * @param socket
     * @param dbToken
     * @param dbInConnection
     * @private
     */
    private async _registerSocket(socket: Socket, dbToken: DbToken,
                                  dbInConnection: DbInConnection): Promise<DbRegisterResult> {

        const {inputChIds,unregisterSocket} = await this._connectSocket(socket);

        DataboxUtils.maxInputChannelsCheck(inputChIds.size,this._maxSocketInputChannels);

        //add input channel
        const chInputId = DataboxUtils.generateInputChId(inputChIds);
        inputChIds.add(chInputId);

        const inputCh = this._dbEvent+'.'+chInputId;

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
                        respond(null,await this._resetSession(dbToken,senderPackage.t));
                        break;
                    case DbClientInputAction.copySession:
                        respond(null,await this._copySession(dbToken,senderPackage.t));
                        break;
                    case DbClientInputAction.getLastCudId:
                        respond(null,this._getLastCudId());
                        break;
                    case DbClientInputAction.disconnect:
                        unregisterSocket(chInputId);
                        respond(null);
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

        return {inputCh, outputCh: this._dbEvent}
    }

    private _disconnectSocket(socket: Socket, disconnectHandler: () => void) {
        socket._off('disconnect',disconnectHandler);
        removeValueFromArray(socket.getDataboxes(),this);
        this._rmSocket(socket);
        this._onDisconnection(socket);
    }

    /**
     * @internal
     * **Not override this method.**
     * @private
     */
    _getLastCudId(): string {
        return this._lastCudData.id;
    }

    private async _fetch(dbToken: DbToken, fetchInput: any, connection: DbInConnection, target?: DBClientInputSessionTarget): Promise<DbClientInputFetchResponse> {
        const session = DataboxUtils.getSession(dbToken.sessions,target);
        const currentCounter = session.c;
        const clonedSessionData = CloneUtils.deepClone(session.d);
        const timestamp = Date.now();
        try {
            const data = await this._fetchImpl({
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
                t: await this._signDbToken(dbToken),
                ti: timestamp
            };
        }
        catch (e) {
            e = this._handleFetchErr(e);
            e['counter'] = currentCounter;
            throw e;
        }
    }

    private async _resetSession(dbToken: DbToken,target?: DBClientInputSessionTarget): Promise<string> {
        DataboxUtils.resetSession(dbToken.sessions,target);
        return this._signDbToken(dbToken);
    }

    private async _copySession(dbToken: DbToken,target?: DBClientInputSessionTarget): Promise<string> {
        DataboxUtils.copySession(dbToken.sessions,target);
        return this._signDbToken(dbToken);
    }

    /**
     * Adds a socket internally in the map. (For getting updates of this Databox)
     * @param socket
     * @private
     */
    private async _connectSocket(socket: Socket): Promise<DbSocketMemory> {
        let socketMemoryData = this._regSockets.get(socket);
        if(!socketMemoryData){
            //new socket = connect
            if(!this._internalRegistered) this._register();
            else this._clearUnregisterTimeout();

            if(this._lastCudData && this._lastCudData.fetchPromise)
                await this._lastCudData.fetchPromise;

            const inputChPrefix = `${this._dbEvent}-`;
            const inputChIds = new Set<string>();

            const unregisterSocketFunction = (inputChannelId?: string) => {
                if(inputChannelId === undefined){
                    for(let inChId of inputChIds.values()) {
                        socket._off(inputChPrefix+inChId);
                    }
                    //will also delete the inputChannels set
                    this._disconnectSocket(socket,disconnectHandler);
                }
                else {
                    socket._off(inputChPrefix+inputChannelId);
                    inputChIds.delete(inputChannelId);
                    if(inputChIds.size === 0){
                        this._disconnectSocket(socket,disconnectHandler);
                    }
                }
            };

            //Otherwise, the disconnect event calls it with parameters.
            const disconnectHandler = () => unregisterSocketFunction();

            socketMemoryData = {
                inputChIds: inputChIds,
                unregisterSocket: unregisterSocketFunction
            };

            this._regSockets.set(socket,socketMemoryData);

            socket._on('disconnect',disconnectHandler);
            socket.getDataboxes().push(this);
            this._onConnection(socket);
        }
        return socketMemoryData;
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @private
     */
    private _rmSocket(socket: Socket){
        this._regSockets.delete(socket);
        if(this._regSockets.size === 0) {
            this._createUnregisterTimeout();
        }
    }

    /**
     * Clears the timeout to unregister.
     * @private
     */
    private _clearUnregisterTimeout(): void {
        if(this._unregisterTimout !== undefined){
            clearTimeout(this._unregisterTimout);
            this._unregisterTimout = undefined;
        }
    }

    /**
     * Creates (set or renew) the timeout to unregister.
     * @private
     */
    private _createUnregisterTimeout(): void {
        if(this._unregisterTimout !== undefined) clearTimeout(this._unregisterTimout);
        this._unregisterTimout = setTimeout(() => {
            this._unregister();
            this._unregisterTimout = undefined;
        }, this._unregisterDelay);
    }

    /**
     * Registers for listening to the Databox channel.
     * @private
     */
    private _register() {
        //Important non-async usage otherwise, the risk of missing a worker response to a cud request exists.
        this._lastCudData = this._initLastCudDataMemory();
        this._scExchange.subscribe(this._dbEvent)
            .watch(async (data: DbWorkerPackage) => {
                if(data[0] !== this._workerFullId) {
                    switch (data[1]) {
                        case DbWorkerAction.cud:
                            await this._processCudOperations((data as DbWorkerCudPackage)[2]);
                            break;
                        case DbWorkerAction.signal:
                            await this._sendSignalToSockets((data as DbWorkerSignalPackage)[2]);
                            break;
                        case DbWorkerAction.close:
                            await this._close((data as DbWorkerClosePackage)[2]);
                            break;
                        case DbWorkerAction.broadcast:
                            this._sendToSockets((data as DbWorkerBroadcastPackage)[2]);
                            break;
                        case DbWorkerAction.cudDataRequest:
                            if(this._lastCudData.timestamp <= 0) return;
                            this._sendToWorkers([this._workerFullId,DbWorkerAction.cudDataResponse,
                                this._lastCudData.timestamp, this._lastCudData.id] as DbWorkerCudDataResponsePackage);
                            break;
                        case DbWorkerAction.cudDataResponse:
                            this._updateLastCudData((data as DbWorkerCudDataResponsePackage)[2],(data as DbWorkerCudDataResponsePackage)[3]);
                            break;
                        default:
                    }
                }
            });
    }

    /**
     * Unregister for listening to the internal Databox channel.
     * @private
     */
    private _unregister() {
        const channel = this._scExchange.channel(this._dbEvent);
        channel.unwatch();
        channel.destroy();
        this._internalRegistered = false;
    }

    /**
     * Sends a Databox package to all sockets of the Databox.
     * @param dbClientPackage
     */
    private _sendToSockets(dbClientPackage: DbClientOutputPackage) {
        for(const socket of this._regSockets.keys()) {
            socket._emit(this._dbEvent,dbClientPackage);
        }
    }

    /**
     * Sends a Databox signal package to sockets of the Databox after passing the signal middleware.
     * @param dbClientPackage
     * @private
     */
    private async _sendSignalToSocketsWithMiddleware(dbClientPackage: DbClientOutputSignalPackage) {

        const preAction = {signal: dbClientPackage.s, data: dbClientPackage.d};
        const middlewareInvoker = async (socket: Socket) => {
            try {
                let dbPackage = dbClientPackage;
                await this.transmitSignalMiddleware(socket,{...preAction,changeData: (data) => {
                    dbPackage = {...dbPackage,d: data};
                }})
                socket._emit(this._dbEvent,dbPackage);
            }
            catch (err) {
                if(err !== block)
                    this._handleUnexpectedMiddlewareError(err,nameof<Databox>(s => s.transmitSignalMiddleware))
            }
        }

        const promises: Promise<void>[] = [];
        for(const socket of this._regSockets.keys())
            promises.push(middlewareInvoker(socket));
        await Promise.all(promises);
    }

    /**
     * Sends a Databox cud package to sockets of the Databox after passing the cud middleware.
     * @param dbClientPackage
     * @private
     */
    private async _sendCudToSocketsWithMiddleware(dbClientPackage: DbClientOutputCudPackage) {

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
                                await this.updateMiddleware(socket,{...preAction, changeValue: (value) => {
                                    innerOperation = {...innerOperation,v: value};
                                }});
                                filteredOperations.push(innerOperation);
                            }
                            catch (err) {
                                if(err !== block)
                                    this._handleUnexpectedMiddlewareError(err,nameof<Databox>(s => s.updateMiddleware))
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
                                await this.insertMiddleware(socket,{...preAction, changeValue: (value) => {
                                    innerOperation = {...innerOperation,v: value};
                                }});
                                filteredOperations.push(innerOperation);
                            }
                            catch (err) {
                                if(err !== block)
                                    this._handleUnexpectedMiddlewareError(err,nameof<Databox>(s => s.insertMiddleware))
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
                                await this.deleteMiddleware(socket,{...preAction});
                                filteredOperations.push(operation);
                            }
                            catch (err) {
                                if(err !== block)
                                    this._handleUnexpectedMiddlewareError(err,nameof<Databox>(s => s.deleteMiddleware))
                            }
                        })
                    }
            }
        }

        const operationsLookupLength = operationsLookUps.length;
        if(operationsLookupLength === 0) {
            for(const socket of this._regSockets.keys())
                socket._emit(this._dbEvent,dbClientPackage);
        }
        else {
            const socketPromises: Promise<void>[] = [];
            for(const socket of this._regSockets.keys()) {
                const promises: Promise<void>[] = [];
                const filteredOperations: CudOperation[] = [...startOperations];
                for(let i = 0; i < operationsLookupLength; i++)
                    promises.push(operationsLookUps[i](socket,filteredOperations))
                socketPromises.push(Promise.all(promises).then(() => {
                    if(filteredOperations.length > 0){
                        dbClientPackage.d.o = filteredOperations;
                        socket._emit(this._dbEvent,dbClientPackage);
                    }
                }));
            }
            await Promise.all(socketPromises);
        }
    }

    /**
     * Processes new cud packages.
     * @param cudPackage
     */
    private async _processCudOperations(cudPackage: CudPackage){
        await this._sendCudToSockets({a: DbClientOutputEvent.cud,d: cudPackage} as DbClientOutputCudPackage);
        this._updateLastCudData(cudPackage.t,cudPackage.ci);
    }

    /**
     * Emit before events.
     * @param cudOperations
     */
    private async _emitBeforeEvents(cudOperations: CudOperation[]){
        const promises: (Promise<void> | void)[] = [];
        for(let i = 0; i < cudOperations.length;i++) {
            const operation = cudOperations[i];
            switch (operation.t) {
                case CudType.insert:
                    promises.push(this.beforeInsert(operation.s,operation.v,
                        {code: operation.c,data: operation.d,if: operation.i,potentialUpdate: !!operation.p,timestamp: operation.t}));
                    break;
                case CudType.update:
                    promises.push(this.beforeUpdate(operation.s,operation.v,
                        {code: operation.c,data: operation.d,if: operation.i,potentialInsert: !!operation.p,timestamp: operation.t}));
                    break;
                case CudType.delete:
                    promises.push(this.beforeDelete(operation.s,
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
     * @param timestamp
     */
    async _emitCudPackage(preCudPackage: PreCudPackage,timestamp?: number) {
        if(this._hasBeforeEventsListener){
            await this._emitBeforeEvents(preCudPackage.o);
        }
        const cudPackage = DataboxUtils.buildCudPackage(preCudPackage,timestamp);
        this._sendToWorkers([this._workerFullId,DbWorkerAction.cud,cudPackage] as DbWorkerCudPackage);
        await this._processCudOperations(cudPackage);
    }

    private _broadcastToOtherSockets(clientPackage: DbClientOutputPackage) {
        this._sendToWorkers([this._workerFullId,DbWorkerAction.broadcast,clientPackage] as DbWorkerBroadcastPackage);
    }

    private _sendToWorkers(workerPackage: DbWorkerPackage) {
        this._scExchange.publish(this._dbEvent,workerPackage);
    }

    /**
     * Close this Databox.
     * @param closePackage
     * @private
     */
    private async _close(closePackage: DbClientOutputClosePackage) {
        await this._connectionProcessMidTaskScheduler.
            scheduleMidTask(async () => this._internalClose(closePackage));
    }
    private _internalClose(closePackage: DbClientOutputClosePackage) {
        for(let [socket, socketMemory] of this._regSockets.entries()) {
            socket._emit(this._dbEvent,closePackage);
            socketMemory.unregisterSocket();
        }
    }

    /**
     * @internal
     * @param socket
     * @private
     */
    async _recheckSocketAccess(socket: Socket): Promise<void> {
        if(!(await this._preparedData.checkAccess(socket,
            {identifier: this.identifier})))
        {
            this.kickOut(socket);
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
    async insert(selector: DbSelector, value: any, {if: ifOption,potentialUpdate,timestamp,code,data}: IfOption & PotentialUpdateOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildInsert(selector,value,ifOption,potentialUpdate,code,data)),timestamp);
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
    async update(selector: DbSelector, value: any, {if: ifOption,potentialInsert,timestamp,code,data}: IfOption & PotentialInsertOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildUpdate(selector,value,ifOption,potentialInsert,code,data)),timestamp);
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
    async delete(selector: DbSelector, {if: ifOption,timestamp,code,data}: IfOption & InfoOption & TimestampOption = {}) {
        await this._emitCudPackage(
            DataboxUtils.buildPreCudPackage(
                DataboxUtils.buildDelete(selector,ifOption,code,data)),timestamp);
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
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(timestamp?: number): DbCudOperationSequence {
        return new DbCudOperationSequence(async (operations) => {
            await this._emitCudPackage(
                DataboxUtils.buildPreCudPackage(...operations),timestamp);
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
     * @return The returned promise is resolved when
     * the close is fully processed on the current worker.
     */
    async close(code?: number | string,data?: any,forEveryWorker: boolean = true){
        const clientPackage = DataboxUtils.buildClientClosePackage(code,data);
        if(forEveryWorker){
            this._sendToWorkers([this._workerFullId,DbWorkerAction.close,clientPackage] as DbWorkerClosePackage);
        }
        await this._close(clientPackage);
    }

    /**
     * **Not override this method.**
     * The reload function will force all connected
     * clients of the Databox to reload the data.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    doReload(code?: number | string, data?: any, forEveryWorker: boolean = true){
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
    kickOut(socket: Socket, code?: number | string, data?: any): void {
        const socketMemory = this._regSockets.get(socket);
        if(socketMemory){
            socket._emit(this._dbEvent,
                {a: DbClientOutputEvent.kickOut,c: code,d: data} as DbClientOutputKickOutPackage);
            socketMemory.unregisterSocket();
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Transmit a signal to all client Databoxes connected with this Databox.
     * The clients can listen to any received signal.
     * You also can send additional data with the signal.
     * @param signal
     * @param data
     * @param forEveryWorker
     */
    transmitSignal(signal: string, data?: any, forEveryWorker: boolean = true) {
        const clientPackage = DataboxUtils.buildClientSignalPackage(signal,data);
        if(forEveryWorker)
            this._sendToWorkers([this._workerFullId,DbWorkerAction.signal,clientPackage] as DbWorkerSignalPackage);
        this._sendSignalToSockets(clientPackage);
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
     * @param connection {socket: Socket, options?: any}
     * @param session
     */
    protected fetch(request: FetchRequest, connection: DbInConnection, session: DbSessionData): Promise<any> | any {
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
     * @param connection {socket: Socket, options?: any}
     */
    protected singleFetch(request: FetchRequest, connection: DbInConnection): Promise<any> | any {
        throw new NoDataError();
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the Databox.
     * The databox will only emit before events when you overwrite at least one of them.
     * Notice that thrown errors in this method will be thrown up to
     * the call of the insert/update/delete or sequence edit method.
     * @param selector
     * @param value
     * @param options
     */
    protected beforeInsert(selector: DbProcessedSelector, value: any,
                           options: IfOptionProcessed & PotentialUpdateOption & InfoOption & TimestampOption): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an update of data in the Databox.
     * The databox will only emit before events when you overwrite at least one of them.
     * Notice that thrown errors in this method will be thrown up to
     * the call of the insert/update/delete or sequence edit method.
     * @param selector
     * @param value
     * @param options
     */
    protected beforeUpdate(selector: DbProcessedSelector, value: any,
                           options: IfOptionProcessed & PotentialInsertOption & InfoOption & TimestampOption): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before a delete of data in the Databox.
     * The databox will only emit before events when you overwrite at least one of them.
     * Notice that thrown errors in this method will be thrown up to
     * the call of the insert/update/delete or sequence edit method.
     * @param selector
     * @param options
     */
    protected beforeDelete(selector: DbProcessedSelector,
                           options: IfOptionProcessed & InfoOption & TimestampOption): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a new socket is connected to the Databox.
     */
    protected onConnection(socket: Socket): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a socket is disconnected from the Databox.
     * Notice that means all input channels are closed.
     */
    protected onDisconnection(socket: Socket): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a
     * socket from this Databox received a signal.
     */
    protected onReceivedSignal(connection: DbInConnection, signal: string, data: any): Promise<void> | void {
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
     * @param socket
     * @param insertAction
     */
    protected insertMiddleware(socket: Socket, insertAction: InsertAction): Promise<void> | void {
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
     * @param socket
     * @param updateAction
     */
    protected updateMiddleware(socket: Socket, updateAction: UpdateAction): Promise<void> | void {
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
     * @param socket
     * @param deleteAction
     */
    protected deleteMiddleware(socket: Socket, deleteAction: DeleteAction): Promise<void> | void {
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
     * @param socket
     * @param signalAction
     */
    protected transmitSignalMiddleware(socket: Socket, signalAction: SignalAction): Promise<void> | void {
    }
}

markAsDefaultImpl(Databox.prototype['insertMiddleware']);
markAsDefaultImpl(Databox.prototype['updateMiddleware']);
markAsDefaultImpl(Databox.prototype['deleteMiddleware']);
markAsDefaultImpl(Databox.prototype['transmitSignalMiddleware']);

markAsDefaultImpl(Databox.prototype['beforeInsert']);
markAsDefaultImpl(Databox.prototype['beforeUpdate']);
markAsDefaultImpl(Databox.prototype['beforeDelete']);

markAsDefaultImpl(Databox.prototype['fetch']);
markAsDefaultImpl(Databox.prototype['singleFetch']);

export type DataboxClass = (new(...args) => Databox) &
    {config: DataboxConfig, prototype: Databox};