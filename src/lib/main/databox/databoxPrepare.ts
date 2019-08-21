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

export default class DataboxPrepare
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private readonly bag : Bag;

    private readonly databoxes : Record<string,ApiLevelSwitchFunction<DataboxCore>>;

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
     * it will throw an API level not compatible error,
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
            const err : any = new Error('The client API level is not compatible with databox API levels.');
            err.name = ClientErrorName.API_LEVEL_NOT_COMPATIBLE;
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
            err.name = ClientErrorName.UNKNOWN_DATA_BOX;
            throw err;
        }
    }

    /**
     * Prepare all Databoxes.
     */
    async prepare() : Promise<void> {
        const uDataboxes = this.zc.appConfig.databoxes || {};

        const promises : Promise<void>[] = [];
        for(let name in uDataboxes) {
            if(uDataboxes.hasOwnProperty(name)) {
                promises.push(this.addDatabox(name,uDataboxes[name]));
            }
        }
        await Promise.all(promises);
    }

    /**
     * Add a Databox to the prepare process.
     * @param name
     * @param definition
     */
    private async addDatabox(name : string,definition : DataboxClassDef | ApiLevelSwitch<DataboxClassDef>) : Promise<void>
    {
        if(typeof definition === 'function') {
            const preparedDataboxData = await this.processDatabox(definition,name);
            this.databoxes[name] = () => {
                return preparedDataboxData
            };
        }
        else {
            const promises : Promise<void>[] = [];
            const preparedDataMapper : Record<any,DataboxCore> = {};
            for(let k in definition){
                if(definition.hasOwnProperty(k)) {
                    promises.push((async () => {
                        preparedDataMapper[k] = await this.processDatabox(definition[k],name,parseInt(k));
                    })());
                }
            }
            await Promise.all(promises);
            this.databoxes[name] = ApiLevelUtils.createApiLevelSwitcher<DataboxCore>(preparedDataMapper);
        }
    }

    /**
     * Process a Databox and create the prepared data.
     * @param databox
     * @param name
     * @param apiLevel
     */
    private async processDatabox(databox : DataboxClassDef, name : string, apiLevel ?: number) : Promise<DataboxCore>
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

        Object.defineProperty(databox,'___instance___',{
            value : dbInstance,
            configurable : false,
            enumerable : false,
            writable : false
        });

        await dbInstance.initialize(this.worker.getPreparedBag());

        return dbInstance;
    }
}