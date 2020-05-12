/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import SystemVersionChecker                                     from "../systemVersion/systemVersionChecker";
import ZationConfigFull                                         from "../config/manager/zationConfigFull";
import Bag                                                      from "../../api/Bag";
import ApiLevelUtils, {ApiLevelSwitch}                          from "../apiLevel/apiLevelUtils";
import DataboxCore, {DbPreparedData}                            from "../../api/databox/DataboxCore";
import ZationWorker                                           = require("../../core/zationWorker");
import {ClientErrorName}                                        from "../constants/clientErrorName";
// noinspection ES6PreferShortImport
import {DataboxConfig}                                          from "../config/definitions/parts/databoxConfig";
import DataboxFamily                                            from "../../api/databox/DataboxFamily";
import Databox                                                  from "../../api/databox/Databox";
import InputClosureCreator                                      from "../input/inputClosureCreator";
import DataboxAccessHelper                                      from "./databoxAccessHelper";
import DbConfigUtils                                            from "./dbConfigUtils";
import {AnyDataboxClass}                                        from '../../api/databox/AnyDataboxClass';
import ComponentPrepare                                         from '../component/componentPrepare';
import DynamicSingleton                                         from '../utils/dynamicSingleton';

export default class DataboxPrepare extends ComponentPrepare<DataboxCore>
{
    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        super(zc,worker,bag);
    }

    /**
     * Prepare all Databoxes.
     */
    prepare(): void {
        const uDataboxes = this.zc.appConfig.databoxes || {};
        for(const identifier in uDataboxes) {
            if(uDataboxes.hasOwnProperty(identifier)) {
                this.addDatabox(identifier,uDataboxes[identifier]);
            }
        }
    }

    protected createIncompatibleAPILevelError(): Error {
        const err: any = new Error('The client API level is incompatible with Databox API levels.');
        err.name = ClientErrorName.ApiLevelIncompatible;
        return err;
    }

    protected createComponentNotExistsError(identifier: string): Error {
        const err: any = new Error(`The Databox: '${identifier}' not exists.`);
        err.name = ClientErrorName.UnknownDatabox;
        return err;
    }

    /**
     * Add a Databox to the prepare process.
     * @param identifier
     * @param definition
     */
    private addDatabox(identifier: string,definition: AnyDataboxClass | ApiLevelSwitch<AnyDataboxClass>): void
    {
        if(typeof definition === 'function') {
            const databoxInstance = this.processDatabox(definition,identifier);
            this.components[identifier] = () => {
                return databoxInstance
            };
        }
        else {
            const databoxInstanceMapper: Record<any,DataboxCore> = {};
            for(const k in definition){
                if(definition.hasOwnProperty(k)) {
                    databoxInstanceMapper[k] = this.processDatabox(definition[k],identifier,parseInt(k));
                }
            }
            this.components[identifier] = ApiLevelUtils.createApiLevelSwitcher<DataboxCore>(databoxInstanceMapper);
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
        const config: DataboxConfig = databox.config || {};

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

        const dbInstance = DynamicSingleton.create<AnyDataboxClass,Databox | DataboxFamily>
            (databox,identifier,this.bag,dbPreparedData,apiLevel);

        this.addInit(dbInstance);

        return dbInstance;
    }
}