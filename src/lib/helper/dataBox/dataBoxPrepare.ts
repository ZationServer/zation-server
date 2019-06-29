/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../systemVersion/systemVersionChecker";
import AuthAccessChecker, {TokenStateAccessCheckFunction}       from "../auth/authAccessChecker";
import ZationConfigFull                                         from "../config/manager/zationConfigFull";
import SmallBag                                                 from "../../api/SmallBag";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction}  from "../apiLevel/apiLevelUtils";
import DataBoxCore                                              from "../../api/dataCollection/DataBoxCore";
import ZationWorker                                           = require("../../main/zationWorker");
import {ErrorName}                                              from "../constants/errorName";
import {DataBoxClassDef, DataBoxConfig}                         from "../config/definitions/dataBoxConfig";
import DataIdBox                                                from "../../api/dataCollection/DataIdBox";
import IdValidCheckerUtils, {IdValidChecker}                    from "../id/idValidCheckerUtils";

interface DataBoxPrepareData {
    dataBoxConfig : DataBoxConfig,
    dataBoxInstance : DataBoxCore,
    versionAccessCheck : VersionSystemAccessCheckFunction,
    systemAccessCheck : VersionSystemAccessCheckFunction,
    tokenStateCheck : TokenStateAccessCheckFunction,
    idValidChecker ?: IdValidChecker
}

export default class DataBoxPrepare
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private readonly smallBag : SmallBag;

    private readonly dataBoxes : Record<string,ApiLevelSwitchFunction<DataBoxPrepareData>>;

    constructor(zc : ZationConfigFull,worker : ZationWorker,smallBag : SmallBag)
    {
        this.zc = zc;
        this.worker = worker;
        this.smallBag = smallBag;

        this.dataBoxes = {};
    }

    /**
     * It will return the DataBox prepared data.
     * If no DatBox with the API level is found, it will thrown an API level not compatible error.
     * @param id
     * @param apiLevel
     */
    getDataBoxPrepareData(id : string,apiLevel : number) : DataBoxPrepareData
    {
        const dataBox = this.dataBoxes[id](apiLevel);
        if(dataBox !== undefined){
            return dataBox;
        }
        else {
            const err : any = new Error('The client API level is not compatible with dataBox API levels.');
            err.name = ErrorName.API_LEVEL_NOT_COMPATIBLE;
            throw err;
        }
    }

    /**
     * Returns a boolean that indicates if the DataBox exists.
     * @param id
     */
    isDataBoxExist(id : string) : boolean {
        return this.dataBoxes.hasOwnProperty(id);
    }

    /**
     * Checks if the DataBox exists.
     * It will throw a error if the DataBox is not found.
     * @param id
     */
    checkDataBoxExist(id : string) : void
    {
        if(!this.isDataBoxExist(id)) {
            const err : any = new Error(`The DataBox: '${id}' not exists.`);
            err.name = ErrorName.UNKNOWN_DATABOX;
            throw err;
        }
    }

    /**
     * Prepare all DataBoxes.
     */
    async prepare() : Promise<void> {
        const uDataBoxes = this.zc.appConfig.dataBoxes || {};

        const promises : Promise<void>[] = [];
        for(let cId in uDataBoxes) {
            if(uDataBoxes.hasOwnProperty(cId)) {
                promises.push(this.addDataBox(cId,uDataBoxes[cId]));
            }
        }
        await Promise.all(promises);
    }

    /**
     * Add a DataBox to the prepare process.
     * @param id
     * @param definition
     */
    private async addDataBox(id : string,definition : DataBoxClassDef | ApiLevelSwitch<DataBoxClassDef>) : Promise<void>
    {
        if(typeof definition === 'function') {
            const preparedDataBoxData = await this.processDataBox(definition,id);
            this.dataBoxes[id] = () => {
                return preparedDataBoxData
            };
        }
        else {
            const promises : Promise<void>[] = [];
            const preparedDataMapper : Record<any,DataBoxPrepareData> = {};
            for(let k in definition){
                if(definition.hasOwnProperty(k)) {
                    promises.push((async () => {
                        preparedDataMapper[k] = await this.processDataBox(definition[k],id,parseInt(k));
                    })());
                }
            }
            await Promise.all(promises);
            this.dataBoxes[id] = ApiLevelUtils.createApiLevelSwitcher<DataBoxPrepareData>(preparedDataMapper);
        }
    }

    /**
     * Process a DataBox and create the prepared data.
     * @param dataBox
     * @param id
     * @param apiLevel
     */
    private async processDataBox(dataBox : DataBoxClassDef,id : string,apiLevel ?: number) : Promise<DataBoxPrepareData>
    {
        const config : DataBoxConfig = dataBox.config;
        const dbInstance : DataBoxCore = new dataBox(id,this.worker.getPreparedSmallBag(),apiLevel);
        await dbInstance.initialize(this.worker.getPreparedSmallBag());

        const extraPrepare = dbInstance instanceof DataIdBox ? {
            idValidChecker : IdValidCheckerUtils.createIdValidChecker(dbInstance.isIdValid,this.smallBag)
        } : {};

        return  {
            dataBoxConfig : config,
            dataBoxInstance : dbInstance,
            versionAccessCheck : SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(config),
            tokenStateCheck : AuthAccessChecker.createAuthAccessChecker(config,this.smallBag),
            ...extraPrepare
        };
    }
}