/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataBoxConfig} from "../../helper/config/definitions/dataBoxConfig";
import SmallBag from "./../SmallBag";
import DataBoxCore, {DbPreparedData} from "./DataBoxCore";
import UpSocket from "../../helper/sc/socket";
import {
    CudAction,
    CudPackage,
    CudType,
    DATA_BOX_START_INDICATOR,
    DbClientClosePackage,
    DbClientCudPackage,
    DbClientKickOutPackage,
    DbClientPackage,
    DbClientReceiverEvent,
    DbClientSenderAction,
    DbClientSenderPackage,
    DBClientSenderSessionTarget,
    DbGetDataClientResponse,
    DbSessionData,
    DbWorkerAction,
    DbWorkerBroadcastPackage,
    DbWorkerClosePackage,
    DbWorkerCudPackage,
    DbWorkerPackage,
    IfContainsOption,
    InfoOption,
    PreCudPackage,
    RemoveSocketFunction,
    TimestampOption
} from "../../helper/dataBox/dbDefinitions";
import DataBoxAccessHelper from "../../helper/dataBox/dataBoxAccessHelper";
import {ScExchange} from "../../helper/sc/scServer";
import DataBoxUtils from "../../helper/dataBox/dataBoxUtils";
import DbCudActionSequence from "../../helper/dataBox/dbCudActionSequence";
import RespondUtils from "../../helper/utils/respondUtils";

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

    private readonly regSockets : Map<UpSocket,RemoveSocketFunction> = new Map();
    private lastCudData : {timestamp : number,id : string} = {timestamp : Date.now(),id : ''};
    private readonly scExchange : ScExchange;
    private readonly workerFullId : string;
    private readonly dbEvent : string;

    static ___instance___ : DataBox;

    constructor(id : string,smallBag: SmallBag,dbPreparedData : DbPreparedData,apiLevel : number | undefined) {
        super(id,smallBag,dbPreparedData,apiLevel);
        this.scExchange = smallBag.getWorker().scServer.exchange;
        this.workerFullId = smallBag.getWorker().getFullWorkerId();
        this.dbEvent = `${DATA_BOX_START_INDICATOR}-${this.id}-${apiLevel !== undefined ? apiLevel : ''}`;

        this._reg();
    }

    //Core
    /**
     * **Not override this method.**
     * @param socket
     * @param inSessionData
     * @private
     */
    async _registerSocket(socket : UpSocket,inSessionData : undefined | DbSessionData) : Promise<string> {

        const sessionData = inSessionData ? inSessionData : DataBoxUtils.createDbSessionData();

        const disconnectHandler = () => {
            this._unregisterSocket(socket,disconnectHandler);
        };

        const removeSocketFunction = () => {
            this._unregisterSocket(socket,disconnectHandler);
        };

        socket.on(this.dbEvent,async (data : DbClientSenderPackage, respond) => {
            switch (data.a) {
                case DbClientSenderAction.getData:
                    await RespondUtils.respondWithFunc(respond,this._getData,sessionData,data.t);
                    break;
                case DbClientSenderAction.resetSession:
                    await RespondUtils.respondWithFunc(respond,this._resetSession,sessionData,data.t);
                    break;
                case DbClientSenderAction.copySession:
                    await RespondUtils.respondWithFunc(respond,this._copySession,sessionData,data.t);
                    break;
                case DbClientSenderAction.getLastCudId:
                    respond(null,this._getLastCudId());
                    break;
                case DbClientSenderAction.close:
                    this._unregisterSocket(socket,disconnectHandler);
                    respond(null);
                    break;
                default :
                    respond('Unknown action');
            }
        });

        socket.on('disconnect',disconnectHandler);

        this._addSocket(socket,removeSocketFunction);
        DataBoxAccessHelper.addDb(this,socket);

        return this.dbEvent;
    }

    private _unregisterSocket(socket : UpSocket,disconnectHandler : () => void) {
        socket.off('disconnect',disconnectHandler);
        socket.off(this.dbEvent);
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

    private async _getData(sessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : Promise<DbGetDataClientResponse> {
        const session = DataBoxUtils.getSession(sessionData,target);

        const counter = session.c;
        const data = await this.getData(session.c,session.d);
        session.c++;

        return {
            c : counter,
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
     * @param rmFunction
     * @private
     */
    private _addSocket(socket : UpSocket,rmFunction : RemoveSocketFunction){
        this.regSockets.set(socket,rmFunction);
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
            .watch((data) => {
                if((data as DbWorkerCudPackage).w !== this.workerFullId) {
                    switch (data.action) {
                        case DbWorkerAction.cud:
                            this._processCudActions((data as DbWorkerCudPackage).d);
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
     * Processes new cud packages.
     * @param cudPackage
     */
    private _processCudActions(cudPackage : CudPackage){
        this._sendToSockets({a : DbClientReceiverEvent.cud,d : cudPackage} as DbClientCudPackage);
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
     * @param preCudPackage
     * @param timestamp
     */
    async _emitCudPackage(preCudPackage : PreCudPackage,timestamp ?: number) {
        await this._fireBeforeEvents(preCudPackage.a);
        const cudPackage = DataBoxUtils.buildCudPackage(preCudPackage,timestamp);
        this._processCudActions(cudPackage);
        const workerPackage : DbWorkerCudPackage = {
            a : DbWorkerAction.cud,
            d : cudPackage,
            w : this.workerFullId
        };
        this._sendToWorker(workerPackage);
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
        for(let [socket, rmFunction] of this.regSockets.entries()) {
            socket.emit(this.dbEvent,closePackage);
            rmFunction();
        }
    }

    /**
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

    /**
     * Sequence edit the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-events.
     * This method is ideal for doing multiple changes on a DataBox
     * because it will pack them all together and send them all in ones.
     * It will not automatically update the databank,
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
     * This method is used to get the current data or more data of the DataBox.
     * You usually request your database and return the data, and if no more data is available,
     * you should throw a NoMoreDataAvailableError or call the internal noMoreDataAvailable method.
     * A client can call that method multiple times.
     * That's why the counter parameter indicates the number of the current call.
     * Also, you extra get a session object, this object you can use to save variables that are
     * important to get more data in the future, for example, the last id of the item that the client had received.
     * The data what you are returning can be of any type.
     * But if you want to return more complex data,
     * it is recommended that the information consists of key-value able components
     * so that you can identify each value with a key path.
     * That can be done by using an object or a key-array.
     * @param counter
     * @param sessionData
     */
    protected getData<T extends object = object>(counter : number,sessionData : T){
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
        this._close(clientPackage);
        if(forEveryWorker){
            this._sendToWorker(
                {
                    a : DbWorkerAction.close,
                    d : clientPackage,
                    w : this.workerFullId
                } as DbWorkerClosePackage);
        }
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
        this._sendToSockets(clientPackage);
        if(forEveryWorker){
            this._broadcastToOtherSockets(clientPackage);
        }
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
        const rmFunction = this.regSockets.get(socket);
        if(rmFunction){
            socket.emit(this.dbEvent,
                {a : DbClientReceiverEvent.kickOut,c : code,d : data} as DbClientKickOutPackage);
            rmFunction();
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
}

export interface DataBoxClass {
    config: DataBoxConfig;

    new(id : string,smallBag: SmallBag,dbPreparedData : DbPreparedData,apiLevel : number | undefined): DataBox;

    prototype: any;
    name : string;

    readonly ___instance___ : DataBox | undefined;
}
