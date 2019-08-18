/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import SystemVersionChecker                                     from "../systemVersion/systemVersionChecker";
import ZationConfigFull                                         from "../config/manager/zationConfigFull";
import Bag                                                      from "../../api/Bag";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction}  from "../apiLevel/apiLevelUtils";
import DataBoxCore, {DbPreparedData}                            from "../../api/dataBox/DataBoxCore";
import ZationWorker                                           = require("../../core/zationWorker");
import {ClientErrorName}                                        from "../constants/clientErrorName";
import {DataBoxClassDef, DataBoxConfig}                         from "../config/definitions/dataBoxConfig";
import DataBoxFamily, {DataBoxFamilyClass}                      from "../../api/dataBox/DataBoxFamily";
import IdValidCheckerUtils                                      from "../id/idValidCheckerUtils";
import DataBox, {DataBoxClass}                                  from "../../api/dataBox/DataBox";
import InputClosureCreator                                      from "../input/inputClosureCreator";
import DataBoxAccessHelper                                      from "./dataBoxAccessHelper";
import DbConfigUtils from "./dbConfigUtils";

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
            err.name = ClientErrorName.API_LEVEL_NOT_COMPATIBLE;
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
            err.name = ClientErrorName.UNKNOWN_DATA_BOX;
            throw err;
        }
    }

    /**
     * Prepare all DataBoxes.
     */
    async prepare() : Promise<void> {
        const uDataBoxes = this.zc.appConfig.dataBoxes || {};

        const promises : Promise<void>[] = [];
        for(let name in uDataBoxes) {
            if(uDataBoxes.hasOwnProperty(name)) {
                promises.push(this.addDataBox(name,uDataBoxes[name]));
            }
        }
        await Promise.all(promises);
    }

    /**
     * Add a DataBox to the prepare process.
     * @param name
     * @param definition
     */
    private async addDataBox(name : string,definition : DataBoxClassDef | ApiLevelSwitch<DataBoxClassDef>) : Promise<void>
    {
        if(typeof definition === 'function') {
            const preparedDataBoxData = await this.processDataBox(definition,name);
            this.dataBoxes[name] = () => {
                return preparedDataBoxData
            };
        }
        else {
            const promises : Promise<void>[] = [];
            const preparedDataMapper : Record<any,DataBoxCore> = {};
            for(let k in definition){
                if(definition.hasOwnProperty(k)) {
                    promises.push((async () => {
                        preparedDataMapper[k] = await this.processDataBox(definition[k],name,parseInt(k));
                    })());
                }
            }
            await Promise.all(promises);
            this.dataBoxes[name] = ApiLevelUtils.createApiLevelSwitcher<DataBoxCore>(preparedDataMapper);
        }
    }

    /**
     * Process a DataBox and create the prepared data.
     * @param dataBox
     * @param name
     * @param apiLevel
     */
    private async processDataBox(dataBox : DataBoxClassDef,name : string,apiLevel ?: number) : Promise<DataBoxCore>
    {
        const config : DataBoxConfig = dataBox.config;

        const dbPreparedData : DbPreparedData = {
            versionAccessCheck : SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(config),
            accessCheck : DataBoxAccessHelper.createAccessChecker(config,this.bag),
            initInputConsumer : InputClosureCreator.createInputConsumer(DbConfigUtils.convertDbInitInput(config),this.bag),
            fetchInputConsumer : InputClosureCreator.createInputConsumer(DbConfigUtils.convertDbFetchInput(config),this.bag),
            parallelFetch : config.parallelFetch !== undefined ? config.parallelFetch : false,
            maxBackpressure : config.maxBackpressure !== undefined ? config.maxBackpressure : 30,
            maxSocketInputChannels : config.maxSocketInputChannels !== undefined ?
                config.maxSocketInputChannels : 20
        };

        let dbInstance;
        if(dataBox.prototype instanceof DataBox){
            dbInstance = new (dataBox as DataBoxClass)
            (name,this.worker.getPreparedBag(),dbPreparedData,apiLevel);
        }
        else if(dataBox.prototype instanceof DataBoxFamily){
            dbInstance = new (dataBox as DataBoxFamilyClass)
            (name,this.worker.getPreparedBag(),dbPreparedData,
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