/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker                = require("../../core/zationWorker");
import BackError                     from "../../api/BackError";
import {MainBackErrors}              from "../systemBackErrors/mainBackErrors";
import Bag                           from "../../api/Bag";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import InputClosureCreator           from "../input/inputClosureCreator";
import ApiLevelUtils, {ApiLevelSwitch}                                           from "../apiLevel/apiLevelUtils";
import ComponentPrepare                                                          from '../component/componentPrepare';
import DynamicSingleton                                                          from '../utils/dynamicSingleton';
import Receiver, {ReceiverClass, ReceiverPreparedData}                           from '../../api/Receiver';
// noinspection ES6PreferShortImport
import {ReceiverConfig}                                                          from '../../main/config/definitions/parts/receiverConfig';
import CompHandleMiddlewareUtils                                                 from '../compHandleMiddleware/compHandleMiddlewareUtils';
import {systemReceivers}                                                         from './systemReceivers/systemReceivers.config';
import ObjectUtils                                                               from '../utils/objectUtils';
import {Writable}                                                                from '../utils/typeUtils';
import AccessUtils                                                               from '../access/accessUtils';
import {NormalAccessCustomFunction}                                              from '../config/definitions/parts/accessConfigs';

export default class ReceiverPrepare extends ComponentPrepare<Receiver,ReceiverConfig>
{
    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        super(zc,worker,bag,'Receiver',
            Object.assign(systemReceivers,zc.appConfig.receivers || {}),
            zc.appConfig.receiverDefaults);
    }

    protected createIncompatibleAPILevelError(identifier: string, apiLevel: number): Error {
        return new BackError(MainBackErrors.apiLevelIncompatible,
            {identifier, apiLevel: apiLevel});
    }

    protected createComponentNotExistsError(identifier: string): Error {
        return new BackError(MainBackErrors.unknownReceiver, {identifier});
    }

    /**
     * Prepare a Receiver.
     * @param identifier
     * @param definition
     */
    protected _prepare(identifier: string, definition: ReceiverClass | ApiLevelSwitch<ReceiverClass>): void
    {
        if(typeof definition === 'function') {
            const receiverInstance = this.processReceiver(definition,identifier);
            this.components[identifier] = () => receiverInstance;
        }
        else {
            const receiverInstanceMapper: Record<any,Receiver> = {};
            for(const k in definition){
                if(definition.hasOwnProperty(k)) {
                    receiverInstanceMapper[k] = this.processReceiver(definition[k],identifier,parseInt(k));
                }
            }
            this.components[identifier] = ApiLevelUtils.createApiLevelSwitcher<Receiver>(receiverInstanceMapper);
        }
    }

    /**
     * Process a receiver and create the prepared data.
     * @param receiver
     * @param identifier
     * @param apiLevel
     */
    private processReceiver(receiver: ReceiverClass,identifier: string,apiLevel?: number): Receiver
    {
        const config: ReceiverConfig = receiver.config || {};
        ObjectUtils.mergeTwoObjects(config, this.componentDefaultConfig, false);
        (receiver as Writable<ReceiverClass>).config = config;

        const preparedData: ReceiverPreparedData = {
            receiverConfig: config,
            checkAccess: AccessUtils.createAccessChecker<NormalAccessCustomFunction>
                (config.access,`Receiver: ${identifier}`),
            handleMiddlewareInvoke: CompHandleMiddlewareUtils.createInvoker(config),
            consumeInput: InputClosureCreator.createInputConsumer(config.input)
        };

        const rInstance: Receiver = DynamicSingleton.create<ReceiverClass,Receiver>
            (receiver,identifier,preparedData,apiLevel);

        this.addInit(rInstance);

        return rInstance;
    }
}