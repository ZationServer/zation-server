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
import {DataboxConfig}                                          from "../config/definitions/parts/databoxConfig";
import DataboxFamily, {DataboxFamilyClass}                      from "../../api/databox/DataboxFamily";
import MemberCheckerUtils                                       from "../member/memberCheckerUtils";
import Databox, {DataboxClass}                                  from "../../api/databox/Databox";
import InputClosureCreator                                      from "../input/inputClosureCreator";
import DataboxAccessHelper                                      from "./databoxAccessHelper";
import DbConfigUtils                                            from "./dbConfigUtils";
import {AnyDataboxClass}                                        from '../../api/databox/AnyDataboxClass';

export const databoxIsFamilySymbol                            = Symbol();
export const databoxInstanceSymbol                            = Symbol();

export default class DataboxPrepare
{
    private readonly zc: ZationConfigFull;
    private readonly worker: ZationWorker;
    private readonly bag: Bag;

    private readonly databoxes: Record<string,ApiLevelSwitchFunction<DataboxCore>>;
    private readonly databoxInits: ((bag: Bag) => Promise<void> | void)[] = [];

    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag)
    {
        this.zc = zc;
        this.worker = worker;
        this.bag = bag;

        this.databoxes = {};
    }

    /**
     * It will return the Databox instance.
     * If no Databox with the API level is found,
     * it will throw an API level incompatible error,
     * and when the Databox does not exist, it also throws an error.
     * @param identifier
     * @param apiLevel
     */
    getDatabox(identifier: string,apiLevel: number): DataboxCore
    {
        //throws if not exists
        this.checkDataboxExist(identifier);

        const databox = this.databoxes[identifier](apiLevel);
        if(databox !== undefined){
            return databox;
        }
        else {
            const err: any = new Error('The client API level is incompatible with databox API levels.');
            err.name = ClientErrorName.ApiLevelIncompatible;
            throw err;
        }
    }

    /**
     * Returns a boolean that indicates if the Databox exists.
     * @param identifier
     */
    isDataboxExist(identifier: string): boolean {
        return this.databoxes.hasOwnProperty(identifier);
    }

    /**
     * Returns if this instance is a Databox family.
     * Works only with instances from the preparer.
     * @param db
     */
    static isDataBoxFamily(db: DataboxCore): boolean {
        return db[databoxIsFamilySymbol];
    }

    /**
     * Checks if the Databox exists.
     * It will throw a error if the Databox is not found.
     * @param identifier
     */
    checkDataboxExist(identifier: string): void
    {
        if(!this.isDataboxExist(identifier)) {
            const err: any = new Error(`The Databox: '${identifier}' not exists.`);
            err.name = ClientErrorName.UnknownDatabox;
            throw err;
        }
    }

    /**
     * Prepare all Databoxes.
     */
    async prepare(): Promise<void> {
        const uDataboxes = this.zc.appConfig.databoxes || {};
        for(const identifier in uDataboxes) {
            if(uDataboxes.hasOwnProperty(identifier)) {
                this.addDatabox(identifier,uDataboxes[identifier]);
            }
        }
        await this.initDataboxes();
    }

    /**
     * Add a Databox to the prepare process.
     * @param identifier
     * @param definition
     */
    private addDatabox(identifier: string,definition: AnyDataboxClass | ApiLevelSwitch<AnyDataboxClass>): void
    {
        if(typeof definition === 'function') {
            const preparedDataboxData = this.processDatabox(definition,identifier);
            this.databoxes[identifier] = () => {
                return preparedDataboxData
            };
        }
        else {
            const preparedDataMapper: Record<any,DataboxCore> = {};
            for(const k in definition){
                if(definition.hasOwnProperty(k)) {
                    preparedDataMapper[k] = this.processDatabox(definition[k],identifier,parseInt(k));
                }
            }
            this.databoxes[identifier] = ApiLevelUtils.createApiLevelSwitcher<DataboxCore>(preparedDataMapper);
        }
    }

    /**
     * Process a Databox and create the prepared data.
     * @param databox
     * @param identifier
     * @param apiLevel
     */
    private processDatabox(databox: AnyDataboxClass, identifier: string, apiLevel?: number): DataboxCore
    {
        const config: DataboxConfig = databox.config;

        const dbPreparedData: DbPreparedData = {
            versionAccessCheck: SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(config),
            accessCheck: DataboxAccessHelper.createAccessChecker(config.access,this.bag,identifier),
            initInputConsumer: InputClosureCreator.createInputConsumer(DbConfigUtils.convertDbInitInput(config),this.bag),
            fetchInputConsumer: InputClosureCreator.createInputConsumer(DbConfigUtils.convertDbFetchInput(config),this.bag),
            parallelFetch: config.parallelFetch !== undefined ? config.parallelFetch: false,
            maxBackpressure: config.maxBackpressure !== undefined ? config.maxBackpressure: 30,
            maxSocketInputChannels: config.maxSocketInputChannels !== undefined ?
                config.maxSocketInputChannels: 20
        };

        let dbInstance;
        if(databox.prototype instanceof Databox){
            dbInstance = new (databox as DataboxClass)
            (identifier,this.worker.getPreparedBag(),dbPreparedData,apiLevel);
            dbInstance[databoxIsFamilySymbol] = false;
        }
        else if(databox.prototype instanceof DataboxFamily){
            dbInstance = new (databox as DataboxFamilyClass)
            (identifier,this.worker.getPreparedBag(),dbPreparedData,
                MemberCheckerUtils.createIsMemberChecker(databox.prototype.isMember,this.bag)
                ,apiLevel);
            dbInstance[databoxIsFamilySymbol] = true;
        }
        else {
            throw new Error('Unexpected Databox class type');
        }

        Object.defineProperty(databox,databoxInstanceSymbol,{
            value: dbInstance,
            configurable: false,
            enumerable: false,
            writable: false
        });

        this.databoxInits.push(dbInstance.initialize);

        return dbInstance;
    }

    /**
     * Calls every initialize method of each databox.
     */
    private async initDataboxes() {
        const length = this.databoxInits.length;
        const promises: (Promise<void> | void)[] = [];
        for(let i = 0; i < length; i++){
            promises.push(this.databoxInits[i](this.bag));
        }
        await Promise.all(promises);
    }
}