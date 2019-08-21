/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket, {RespondFunction} from "../../sc/socket";
import DataboxPrepare              from "../databoxPrepare";
import ZationConfig                from "../../config/manager/zationConfig";
import DataboxCore                 from "../../../api/databox/DataboxCore";
import DataboxFamily               from "../../../api/databox/DataboxFamily";
import {
    DataboxInfo,
    DataboxConnectReq,
    DataboxConnectRes,
    DbRegisterResult,
    DbToken
} from "../dbDefinitions";
import DataboxReqUtils             from "./databoxReqUtils";
import {ClientErrorName}           from "../../constants/clientErrorName";
import Databox                     from "../../../api/databox/Databox";
import DataboxUtils                from "../databoxUtils";
import ObjectUtils                 from "../../utils/objectUtils";
import Logger                      from "../../logger/logger";
import zationConfig                from "../../config/manager/zationConfig";

export default class DataboxHandler
{
    private readonly dbPrepare : DataboxPrepare;
    private readonly defaultApiLevel : number;
    private readonly socketDataboxLimit : number;
    private readonly zc : zationConfig;
    private readonly debug : boolean;

    constructor(dbPrepare : DataboxPrepare, zc : ZationConfig) {
        this.dbPrepare = dbPrepare;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
        this.socketDataboxLimit = zc.mainConfig.socketDataboxLimit;
        this.zc = zc;
        this.debug = zc.isDebug();
    }

    async processConnectReq(input : DataboxConnectReq, socket : UpSocket,respond : RespondFunction) : Promise<void> {
        try {
            respond(null,(await this._processConnectReq(input,socket)));
        }
        catch (err) {respond(err);}
    }

    private async _processConnectReq(input : DataboxConnectReq, socket : UpSocket) : Promise<DataboxConnectRes>
    {
        //check request valid
        if(!DataboxReqUtils.isValidReqStructure(input)) {
            const err : any = new Error(`Not valid req structure.`);
            err.name = ClientErrorName.INVALID_REQUEST;
            throw err;
        }

        //exists?
        const reqApiLevel = typeof input.al === 'number' ? Math.floor(input.al) : undefined;
        const apiLevel = reqApiLevel || socket.apiLevel || this.defaultApiLevel;

        //throws if not exists or api level is not compatible
        const db : DataboxCore = this.dbPrepare.getDatabox((input.d as string),apiLevel);

        if(this.debug){
            Logger.printDebugInfo(`Databox Connection Request -> `,input);
        }
        if(this.zc.mainConfig.logDataboxRequests){
            Logger.logFileInfo(`Databox Connection Request -> `,input);
        }

        const isFamily = DataboxPrepare.isDataBoxFamily(db);
        const idProvided = input.i !== undefined;

        if(isFamily && !idProvided){
            const err : any = new Error(`The id is missing to request a DataboxFamily.`);
            err.name = ClientErrorName.ID_MISSING;
            throw err;
        }
        if(!isFamily && idProvided){
            const err : any = new Error(`Unknown id provided to request a Databox.`);
            err.name = ClientErrorName.UNKNOWN_ID;
            throw err;
        }

        if(socket.databoxes.length > this.socketDataboxLimit){
            const err : any = new Error(`Socket limit of Databoxes is reached.`);
            err.name = ClientErrorName.DATA_BOX_LIMIT_REACHED;
            throw err;
        }

        const dbInfo : DataboxInfo = {
            name : (input.d as string),
            id : undefined
        };

        //access and id check
        if(isFamily){
            await (db as DataboxFamily)._checkIdIsValid(input.i as string);
            dbInfo.id = (input.i as string);
        }
        await db._checkAccess(socket,dbInfo);

        //token check and init data
        let dbToken : undefined | DbToken = undefined;
        let usedToken = false;
        let processedInitData : any;
        try {
            if(typeof input.t === 'string'){
                const tmpDbToken = await db._verifyDbToken(input.t,isFamily ? input.i : undefined);
                if(tmpDbToken){
                    processedInitData = await db._consumeInitInput(tmpDbToken.rawInitData);
                    usedToken = true;
                    dbToken = tmpDbToken;
                }
            }
        }
        catch (e) {}
        if(!dbToken){
            dbToken = DataboxUtils.createDbToken(input.ii);
            processedInitData = await db._consumeInitInput(input.ii);
        }

        if(typeof processedInitData === 'object'){
            ObjectUtils.deepFreeze(processedInitData);
        }

        //register
        let keys : DbRegisterResult;
        let lastCudId;
        if(isFamily){
            keys = await (db as DataboxFamily)._registerSocket(socket,(input.i as string),dbToken,processedInitData);
            lastCudId = (db as DataboxFamily)._getLastCudId(input.i as string);
        }
        else {
            keys = await (db as Databox)._registerSocket(socket,dbToken,processedInitData);
            lastCudId = (db as Databox)._getLastCudId();
        }

        return {
            ut : usedToken,
            ci : lastCudId,
            pf : db.isParallelFetch(),
            i : keys.inputCh,
            o : keys.outputCh
        };
    }

}