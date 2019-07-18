/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataBoxConfig} from "../../helper/config/definitions/dataBoxConfig";
import Bag from "../Bag";
import DataBoxCore, {DbPreparedData} from "./DataBoxCore";
import UpSocket from "../../helper/sc/socket";
import {IdValidChecker} from "../../helper/id/idValidCheckerUtils";
import {ScExchange} from "../../helper/sc/scServer";
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
    DbGetDataClientResponse,
    DbWorkerBroadcastPackage,
    DbWorkerPackage,
    DbClientClosePackage,
    DbWorkerClosePackage,
    RemoveSocketFunction, DbClientKickOutPackage
} from "../../helper/dataBox/dbDefinitions";
import DataBoxAccessHelper from "../../helper/dataBox/dataBoxAccessHelper";
import DataBoxUtils        from "../../helper/dataBox/dataBoxUtils";
import DbCudActionSequence from "../../helper/dataBox/dbCudActionSequence";
import RespondUtils        from "../../helper/utils/respondUtils";
import {ErrorName}         from "../../helper/constants/errorName";

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
    private readonly regSockets : Map<string,Map<UpSocket,RemoveSocketFunction>> = new Map();
    /**
     * Maps the sockets to the member ids.
     */
    private readonly socketMembers : Map<UpSocket,Set<string>> = new Map<UpSocket, Set<string>>();
    private readonly lastCudData : Map<string,{timestamp : number,id : string}> = new Map();
    private readonly idValidCheck : IdValidChecker;
    private readonly dbEventPreFix : string;
    private readonly scExchange : ScExchange;
    private readonly workerFullId : string;

    static ___instance___ : DataBoxFamily;

    constructor(id : string, bag: Bag, dbPreparedData : DbPreparedData, idValidCheck : IdValidChecker, apiLevel : number | undefined) {
        super(id,bag,dbPreparedData,apiLevel);
        this.idValidCheck = idValidCheck;
        this.scExchange = bag.getWorker().scServer.exchange;
        this.workerFullId = bag.getWorker().getFullWorkerId();
        this.dbEventPreFix = `${DATA_BOX_START_INDICATOR}-${this.id}-${apiLevel !== undefined ? apiLevel : ''}-`;
    }

    //Core
    /**
     * **Not override this method.**
     * @param socket
     * @param id
     * @param inSessionData
     * @private
     */
    async _registerSocket(socket : UpSocket,id : string,inSessionData : undefined | DbSessionData) : Promise<string> {
        const event = this.dbEventPreFix+id;

        const sessionData = inSessionData ? inSessionData : DataBoxUtils.createDbSessionData();

        const disconnectHandler = () => {
            this._unregisterSocket(socket,disconnectHandler,id);
        };

        const removeSocketFunction = () => {
            this._unregisterSocket(socket,disconnectHandler,id);
        };

        socket.on(event,async (data, respond) => {
            switch (data.action) {
                case DbClientSenderAction.getData:
                    await RespondUtils.respondWithFunc(respond,this._getData,id,sessionData,data.t);
                    break;
                case DbClientSenderAction.resetSession:
                    await RespondUtils.respondWithFunc(respond,this._resetSession,id,sessionData,data.t);
                    break;
                case DbClientSenderAction.copySession:
                    await RespondUtils.respondWithFunc(respond,this._copySession,id,sessionData,data.t);
                    break;
                case DbClientSenderAction.close:
                    this._unregisterSocket(socket,disconnectHandler,id);
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

        socket.on('disconnect',disconnectHandler);

        this._addSocket(socket,id,removeSocketFunction);
        DataBoxAccessHelper.addDb(this,socket);

        return event;
    }

    private _unregisterSocket(socket : UpSocket,disconnectHandler : () => void,id : string) {
        socket.off('disconnect',disconnectHandler);
        socket.off(this.dbEventPreFix+id);
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

    private async _getData(id : string,sessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : Promise<DbGetDataClientResponse> {
        const session = DataBoxUtils.getSession(sessionData,target);

        const counter = session.c;
        const data = await this.getData(id,session.c,session.d);
        session.c++;

        return {
            c : counter,
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
     * Adds a socket internally in the map. (For getting updates of this family member)
     * @param socket
     * @param id
     * @param rmFunction
     * @private
     */
    private _addSocket(socket : UpSocket,id : string,rmFunction : RemoveSocketFunction){
        //register socket map
        let memberMap = this.regSockets.get(id);
        if(!memberMap){
            memberMap = new Map<UpSocket,RemoveSocketFunction>();
            this._regMember(id);
            this.regSockets.set(id,memberMap);
        }
        memberMap.set(socket,rmFunction);

        //socket member map
        let socketMemberSet = this.socketMembers.get(socket);
        if(!socketMemberSet){
            socketMemberSet = new Set<string>();
            this.socketMembers.set(socket,socketMemberSet);
        }
        socketMemberSet.add(id);
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @param id
     * @private
     */
    private _rmSocket(socket : UpSocket,id : string){
        //register socket map
        const memberMap = this.regSockets.get(id);
        if(memberMap){
            memberMap.delete(socket);
            if(memberMap.size === 0){
                this.regSockets.delete(id);
                this._unregMember(id);
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
    private _regMember(id : string) {
        this.lastCudData.set(id,{timestamp : Date.now(),id : ''});
        const event = this.dbEventPreFix+id;
        this.scExchange.subscribe(event)
            .watch((data) => {
                if((data as DbWorkerCudPackage).w !== this.workerFullId) {
                    switch (data.action) {
                        case DbWorkerAction.cud:
                            this._processCudPackage(id,(data as DbWorkerCudPackage).d);
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
    private _unregMember(id : string) {
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
        const socketSet = this.regSockets.get(id);
        if(socketSet){
            const event = this.dbEventPreFix+id;
            for(let socket of socketSet.keys()) {
                socket.emit(event,dbClientPackage);
            }
        }
    }

    /**
     * Processes new cud packages.
     * @param id
     * @param cudPackage
     */
    private _processCudPackage(id : string,cudPackage : CudPackage){
        this._sendToSockets(id,{a : DbClientReceiverEvent.cud,d : cudPackage} as DbClientCudPackage);
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
        this._processCudPackage(id,cudPackage);
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
        const memberMap = this.regSockets.get(id);
        if(memberMap){
            const event = this.dbEventPreFix+id;
            for(let [socket, rmFunction] of memberMap.entries()) {
                socket.emit(event,closePackage);
                rmFunction();
            }
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

    /**
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
     * @param id
     * @param counter
     * @param sessionData
     */
    protected getData<T extends object = object>(id : string,counter : number,sessionData : T){
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
                const socketMap = this.regSockets.get(id);
                if(socketMap){
                    const removeFunc = socketMap.get(socket);
                    if(removeFunc){
                        socket.emit(this.dbEventPreFix+id,
                            {a : DbClientReceiverEvent.kickOut,c : code,d : data} as DbClientKickOutPackage);
                        removeFunc();
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
}

export interface DataBoxFamilyClass {
    config: DataBoxConfig;

    new(id : string, bag: Bag, dbPreparedData : DbPreparedData, idValidCheck : IdValidChecker, apiLevel : number | undefined): DataBoxFamily;

    prototype: any;
    name : string;

    readonly ___instance___ : DataBoxFamily | undefined;
}
