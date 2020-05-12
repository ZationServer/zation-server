/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZSocket              from "../../../internalApi/zSocket";
import Bag                  from "../../../../api/Bag";
// noinspection ES6PreferShortImport
import {ChannelInfo}        from '../../../channel/channelDefinitions';
import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from './accessConfigs';

export type ChSubAccessFunction = (bag: Bag, socketInfo: ZSocket, info: ChannelInfo) => Promise<boolean> | boolean;

export interface ChannelConfig extends VersionAccessConfig, SystemAccessConfig, AuthAccessConfig<ChSubAccessFunction> {}