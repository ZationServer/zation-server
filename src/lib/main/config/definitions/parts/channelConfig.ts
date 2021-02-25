/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Socket               from "../../../../api/Socket";
// noinspection ES6PreferShortImport
import {ChannelInfo}        from '../../../channel/channelDefinitions';
import {AccessConfig}       from './accessConfigs';
import {Input}              from './inputConfig';

export type ChSubAccessFunction = (socket: Socket, info: ChannelInfo) => Promise<boolean> | boolean;

export interface ChannelConfig extends AccessConfig<ChSubAccessFunction> {
    /**
     * This property defines the member input.
     * This option allows you to define your custom composite members from different keys.
     * The client sends the member when it builds the connection to a ChannelFamily.
     * In a ChannelFamily, the member value is available in almost every function.
     * By default, any string value is allowed.
     * But you can use a model to define the member or allow any input with the 'any' literal.
     * Notice, the member will only be validated with the model but not transformed to
     * avoid member types' confusion and improve performance.
     * So it is not possible to add functions to member value.
     * @default value of type string
     * @example
     * @ObjectModel()
     * class CompositeChatMember {
     *  userId = Model({type: 'string'});
     *  chatId = Model({type: 'string'});
     * }
     * memberInput: CompositeChatMember
     * //Client can send  ->
     * {userId: 'Luca', chatId: 'sf0ij23r'}
     */
    memberInput?: Input;
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