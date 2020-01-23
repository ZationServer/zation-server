/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import SystemVersionChecker                                     from "../systemVersion/systemVersionChecker";
import ZationConfigFull                                         from "../config/manager/zationConfigFull";
import Bag                                                      from "../../api/Bag";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction}  from "../apiLevel/apiLevelUtils";
import DataboxCore, {DbPreparedData}                            from "../../api/databox/DataboxCore";
import ZationWorker                                           = require("../../core/zationWorker");
import {ClientErrorName}                                        from "../constants/clientErrorName";
import {DataboxClassDef, DataboxConfig}                         from "../config/definitions/databoxConfig";
import DataboxFamily, {DataboxFamilyClass}                      from "../../api/databox/DataboxFamily";
import IdValidCheckerUtils                                      from "../id/idValidCheckerUtils";
import Databox, {DataboxClass}                                  from "../../api/databox/Databox";
import InputClosureCreator                                      from "../input/inputClosureCreator";
import DataboxAccessHelper                                      from "./databoxAccessHelper";
import DbConfigUtils                                            from "./dbConfigUtils";

export const databoxIsFamilySymbol                            = Symbol();
export const databoxInstanceSymbol                            = Symbol();

export default class DataboxPrepare
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private readonly bag : Bag;

    private readonly databoxes : Record<string,ApiLevelSwitchFunction<DataboxCore>>;
    private readonly databoxInits : ((bag : Bag) => Promise<void> | void)[] = [];

    constructor(zc : ZationConfigFull,worker : ZationWorker,bag : Bag)
    {
        this.zc = zc;
        this.worker = worker;
        this.bag = bag;

        this.databoxes = {};
    }

    /**
     * It will return the Databox instance.
     * If no DatBox with the API level is found,
     * it will throw an API level incompatible error,
     * and when the Databox does not exist, it also throws an error.
     * @param name
     * @param apiLevel
     */
    getDatabox(name : string,apiLevel : number) : DataboxCore
    {
        //throws if not exists
        this.checkDataboxExist(name);

        const databox = this.databoxes[name](apiLevel);
        if(databox !== undefined){
            return databox;
        }
        else {
            const err : any = new Error('The client API level is incompatible with databox API levels.');
            err.name = ClientErrorName.API_LEVEL_INCOMPATIBLE;
            throw err;
        }
    }

    /**
     * Returns a boolean that indicates if the Databox exists.
     * @param name
     */
    isDataboxExist(name : string) : boolean {
        return this.databoxes.hasOwnProperty(name);
    }

    /**
     * Returns if this instance is a Databox family.
     * Works only with instances from the preparer.
     * @param db
     */
    static isDataBoxFamily(db : DataboxCore) : boolean {
        return db[databoxIsFamilySymbol];
    }

    /**
     * Checks if the Databox exists.
     * It will throw a error if the Databox is not found.
     * @param name
     */
    checkDataboxExist(name : string) : void
    {
        if(!this.isDataboxExist(name)) {
            const err : any = new Error(`The Databox: '${name}' not exists.`);
            err.name = ClientErrorName.UNKNOWN_DATABOX;
            throw err;
        }
    }

    /**
     * Prepare all Databoxes.
     */
    async prepare() : Promise<void> {
        const uDataboxes = this.zc.appConfig.databoxes || {};
        for(let name in uDataboxes) {
            if(uDataboxes.hasOwnProperty(name)) {
                this.addDatabox(name,uDataboxes[name]);
            }
        }
        await this.initDataboxes();
    }

    /**
     * Add a Databox to the prepare process.
     * @param name
     * @param definition
     */
    private addDatabox(name : string,definition : DataboxClassDef | ApiLevelSwitch<DataboxClassDef>) : void
    {
        if(typeof definition === 'function') {
            const preparedDataboxData = this.processDatabox(definition,name);
            this.databoxes[name] = () => {
                return preparedDataboxData
            };
        }
        else {
            const preparedDataMapper : Record<any,DataboxCore> = {};
            for(let k in definition){
                if(definition.hasOwnProperty(k)) {
                    preparedDataMapper[k] = this.processDatabox(definition[k],name,parseInt(k));
                }
            }
            this.databoxes[name] = ApiLevelUtils.createApiLevelSwitcher<DataboxCore>(preparedDataMapper);
        }
    }

    /**
     * Process a Databox and create the prepared data.
     * @param databox
     * @param name
     * @param apiLevel
     */
    private processDatabox(databox : DataboxClassDef, name : string, apiLevel ?: number) : DataboxCore
    {
        const config : DataboxConfig = databox.config;

        const dbPreparedData : DbPreparedData = {
            versionAccessCheck : SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(config),
            accessCheck : DataboxAccessHelper.createAccessChecker(config,this.bag),
            initInputConsumer : InputClosureCreator.createInputConsumer(DbConfigUtils.convertDbInitInput(config),this.bag),
            fetchInputConsumer : InputClosureCreator.createInputConsumer(DbConfigUtils.convertDbFetchInput(config),this.bag),
            parallelFetch : config.parallelFetch !== undefined ? config.parallelFetch : false,
            maxBackpressure : config.maxBackpressure !== undefined ? config.maxBackpressure : 30,
            maxSocketInputChannels : config.maxSocketInputChannels !== undefined ?
                config.maxSocketInputChannels : 20
        };

        let dbInstance;
        if(databox.prototype instanceof Databox){
            dbInstance = new (databox as DataboxClass)
            (name,this.worker.getPreparedBag(),dbPreparedData,apiLevel);
            dbInstance[databoxIsFamilySymbol] = false;
        }
        else if(databox.prototype instanceof DataboxFamily){
            dbInstance = new (databox as DataboxFamilyClass)
            (name,this.worker.getPreparedBag(),dbPreparedData,
                IdValidCheckerUtils.createIdValidChecker(databox.prototype.isIdValid,this.bag)
                ,apiLevel);
            dbInstance[databoxIsFamilySymbol] = true;
        }
        else {
            throw new Error('Unexpected Databox class type');
        }

        Object.defineProperty(databox,databoxInstanceSymbol,{
            value : dbInstance,
            configurable : false,
            enumerable : false,
            writable : false
        });

        this.databoxInits.push(dbInstance.initialize);

        return dbInstance;
    }

    /**
     * Calls every initialize method of each databox.
     */
    private async initDataboxes() {
        const length = this.databoxInits.length;
        const promises : (Promise<void> | void)[] = [];
        for(let i = 0; i < length; i++){
            promises.push(this.databoxInits[i](this.bag));
        }
        await Promise.all(promises);
    }
}