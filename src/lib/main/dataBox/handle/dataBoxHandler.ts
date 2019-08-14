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
import {
    DataBoxInfo,
    DataBoxConnectReq,
    DataBoxConnectRes,
    DbRegisterResult,
    DbToken
} from "../dbDefinitions";
import DataBoxReqUtils             from "./dataBoxReqUtils";
import {ErrorName}                 from "../../constants/errorName";
import DataBox                     from "../../../api/dataBox/DataBox";
import DataBoxUtils                from "../dataBoxUtils";

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

    async processConnectReq(input : DataBoxConnectReq, socket : UpSocket) : Promise<DataBoxConnectRes>
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

        const dbInfo : DataBoxInfo = {
            name : (input.d as string),
            id : undefined
        };

        //access and id check
        if(isFamily){
            await (db as DataBoxFamily)._checkIdIsValid(input.i as string);
            dbInfo.id = (input.i as string);
        }
        await db._checkAccess(socket,dbInfo);

        //token check
        let dbToken : undefined | DbToken = undefined;
        if(typeof input.t === 'string'){
            dbToken = await db._verifyDbToken(input.t,isFamily ? input.i : undefined);
        }
        if(!dbToken){
            dbToken = DataBoxUtils.createDbToken((await db._consumeInitInput(input.ii)));
        }

        //register
        let keys : DbRegisterResult;
        let lastCudId;
        if(isFamily){
            keys = await (db as DataBoxFamily)._registerSocket(socket,(input.i as string),dbToken);
            lastCudId = (db as DataBoxFamily)._getLastCudId(input.i as string);
        }
        else {
            keys = await (db as DataBox)._registerSocket(socket,dbToken);
            lastCudId = (db as DataBox)._getLastCudId();
        }

        return {
            ut : dbToken !== undefined,
            ci : lastCudId,
            pf : db.isParallelFetch(),
            i : keys.inputCh,
            o : keys.outputCh
        };
    }
}