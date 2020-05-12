/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag                           from "../Bag";
import DataboxCore, {DbPreparedData} from "./DataboxCore";
import UpSocket, {RespondFunction}   from "../../main/sc/socket";
import {
    CudOperation,
    CudPackage,
    CudType,
    DATABOX_START_INDICATOR,
    DbClientOutputClosePackage,
    DbClientOutputCudPackage,
    DbClientInputFetchPackage,
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
    IfOption,
    InfoOption,
    PreCudPackage,
    TimestampOption,
    DbRegisterResult,
    DbSocketMemory,
    ChangeValue,
    DbToken,
    DbSelector,
    DbProcessedSelector,
    PotentialUpdateOption,
    PotentialInsertOption, IfOptionProcessed, DbClientInputSignalPackage, DataboxConnectReq, DataboxConnectRes
} from '../../main/databox/dbDefinitions';
import {ScExchange}        from "../../main/sc/scServer";
import DataboxUtils        from "../../main/databox/databoxUtils";
import DbCudOperationSequence                     from "../../main/databox/dbCudOperationSequence";
import {ClientErrorName}                          from "../../main/constants/clientErrorName";
import DataboxFetchManager, {FetchManagerBuilder} from "../../main/databox/databoxFetchManager";
import ZSocket                                    from "../../main/internalApi/zSocket";
import CloneUtils                                 from "../../main/utils/cloneUtils";
import {removeValueFromArray}                     from '../../main/utils/arrayUtils';
import ObjectUtils from '../../main/utils/objectUtils';
const defaultSymbol                              = Symbol();

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
 * - fetch
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
export default class Databox extends DataboxCore {

    private readonly _regSockets: Map<UpSocket,DbSocketMemory> = new Map();
    private _lastCudData: {timestamp: number,id: string} = {timestamp: Date.now(),id: DataboxUtils.generateStartCudId()};
    private readonly _scExchange: ScExchange;
    private readonly _workerFullId: string;
    private readonly _dbEvent: string;
    private readonly _maxSocketInputChannels: number;

    private _internalRegistered: boolean = false;
    private _unregisterTimout: NodeJS.Timeout | undefined;

    private readonly _buildFetchManager: FetchManagerBuilder<typeof Databox.prototype._fetch>;
    private readonly _sendCudToSockets: (dbClientCudPackage: DbClientOutputCudPackage) => Promise<void> | void;
    private readonly _hasBeforeEventsListener: boolean;

    constructor(identifier: string, bag: Bag, dbPreparedData: DbPreparedData, apiLevel: number | undefined) {
        super(identifier,bag,dbPreparedData,apiLevel);
        this._scExchange = bag.getWorker().scServer.exchange;
        this._workerFullId = bag.getWorker().getFullWorkerId();
        this._maxSocketInputChannels = dbPreparedData.maxSocketInputChannels;
        this._dbEvent = `${DATABOX_START_INDICATOR}${this.identifier}${apiLevel !== undefined ? `@${apiLevel}`: ''}`;

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
    private _getSendCudToSocketsHandler(): (dbClientCudPackage: DbClientOutputCudPackage) => Promise<void> | void {
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
        if(request.m != undefined){
            const err: any = new Error(`Unnecessary member provided to request a Databox.`);
            err.name = ClientErrorName.UnnecessaryMember;
            throw err;
        }

        await this._checkAccess(socket,{identifier: this.identifier});

        const dbToken: DbToken = typeof request.t === 'string' ?
            await this._processDbToken(request.t) : DataboxUtils.createDbToken(request.i);

        const processedInitData = await this._consumeInitInput(dbToken.rawInitData);
        if(typeof processedInitData === 'object'){ObjectUtils.deepFreeze(processedInitData);}

        const keys: DbRegisterResult = await this._registerSocket(socket,dbToken,processedInitData);

        return [keys.inputCh,keys.outputCh,this._getLastCudId(),this.isParallelFetch()];
    }

    /**
     * @internal
     * **Not override this method.**
     * @param socket
     * @param dbToken
     * @param initData
     * @private
     */
    async _registerSocket(socket: UpSocket,dbToken: DbToken,initData: any): Promise<DbRegisterResult> {

        const {inputChIds,unregisterSocket} = this._connectSocket(socket);

        DataboxUtils.maxInputChannelsCheck(inputChIds.size,this._maxSocketInputChannels);

        //add input channel
        const chInputId = DataboxUtils.generateInputChId(inputChIds);
        inputChIds.add(chInputId);

        const inputCh = this._dbEvent+'.'+chInputId;

        const fetchManager = this._buildFetchManager();

        socket.on(inputCh,async (senderPackage: DbClientInputPackage, respond: RespondFunction) => {
            try {
                switch (senderPackage.a) {
                    case DbClientInputAction.signal:
                        if(typeof (senderPackage as DbClientInputSignalPackage).s as any === 'string'){
                            this.onReceivedSignal(socket.zSocket,(senderPackage as DbClientInputSignalPackage).s,
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

    private _disconnectSocket(socket: UpSocket,disconnectHandler: () => void) {
        socket.off('disconnect',disconnectHandler);
        removeValueFromArray(socket.databoxes,this);
        this._rmSocket(socket);
        this.onDisconnection(socket.zSocket);
    }

    /**
     * @internal
     * **Not override this method.**
     * @private
     */
    _getLastCudId(): string {
        return this._lastCudData.id;
    }

    private async _fetch(dbToken: DbToken,fetchInput: any,initData: any,zSocket: ZSocket,target?: DBClientInputSessionTarget): Promise<DbClientInputFetchResponse> {
        const session = DataboxUtils.getSession(dbToken.sessions,target);
        const currentCounter = session.c;
        const clonedSessionData = CloneUtils.deepClone(session.d);
        try {
            const data = await this.fetch(currentCounter,clonedSessionData,fetchInput,initData,zSocket);

            //success fetch
            session.c++;
            session.d = clonedSessionData;

            return {
                c: currentCounter,
                d: data,
                t: await this._signDbToken(dbToken)
            };
        }
        catch (e) {
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
    private _connectSocket(socket: UpSocket): DbSocketMemory {
        let socketMemoryData = this._regSockets.get(socket);
        if(!socketMemoryData){
            //new socket = connect
            if(!this._internalRegistered){
                this._register();
            }
            else {
                this._clearUnregisterTimeout();
            }

            const inputChPrefix = `${this._dbEvent}-`;
            const inputChIds = new Set<string>();

            const unregisterSocketFunction = (inputChannelId?: string) => {
                if(inputChannelId === undefined){
                    for(let inChId of inputChIds.values()) {
                        socket.off(inputChPrefix+inChId);
                    }
                    //will also delete the inputChannels set
                    this._disconnectSocket(socket,disconnectHandler);
                }
                else {
                    socket.off(inputChPrefix+inputChannelId);
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

            socket.on('disconnect',disconnectHandler);
            socket.databoxes.push(this);
            this.onConnection(socket.zSocket);
        }
        return socketMemoryData;
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @private
     */
    private _rmSocket(socket: UpSocket){
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
        if(this._unregisterTimout !== undefined){clearTimeout(this._unregisterTimout);}
        this._unregisterTimout = setTimeout(() => {
            this._unregister();
            this._unregisterTimout = undefined;
        }, 120000);
    }

    /**
     * Registers for listening to the Databox channel.
     * @private
     */
    private _register() {
        this._scExchange.subscribe(this._dbEvent)
            .watch(async (data) => {
                if((data as DbWorkerPackage).w !== this._workerFullId) {
                    switch ((data as DbWorkerPackage).a) {
                        case DbWorkerAction.cud:
                            await this._processCudOperations((data as DbWorkerCudPackage).d);
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
        for(let socket of this._regSockets.keys()) {
            socket.emit(this._dbEvent,dbClientPackage);
        }
    }

    /**
     * Sends a Databox cud package to sockets of the Databox after passing the cud middleware.
     * @param dbClientPackage
     * @private
     */
    private async _sendCudToSocketsWithMiddleware(dbClientPackage: DbClientOutputCudPackage) {

        const operations = dbClientPackage.d.o;
        const socketPromises: Promise<void>[] = [];

        for(let socket of this._regSockets.keys()) {

            const filteredOperations: CudOperation[] = [];
            const promises: Promise<void>[] = [];

            for(let i = 0; i < operations.length; i++){
                const operation = CloneUtils.deepClone(operations[i]);
                switch (operation.t) {
                    case CudType.update:
                        promises.push((async () => {
                            try {
                                await this.updateMiddleware(socket.zSocket,operation.s,operation.v,(value) => {
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
                                await this.insertMiddleware(socket.zSocket,operation.s,operation.v,(value) => {
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
                                await this.deleteMiddleware(socket.zSocket,operation.s,operation.c,operation.d);
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
    private async _processCudOperations(cudPackage: CudPackage){
        await this._sendCudToSockets({a: DbClientOutputEvent.cud,d: cudPackage} as DbClientOutputCudPackage);
        //updated last cud id.
        if(this._lastCudData.timestamp <= cudPackage.t){
            this._lastCudData = {id: cudPackage.ci, timestamp: cudPackage.t};
        }
    }

    /**
     * Emit before events.
     * @param cudOperations
     */
    private async _emitBeforeEvents(cudOperations: CudOperation[]){
        let promises: (Promise<void> | void)[] = [];
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
        this._sendToWorker({
            a: DbWorkerAction.cud,
            d: cudPackage,
            w: this._workerFullId
        } as DbWorkerCudPackage);
        await this._processCudOperations(cudPackage);
    }

    private _broadcastToOtherSockets(clientPackage: DbClientOutputPackage) {
        this._sendToWorker({
            a: DbWorkerAction.broadcast,
            d: clientPackage,
            w: this._workerFullId
        } as DbWorkerBroadcastPackage);
    }

    private _sendToWorker(workerPackage: DbWorkerPackage) {
        this._scExchange.publish(this._dbEvent,workerPackage);
    }

    /**
     * Close this Databox.
     * @param closePackage
     * @private
     */
    private _close(closePackage: DbClientOutputClosePackage) {
        for(let [socket, socketMemory] of this._regSockets.entries()) {
            socket.emit(this._dbEvent,closePackage);
            socketMemory.unregisterSocket();
        }
    }

    /**
     * @internal
     * @param socket
     * @private
     */
    async _checkSocketHasStillAccess(socket: UpSocket): Promise<void> {
        if(!(await this._preparedData.accessCheck(socket.authEngine,socket.zSocket,
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
     */
    close(code?: number | string,data?: any,forEveryWorker: boolean = true){
        const clientPackage = DataboxUtils.buildClientClosePackage(code,data);
        if(forEveryWorker){
            this._sendToWorker(
                {
                    a: DbWorkerAction.close,
                    d: clientPackage,
                    w: this._workerFullId
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
    doReload(forEveryWorker: boolean = false,code?: number | string,data?: any){
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
    kickOut(socket: UpSocket,code?: number | string,data?: any): void {
        const socketMemory = this._regSockets.get(socket);
        if(socketMemory){
            socket.emit(this._dbEvent,
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
        if(forEveryWorker){
            this._broadcastToOtherSockets(clientPackage);
        }
        this._sendToSockets(clientPackage);
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
     * @param counter
     * @param session
     * @param input
     * @param initData
     * @param socket
     */
    protected fetch(counter: number, session: any, input: any, initData: any, socket: ZSocket): Promise<any> | any {
        this.noDataAvailable();
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered before an insert into the Databox.
     * The databox will only emit before events when you overwrite at least one of them.
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
    protected onConnection(socket: ZSocket): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a socket is disconnected from the Databox.
     * Notice that means all input channels are closed.
     */
    protected onDisconnection(socket: ZSocket): Promise<void> | void {
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * **Can be overridden.**
     * A function that gets triggered whenever a
     * socket from this Databox received a signal.
     */
    protected onReceivedSignal(socket: ZSocket, signal: string, data: any): Promise<void> | void {
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
     * @param selector
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected insertMiddleware(socket: ZSocket, selector: DbProcessedSelector, value: any, changeValue: ChangeValue,
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
     * @param socket
     * @param selector
     * @param value
     * @param changeValue
     * @param code
     * @param data
     */
    protected updateMiddleware(socket: ZSocket, selector: DbProcessedSelector, value: any, changeValue: ChangeValue,
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
     * @param socket
     * @param selector
     * @param code
     * @param data
     */
    protected deleteMiddleware(socket: ZSocket,selector: DbProcessedSelector,
                                     code: string | number | undefined,data: any): Promise<void> | void {
    }
}

Databox.prototype['insertMiddleware'][defaultSymbol] = true;
Databox.prototype['updateMiddleware'][defaultSymbol] = true;
Databox.prototype['deleteMiddleware'][defaultSymbol] = true;

Databox.prototype['beforeInsert'][defaultSymbol] = true;
Databox.prototype['beforeUpdate'][defaultSymbol] = true;
Databox.prototype['beforeDelete'][defaultSymbol] = true;

export type DataboxClass = typeof Databox;