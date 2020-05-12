/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfigFull                    from "../config/manager/zationConfigFull";
import Bag                                 from "../../api/Bag";
import ChAccessHelper                      from "./chAccessHelper";
import SystemVersionChecker                from "../systemVersion/systemVersionChecker";
import ApiLevelUtils, {ApiLevelSwitch}     from '../apiLevel/apiLevelUtils';
import ChannelCore, {ChPreparedData}       from '../../api/channel/ChannelCore';
import {ClientErrorName}                   from '../constants/clientErrorName';
import {AnyChannelClass}                   from '../../api/channel/AnyChannelClass';
// noinspection ES6PreferShortImport
import {ChannelConfig}                     from '../config/definitions/parts/channelConfig';
import ZationWorker                      = require('../../core/zationWorker');
import ComponentPrepare                    from '../component/componentPrepare';
import DynamicSingleton                    from '../utils/dynamicSingleton';
import Channel                             from '../../api/channel/Channel';
import ChannelFamily                       from '../../api/channel/ChannelFamily';

export class ChannelPrepare extends ComponentPrepare<ChannelCore>
{
    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        super(zc,worker,bag,'Channel',zc.appConfig.channels || {});
    }

    protected createIncompatibleAPILevelError(): Error {
        const err: any = new Error('The client API level is incompatible with Channel API levels.');
        err.name = ClientErrorName.ApiLevelIncompatible;
        return err;
    }

    protected createComponentNotExistsError(identifier: string): Error {
        const err: any = new Error(`The Channel: '${identifier}' not exists.`);
        err.name = ClientErrorName.UnknownChannel;
        return err;
    }

    /**
     * Prepare a Channel.
     * @param identifier
     * @param definition
     */
    protected _prepare(identifier: string, definition: AnyChannelClass | ApiLevelSwitch<AnyChannelClass>): void
    {
        if(typeof definition === 'function') {
            const preparedChannelData = this.processChannel(definition,identifier);
            this.components[identifier] = () => preparedChannelData;
        }
        else {
            const preparedDataMapper: Record<any,ChannelCore> = {};
            for(const k in definition){
                if(definition.hasOwnProperty(k)) {
                    preparedDataMapper[k] = this.processChannel(definition[k],identifier,parseInt(k));
                }
            }
            this.components[identifier] = ApiLevelUtils.createApiLevelSwitcher<ChannelCore>(preparedDataMapper);
        }
    }

    /**
     * Process a Channel and create the prepared data.
     * @param channel
     * @param identifier
     * @param apiLevel
     */
    private processChannel(channel: AnyChannelClass, identifier: string, apiLevel?: number): ChannelCore
    {
        const config: ChannelConfig = channel.config || {};

        const chPreparedData: ChPreparedData = {
            versionAccessCheck: SystemVersionChecker.createVersionChecker(config),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(config),
            accessCheck: ChAccessHelper.createSubAccessChecker(config.access,this.bag,identifier)
        };

        const chInstance = DynamicSingleton.create<AnyChannelClass,Channel | ChannelFamily>
            (channel,identifier,this.bag,chPreparedData,apiLevel);

        this.addInit(chInstance);

        return chInstance;
    }
}