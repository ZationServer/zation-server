/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfigFull                    from "../config/manager/zationConfigFull";
import Bag                                 from "../../api/Bag";
import ApiLevelUtils, {ApiLevelSwitch}     from '../apiLevel/apiLevelUtils';
import ChannelCore, {ChPreparedData}       from '../../api/channel/ChannelCore';
import {ClientErrorName}                   from '../definitions/clientErrorName';
import {AnyChannelClass}                   from '../../api/channel/AnyChannelClass';
// noinspection ES6PreferShortImport
import {ChannelConfig, ChSubAccessFunction} from '../config/definitions/parts/channelConfig';
import ZationWorker                      = require('../../core/zationWorker');
import ComponentPrepare                    from '../component/componentPrepare';
import DynamicSingleton                    from '../utils/dynamicSingleton';
import Channel                             from '../../api/channel/Channel';
import ChannelFamily                       from '../../api/channel/ChannelFamily';
import {systemChannels}                    from './systemChannels/systemChannels.config';
import ObjectUtils                         from '../utils/objectUtils';
import {Writable}                          from '../utils/typeUtils';
import AccessUtils                         from '../access/accessUtils';
import InputClosureCreator                 from '../input/inputClosureCreator';

export class ChannelPrepare extends ComponentPrepare<ChannelCore,ChannelConfig>
{
    constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        super(zc,worker,bag,'Channel',
            Object.assign(systemChannels,zc.appConfig.channels || {}),
            zc.appConfig.channelDefaults);
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
        ObjectUtils.mergeTwoObjects(config, this.componentDefaultConfig, false);
        (channel as Writable<AnyChannelClass>).config = config;

        const chPreparedData: ChPreparedData = {
            checkAccess: AccessUtils.createAccessChecker<ChSubAccessFunction>
                (config.access,`Channel: ${identifier}`),
            validateMemberInput: InputClosureCreator.createInputValidator(config.memberInput || {type: 'string'}),
            unregisterDelay: config.unregisterDelay !== undefined ? config.unregisterDelay : 120000,
            maxSocketMembers: config.maxSocketMembers !== undefined ? config.maxSocketMembers : 20
        };

        const chInstance = DynamicSingleton.create<AnyChannelClass,Channel | ChannelFamily>
            (channel,identifier,this.bag,chPreparedData,apiLevel);

        this.addInit(chInstance);

        return chInstance;
    }
}