/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {DataBoxConfig} from "../../helper/config/definitions/dataBoxConfig";
import SmallBag from "./../SmallBag";
import DataBoxCore, {DbPreparedData, SocketDbMemberData} from "./DataBoxCore";
import UpSocket from "../../helper/sc/socket";
import {IdValidChecker} from "../../helper/id/idValidCheckerUtils";
import {ScExchange} from "../../helper/sc/scServer";
import {
    CudAction,
    DATA_BOX_START_INDICATOR,
    DbClientReceiverAction,
    DbClientPackage,
    DbWorkerAction,
    DbWorkerCudPackage, DbClientSenderAction
} from "../../helper/dataBox/dbDefinitions";

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

    private readonly regSockets : Map<string,Map<UpSocket,SocketDbMemberData>> = new Map();
    private readonly lastCudIds : Map<string,{timestamp : number,id : string}> = new Map();
    private readonly idValidCheck : IdValidChecker;
    private readonly dbPreFix : string;
    private readonly scExchange : ScExchange;
    private readonly workerFullId : string;

    protected constructor(id : string,smallBag: SmallBag,dbPreparedData : DbPreparedData,idValidCheck : IdValidChecker,apiLevel : number | undefined) {
        super(id,smallBag,dbPreparedData,apiLevel);
        this.idValidCheck = idValidCheck;
        this.scExchange = smallBag.getWorker().scServer.exchange;
        this.workerFullId = smallBag.getWorker().getFullWorkerId();
        this.dbPreFix = `${DATA_BOX_START_INDICATOR}-${this.id}-${apiLevel !== undefined ? apiLevel : ''}-`;
    }

    //Core
    async _registerSocket(socket : UpSocket,id : string) : Promise<string> {

        await this.checkAccess(socket);
        await this.idValidCheck(id);


        const event = this.dbPreFix+id;

        socket.on(event,(data, response) => {
            switch (data.action) {
                case DbClientSenderAction.getLastCudId:
                    response(null,this._getLastCudId(id));
                    break;

                default :
                    response('Unknown action');
            }
        });

        const disconnectHandler = () => {
            this._unregisterSocket(socket,id);
            socket.off('disconnect',disconnectHandler);
        };
        socket.on('disconnect',disconnectHandler);

        this._addSocket(socket,id);

        return event;
    }

    _unregisterSocket(socket : UpSocket,id : string) {


        this._rmSocket(socket,id);
    }

    private _getLastCudId(id : string) : string {
        const lastCudId = this.lastCudIds.get(id);
        if(lastCudId){
            return lastCudId.id;
        }
        return '';
    }

    /**
     * Adds a socket internally in the map. (For getting updates of this family member)
     * @param socket
     * @param id
     * @param sessionData
     * @private
     */
    private _addSocket(socket : UpSocket,id : string,sessionData : object = {}){
        let memberMap = this.regSockets.get(id);
        if(!memberMap){
            memberMap = new Map();
            this._regMember(id);
            this.regSockets.set(id,memberMap);
        }
        memberMap.set(socket,{restoreSessionData : {},sessionData});
    }

    /**
     * Removes a socket internally in the map.
     * @param socket
     * @param id
     * @private
     */
    private _rmSocket(socket : UpSocket,id : string){
        const memberMap = this.regSockets.get(id);
        if(memberMap){
            memberMap.delete(socket);
            if(memberMap.size === 0){
                this.regSockets.delete(id);
                this._unregMember(id);
            }
        }
    }

    /**
     * Registers for listening to a new family member.
     * @param id
     * @private
     */
    private _regMember(id : string) {
        this.lastCudIds.set(id,{timestamp : Date.now(),id : ''});
        const event = this.dbPreFix+id;
        this.scExchange.subscribe(event)
            .watch((data) => {
                switch (data.action) {
                    case DbWorkerAction.cud:
                        if((data as DbWorkerCudPackage).wFullId !== this.workerFullId){
                            this.processCudAction(id,(data as DbWorkerCudPackage).data);
                        }
                        break;
                    default:
                }
            });
    }

    /**
     * Unregisters for listening to a family member.
     * @param id
     * @private
     */
    private _unregMember(id : string) {
        const channel = this.scExchange.channel(this.dbPreFix+id);
        channel.unwatch();
        channel.destroy();
        this.lastCudIds.delete(id);
    }

    /**
     * Sends a dataBox package to all sockets of a family member.
     * @param id
     * @param dbClientPackage
     */
    private updateSockets(id : string,dbClientPackage : DbClientPackage) {
        const socketMap = this.regSockets.get(id);
        if(socketMap){
            const event = this.dbPreFix+id;
            for(let socket of socketMap.keys()) {
                socket.emit(event,dbClientPackage);
            }
        }
    }

    /**
     * Processes a new cud package.
     * @param id
     * @param cudAction
     */
    private processCudAction(id : string,cudAction : CudAction){
        this.updateSockets(id,{action : DbClientReceiverAction.cud,data : cudAction});

        //updated last cud id.
        const lastCudId = this.lastCudIds.get(id);
        if(lastCudId && lastCudId.timestamp <= cudAction.timestamp){
            this.lastCudIds.set(id,{id : cudAction.cudId, timestamp : cudAction.timestamp});
        }
    }

    /**
     *
     * @param cudAction
     * @param id
     */
    private emitCudActions(cudAction : CudAction,id : string) {
        this.processCudAction(id,cudAction);
        const workerPackage : DbWorkerCudPackage = {
            action : DbWorkerAction.cud,
            data : cudAction,
            wFullId : this.workerFullId
        };
        this.scExchange.publish(this.dbPreFix+id,workerPackage);
    }

    insert(id : string,keyPath : string[], value : any) {


    }

    /**
     * **Can be overridden.**
     * This method is used to get the current data or more data of the DataBox.
     * You usually request your database and return the data, and if no more data is available,
     * you should throw a NoMoreDataAvailableError or call the internal noMoreDataAvailable method.
     * A client can call that method multiple times.
     * That's why the indicator parameter indicates the number of the current call.
     * Also, you extra get a session object, this object you can use to save variables that are
     * important to get more data in the future, for example, the last id of the item that the client had received.
     * The data what you are returning can be of any type.
     * But if you want to return more complex data,
     * it is recommended that the information consists of key-value able components
     * so that you can identify each value with a key path.
     * That can be done by using an object, a key-array, or a regular array which contains objects
     * (Than the property 'key' of the object will be used).
     * @param id
     * @param indicator
     * @param sessionData
     */
    protected getData(id : string,indicator : number,sessionData : object){
        this.noMoreDataAvailable();
    }


    // noinspection JSUnusedGlobalSymbols
    /**
     * **Can be overridden.**
     * Check if the member id is valid for this DataBoxFamily.
     * To block the id, you only need to return an object (that can be error information) or false.
     * If you want to allow the id, you have to return nothing or a true.
     * @param id
     * @param smallBag
     */
    public isIdValid(id : string,smallBag : SmallBag) : Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void {
    }

    /**
     * **Not override this method.**
     * The close function will close the DataBox with the id for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param id
     * @param code
     * @param data
     */
    close(id : string,code : number,data : any){
    }

    /**
     * **Not override this method.**
     * The reload function will force all clients of the DataBox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param id
     * @param forEveryServer
     */
    doReload(id : string,forEveryServer : boolean = false){
    }

    /**
     * **Not override this method.**
     * With this function, you can kick out a socket from all DataBoxes of this family.
     * This method is used internally.
     * @param socket
     */
    kickOut(socket : UpSocket) : void {

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

export interface DataIdBoxClass {
    config: DataBoxConfig;

    new(id : string,smallBag: SmallBag,dbPreparedData : DbPreparedData,idValidCheck : IdValidChecker,apiLevel : number | undefined): DataBoxFamily;

    prototype: any;
}
