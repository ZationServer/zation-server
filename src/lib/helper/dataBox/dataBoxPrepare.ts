/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SystemVersionChecker                                     from "../systemVersion/systemVersionChecker";
import AuthAccessChecker                                        from "../auth/authAccessChecker";
import ZationConfigFull                                         from "../config/manager/zationConfigFull";
import Bag                                                      from "../../api/Bag";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction}  from "../apiLevel/apiLevelUtils";
import DataBoxCore, {DbPreparedData}                            from "../../api/dataBox/DataBoxCore";
import ZationWorker                                           = require("../../main/zationWorker");
import {ErrorName}                                              from "../constants/errorName";
import {DataBoxClassDef, DataBoxConfig}                         from "../config/definitions/dataBoxConfig";
import DataBoxFamily, {DataBoxFamilyClass}                      from "../../api/dataBox/DataBoxFamily";
import IdValidCheckerUtils                                      from "../id/idValidCheckerUtils";
import DataBox, {DataBoxClass}                                  from "../../api/dataBox/DataBox";

export default class DataBoxPrepare
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private readonly bag : Bag;

    private readonly dataBoxes : Record<string,ApiLevelSwitchFunction<DataBoxCore>>;

    constructor(zc : ZationConfigFull,worker : ZationWorker,bag : Bag)
    {
        this.zc = zc;
        this.worker = worker;
        this.bag = bag;

        this.dataBoxes = {};
    }

    /**
     * It will return the DataBox instance.
     * If no DatBox with the API level is found,
     * it will throw an API level not compatible error,
     * and when the DataBox does not exist, it also throws an error.
     * @param id
     * @param apiLevel
     */
    getDataBox(id : string,apiLevel : number) : DataBoxCore
    {
        //throws if not exists
        this.checkDataBoxExist(id);

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
            err.name = ErrorName.UNKNOWN_DATA_BOX;
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
            const preparedDataMapper : Record<any,DataBoxCore> = {};
            for(let k in definition){
                if(definition.hasOwnProperty(k)) {
                    promises.push((async () => {
                        preparedDataMapper[k] = await this.processDataBox(definition[k],id,parseInt(k));
                    })());
                }
            }
            await Promise.all(promises);
            this.dataBoxes[id] = ApiLevelUtils.createApiLevelSwitcher<DataBoxCore>(preparedDataMapper);
        }
    }

    /**
     * Process a DataBox and create the prepared data.
     * @param dataBox
     * @param id
     * @param apiLevel
     */
    private async processDataBox(dataBox : DataBoxClassDef,id : string,apiLevel ?: number) : Promise<DataBoxCore>
    {
        const config : DataBoxConfig = dataBox.config;

        const dbPreparedData : DbPreparedData = {
            versionAccessCheck : SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(config),
            tokenStateAccessCheck : AuthAccessChecker.createAuthAccessChecker(config,this.bag)
        };

        let dbInstance;
        if(dataBox.prototype instanceof DataBox){
            dbInstance = new (dataBox as DataBoxClass)
            (id,this.worker.getPreparedBag(),dbPreparedData,apiLevel);
        }
        else if(dataBox.prototype instanceof DataBoxFamily){
            dbInstance = new (dataBox as DataBoxFamilyClass)
            (id,this.worker.getPreparedBag(),dbPreparedData,
                IdValidCheckerUtils.createIdValidChecker(dataBox.prototype.isIdValid,this.bag)
                ,apiLevel);
        }
        else {
            throw new Error('Unexpected DataBox class type');
        }

        Object.defineProperty(dataBox,'___instance___',{
            value : dbInstance,
            configurable : false,
            enumerable : false,
            writable : false
        });

        await dbInstance.initialize(this.worker.getPreparedBag());

        return dbInstance;
    }
}