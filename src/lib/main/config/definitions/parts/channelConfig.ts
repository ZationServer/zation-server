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

export interface ChannelConfig extends AccessConfig<ChSubAccessFunction> {
    /**
     * Defines the delay to unregister the Channel or a member of the ChannelFamily
     * internally when no one uses it anymore.
     * When a client starts to use it again, the delay timeout will be cancelled.
     * @default 120000ms
     */
    unregisterDelay?: number;
    /**
     * The maximal amount of members where a socket can connect to within this Channel.
     * Notice this option is only used in Channel Families.
     * @default 20
     */
    maxSocketMembers?: number;
}