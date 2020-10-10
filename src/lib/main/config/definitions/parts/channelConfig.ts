/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Socket               from "../../../../api/Socket";
// noinspection ES6PreferShortImport
import {ChannelInfo}        from '../../../channel/channelDefinitions';
import {AccessConfig}       from './accessConfigs';

export type ChSubAccessFunction = (socket: Socket, info: ChannelInfo) => Promise<boolean> | boolean;

export interface ChannelConfig extends AccessConfig<ChSubAccessFunction> {}