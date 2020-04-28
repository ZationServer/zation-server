/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket          from "../sc/socket";
import Logger            from "../log/logger";
import PubData           from "../internalApi/pubData";
import {ZationChannel}   from "./channelDefinitions";
import {PubOutMiddlewareReq} from '../sc/scMiddlewareReq';

export default class ChUtils
{

    /**
     * Build a custom channel channel name.
     * @param identifier
     * @param member
     */
    static buildCustomChannelChName(identifier?: string, member?: string): string {
        if(identifier !== undefined) {
            if(member !== undefined){
                return ZationChannel.CUSTOM_CHANNEL_PREFIX + identifier +
                    ZationChannel.CUSTOM_CHANNEL_MEMBER_SEPARATOR + member;
            }
            else {
                return ZationChannel.CUSTOM_CHANNEL_PREFIX + identifier;
            }
        }
        else {
            return ZationChannel.CUSTOM_CHANNEL_PREFIX;
        }
    }

    /**
     * Get custom channel info from a built channel name string.
     * @param ch
     */
    static getCustomChannelInfo(ch: string): {identifier: string,member: string | undefined} {
        const identifierAndMember = ch.split('.');
        return {
            identifier: identifierAndMember[1],
            member: identifierAndMember[2]
        };
    }

    /**
     * Get custom channel identifier from a built channel name string.
     * @param ch
     */
    static getCustomChannelIdentifier(ch: string): string {
        return ch.split('.')[1];
    }

    /**
     * Build auth user group channel name.
     * @param authUserGroup
     */
    static buildAuthUserGroupChName(authUserGroup: string = ''): string {
        return ZationChannel.AUTH_USER_GROUP_PREFIX + authUserGroup;
    }

    /**
     * Get auth user group from a built channel string.
     * @param ch
     */
    static getUserAuthGroupFromCh(ch: string): string {
        return ch.split('.')[1];
    }

    /**
     * Build user channel name.
     * @param userId
     */
    static buildUserChName(userId: number | string): string {
        return ZationChannel.USER_CHANNEL_PREFIX+userId;
    }

    /**
     * Get user id from a built channel string.
     * @param ch
     */
    static getUserIdFromCh(ch: string): string {
        return ch.split('.')[1];
    }

    /**
     * Kick the socket from a channel with debug log.
     * @param socket
     * @param channel
     * @param target
     */
    static kickOut(socket: UpSocket, channel: string,target?: string): void {
        socket.kickOut(channel);
        Logger.log.debug(`Socket with id: ${socket.id} is kicked from ${target !== undefined ? target: `channel ${channel}`}.`);
    }

    /**
     * Kick socket from channels with search string.
     * @param socket
     * @param search
     */
    static kickOutSearch(socket: UpSocket, search: string): void {
        const subs: string[] = socket.subscriptions();
        for(let i = 0; i < subs.length; i++) {
            if(subs[i].indexOf(search) !== -1) {
                ChUtils.kickOut(socket,subs[i]);
            }
        }
    }

    /**
     * Returns all channel subscriptions with a search string.
     * @param socket
     * @param search
     */
    static subscriptionSearch(socket: UpSocket, search: string): string[] {
        return socket.subscriptions().filter((s) => {
            return s.indexOf(search) !== -1;
        });
    }

    /**
     * Returns if the search string is included in the subscriptions.
     * @param socket
     * @param search
     */
    static subscriptionFindSearch(socket: UpSocket, search: string): boolean {
        const subs: string[] = socket.subscriptions();
        for(let i = 0; i < subs.length; i++) {
            if(subs[i].indexOf(search) !== -1) {return true;}
        }
        return false;
    }

    /**
     * Returns all custom channel subscriptions of a socket.
     * @param socket
     * @param identifier (optional filter for a specific identifier)
     */
    static getCustomChannelSubscriptions(socket: UpSocket,identifier?: string): string[] {
        return ChUtils.subscriptionSearch(socket,ChUtils.buildCustomChannelChName(identifier));
    }

    /**
     * Returns if the socket has subscribed the user channel.
     * @param socket
     */
    static hasSubUserCh(socket: UpSocket): boolean {
        return ChUtils.subscriptionFindSearch(socket,ZationChannel.USER_CHANNEL_PREFIX);
    }

    /**
     * Returns if the socket has subscribed the auth user group channel.
     * @param socket
     */
    static hasSubAuthUserGroupCh(socket: UpSocket): boolean {
        return ChUtils.subscriptionFindSearch(socket,ZationChannel.AUTH_USER_GROUP_PREFIX);
    }

    /**
     * Returns if the socket has subscribed the default user group channel.
     * @param socket
     */
    static hasSubDefaultUserGroupCh(socket: UpSocket): boolean {
        return socket.subscriptions().includes(ZationChannel.DEFAULT_USER_GROUP);
    }

    /**
     * Returns if the socket has subscribed the all channel.
     * @param socket
     */
    static hasSubAllCh(socket: UpSocket): boolean {
        return socket.subscriptions().includes(ZationChannel.ALL);
    }

    /**
     * Returns if the socket has subscribed a custom channel.
     * @param socket
     * @param identifier
     * @param member
     */
    static hasSubCustomCh(socket: UpSocket,identifier?: string, member?: string): boolean {
        return ChUtils.subscriptionFindSearch(socket,ChUtils.buildCustomChannelChName(identifier,member));
    }

    /**
     * Returns if the socket has subscribed the panel out channel.
     * @param socket
     */
    static hasSubPanelOutCh(socket: UpSocket): boolean {
        return socket.subscriptions().includes(ZationChannel.PANEL_OUT);
    }

    /**
     * Kick socket from custom channel/s.
     * @param socket
     * @param identifier
     * @param member
     */
    static kickCustomChannel(socket: UpSocket, identifier?: string, member?: string): void {
        ChUtils.kickOutSearch(socket,ChUtils.buildCustomChannelChName(identifier,member));
    }

    /**
     * Add the socket sid to publish data.
     * @param req
     * @param socket
     */
    static pubInRequestAddSocketSrcSid(req: PubOutMiddlewareReq, socket: UpSocket) {
        if(typeof req.data === "object") {
            req.data.sSid = socket.sid;
        }
    }

    /**
     * Builds publish data.
     * @param eventName
     * @param data
     * @param srcSocketSid
     */
    static buildData(eventName: string,data: any,srcSocketSid?: string): PubData
    {
        return {
            e: eventName,
            d: data,
            sSid: srcSocketSid
        };
    }
}