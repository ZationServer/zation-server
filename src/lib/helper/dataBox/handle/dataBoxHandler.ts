/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket                    from "../../sc/socket";
import DataBoxPrepare              from "../dataBoxPrepare";
import ZationConfig                from "../../config/manager/zationConfig";
import DataBoxCore                 from "../../../api/dataBox/DataBoxCore";
import DataBoxFamily               from "../../../api/dataBox/DataBoxFamily";
import {DataBoxRegisterReq, DataBoxRegisterRes, DbRegisterResult, DbSessionData} from "../dbDefinitions";
import DataBoxReqUtils             from "./dataBoxReqUtils";
import {ErrorName}                 from "../../constants/errorName";
import DataBox                     from "../../../api/dataBox/DataBox";

export default class DataBoxHandler
{
    private readonly dbPrepare : DataBoxPrepare;
    private readonly defaultApiLevel : number;
    private readonly socketDataBoxLimit : number;

    constructor(dbPrepare : DataBoxPrepare,zc : ZationConfig) {
        this.dbPrepare = dbPrepare;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
        this.socketDataBoxLimit = zc.mainConfig.socketDataBoxLimit;
    }

    async processRegisterReq(input : DataBoxRegisterReq, socket : UpSocket) : Promise<DataBoxRegisterRes>
    {
        //check request valid
        if(!DataBoxReqUtils.isValidReqStructure(input)) {
            const err : any = new Error(`Not valid req structure.`);
            err.name = ErrorName.INVALID_REQUEST;
            throw err;
        }

        //exists?
        const reqApiLevel = typeof input.al === 'number' ? Math.floor(input.al) : undefined;
        const apiLevel = reqApiLevel || socket.apiLevel || this.defaultApiLevel;

        //throws if not exists or api level is not compatible
        const db : DataBoxCore = this.dbPrepare.getDataBox((input.d as string),apiLevel);

        const isFamily = DataBoxCore instanceof DataBoxFamily;
        const idProvided = input.i !== undefined;

        if(isFamily && !idProvided){
            const err : any = new Error(`The id is missing to request a DataBoxFamily.`);
            err.name = ErrorName.ID_MISSING;
            throw err;
        }
        if(!isFamily && idProvided){
            const err : any = new Error(`Unknown id provided to request a DataBox.`);
            err.name = ErrorName.UNKNOWN_ID;
            throw err;
        }

        if(socket.dataBoxes.length > this.socketDataBoxLimit){
            const err : any = new Error(`Socket limit of DataBoxes is reached.`);
            err.name = ErrorName.DATA_BOX_LIMIT_REACHED;
            throw err;
        }

        //access and id check
        if(isFamily){
            await (db as DataBoxFamily)._checkIdIsValid(input.i as string);
        }
        await db._checkAccess(socket);

        //token check
        let sessionData : undefined | DbSessionData = undefined;
        if(typeof input.t === 'string'){
            sessionData = await db._verifySessionToken(input.t,isFamily ? input.i : undefined);
        }

        //register
        let keys : DbRegisterResult;
        let lastCudId;
        if(isFamily){
            keys = await (db as DataBoxFamily)._registerSocket(socket,(input.i as string),sessionData);
            lastCudId = (db as DataBoxFamily)._getLastCudId(input.i as string);
        }
        else {
            keys = await (db as DataBox)._registerSocket(socket,sessionData);
            lastCudId = (db as DataBox)._getLastCudId();
        }

        return {
            ut : sessionData !== undefined,
            ci : lastCudId,
            pf : db.isParallelFetch(),
            i : keys.inputCh,
            o : keys.outputCh
        };
    }
}