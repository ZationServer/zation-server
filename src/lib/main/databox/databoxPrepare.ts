/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfigFull                                         from "../config/manager/zationConfigFull";
import Bag                                                      from "../../api/Bag";
import ApiLevelUtils, {ApiLevelSwitch}                          from "../apiLevel/apiLevelUtils";
import DataboxCore, {DbPreparedData}                            from "../../api/databox/DataboxCore";
import ZationWorker                                           = require("../../core/zationWorker");
import {ClientErrorName}                                        from "../definitions/clientErrorName";
// noinspection ES6PreferShortImport
import {DataboxConfig, DbAccessFunction}                        from '../config/definitions/parts/databoxConfig';
import DataboxFamily                                            from "../../api/databox/DataboxFamily";
import Databox                                                  from '../../api/databox/Databox';
import InputClosureCreator                                      from "../input/inputClosureCreator";
import {AnyDataboxClass}                                        from '../../api/databox/AnyDataboxClass';
import ComponentPrepare                                         from '../component/componentPrepare';
import DynamicSingleton                                         from '../utils/dynamicSingleton';
import ObjectUtils                                              from '../utils/objectUtils';
import {Writable}                                               from '../utils/typeUtils';
import AccessUtils                                              from '../access/accessUtils';
import {buildOptions}                                           from '../utils/buildOptions';

export default class DataboxPrepare extends ComponentPrepare<DataboxCore,DataboxConfig>
{
    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        super(zc,worker,bag,'Databox',
            zc.appConfig.databoxes || {},
            zc.appConfig.databoxDefaults);
    }

    protected createIncompatibleAPILevelError(): Error {
        const err: any = new Error('The client API level is incompatible with Databox API levels.');
        err.name = ClientErrorName.ApiLevelIncompatible;
        return err;
    }

    protected createComponentNotExistsError(identifier: string): Error {
        const err: any = new Error(`The Databox: '${identifier}' does not exist.`);
        err.name = ClientErrorName.UnknownDatabox;
        return err;
    }

    /**
     * Prepare a Databox.
     * @param identifier
     * @param definition
     */
    protected _prepare(identifier: string, definition: AnyDataboxClass | ApiLevelSwitch<AnyDataboxClass>): void
    {
        if(typeof definition === 'function') {
            const databoxInstance = this.processDatabox(definition,identifier);
            this.components[identifier] = () => databoxInstance;
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
        ObjectUtils.mergeTwoObjects(config, this.componentDefaultConfig, false);
        (databox as Writable<AnyDataboxClass>).config = config;

        const dbPreparedData: DbPreparedData = buildOptions<DbPreparedData>({
            checkAccess: AccessUtils.createAccessChecker<DbAccessFunction>(config.access,`Databox: ${identifier}`),
            consumeOptionsInput: InputClosureCreator.createInputConsumer(config.optionsInput),
            consumeFetchInput: InputClosureCreator.createInputConsumer(config.fetchInput),
            validateMemberInput: InputClosureCreator.createInputValidator(config.memberInput || {type: 'string'}),
            parallelFetch: false,
            maxBackpressure: 30,
            maxSocketInputChannels: 10,
            fetchLastCudData: 500,
            unregisterDelay: 120000,
            maxSocketMembers: 20,
            initialData: undefined,
            reloadStrategy: null
        }, config);

        const dbInstance = DynamicSingleton.create<AnyDataboxClass,Databox | DataboxFamily>
            (databox,identifier,this.bag,dbPreparedData,apiLevel);

        this.addInit(dbInstance);

        return dbInstance;
    }
}