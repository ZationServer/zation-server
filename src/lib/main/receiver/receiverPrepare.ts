/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker                = require("../../core/zationWorker");
import BackError                     from "../../api/BackError";
import SystemVersionChecker          from "../systemVersion/systemVersionChecker";
import {MainBackErrors}              from "../zationBackErrors/mainBackErrors";
import Bag                           from "../../api/Bag";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import InputClosureCreator           from "../input/inputClosureCreator";
import ApiLevelUtils, {ApiLevelSwitch}                                           from "../apiLevel/apiLevelUtils";
import FuncUtils                                                                 from '../utils/funcUtils';
import {ErrorEventSingleton}                                                     from '../error/errorEventSingleton';
import ComponentPrepare                                                          from '../component/componentPrepare';
import DynamicSingleton                                                          from '../utils/dynamicSingleton';
import Receiver, {ReceiverClass, ReceiverPreparedData}                           from '../../api/Receiver';
// noinspection ES6PreferShortImport
import {ReceiverConfig}                                                          from '../../main/config/definitions/parts/receiverConfig';
import ReceiverAccessHelper                                                      from './receiverAccessHelper';
import CompHandleMiddlewareUtils                                                 from '../compHandleMiddleware/compHandleMiddlewareUtils';

export default class ReceiverPrepare extends ComponentPrepare<Receiver>
{
    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        super(zc,worker,bag);
    }

    protected createIncompatibleAPILevelError(identifier: string, apiLevel: number): Error {
        return new BackError(MainBackErrors.apiLevelIncompatible,
            {identifier, apiLevel: apiLevel});
    }

    protected createComponentNotExistsError(identifier: string): Error {
        return new BackError(MainBackErrors.unknownReceiver, {identifier});
    }

    prepare(): void {
        const receivers = this.zc.appConfig.receivers || {};
        for(const rIdentifier in receivers) {
            if(receivers.hasOwnProperty(rIdentifier)) {
                this.addReceiver(rIdentifier,receivers[rIdentifier])
            }
        }
    }

    /**
     * Adds a receiver.
     * @param identifier
     * @param definition
     */
    private addReceiver(identifier: string,definition: ReceiverClass | ApiLevelSwitch<ReceiverClass>): void
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

        const preparedData: ReceiverPreparedData = {
            receiverConfig: config,
            versionAccessCheck: SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(config),
            tokenStateCheck: ReceiverAccessHelper.createAuthAccessChecker(config.access,this.bag,identifier),
            handleMiddlewareInvoke: CompHandleMiddlewareUtils.createInvoker(config),
            inputConsume: InputClosureCreator.createInputConsumer(config,this.bag),
            finallyHandle: FuncUtils.createSafeCaller((reqBag,input) => rInstance.finallyHandle(reqBag,input),
                `An error was thrown on the: 'Receiver ${identifier}', ${nameof<Receiver>(s => s.finallyHandle)}:`,
                ErrorEventSingleton.get())
        };

        const rInstance: Receiver = DynamicSingleton.create<ReceiverClass,Receiver>
            (receiver,identifier,this.bag,preparedData,apiLevel);

        this.addInit(rInstance);

        return rInstance;
    }
}