/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket          from "../sc/socket";
import Logger            from "../logger/logger";
import PubData           from "../internalApi/pubData";
import {ZationChannel}   from "./channelDefinitions";

export default class ChUtils
{

    /**
     * Build a custom channel.
     * @param name
     * @param id
     */
    static buildCustomChannelName(name ?: string,id ?: string) : string {
        if(name !== undefined) {
            if(id !== undefined){
                return ZationChannel.CUSTOM_CHANNEL_PREFIX + name +
                    ZationChannel.CUSTOM_CHANNEL_ID_SEPARATOR + id;
            }
            else {
                return ZationChannel.CUSTOM_CHANNEL_PREFIX + name;
            }
        }
        else {
            return ZationChannel.CUSTOM_CHANNEL_PREFIX;
        }
    }

    /**
     * Get custom channel info from a built string.
     * @param ch
     */
    static getCustomChannelInfo(ch : string) : {name : string,id : string | undefined} {
        const nameAndId = ch.split('.');
        return {
            name : nameAndId[1],
            id : nameAndId[2]
        };
    }

    /**
     * Get custom channel name from a built string.
     * @param ch
     */
    static getCustomChannelName(ch : string) : string {
        return ch.split('.')[1];
    }

    /**
     * Build auth user group channel name.
     * @param authUserGroup
     */
    static buildAuthUserGroupChName(authUserGroup : string = '') : string {
        return ZationChannel.AUTH_USER_GROUP_PREFIX + authUserGroup;
    }

    /**
     * Get auth user group from a built channel string.
     * @param ch
     */
    static getUserAuthGroupFromCh(ch : string) : string {
        return ch.split('.')[1];
    }

    /**
     * Build user channel name.
     * @param id
     */
    static buildUserChName(id : number | string) : string {
        return ZationChannel.USER_CHANNEL_PREFIX+id;
    }

    /**
     * Get user id from a built channel string.
     * @param ch
     */
    static getUserIdFromCh(ch : string) : string {
        return ch.split('.')[1];
    }

    /**
     * Kick the socket from a channel with debug log.
     * @param socket
     * @param channel
     */
    static kickOut(socket : UpSocket, channel : string) : void {
        // noinspection JSUnresolvedFunction,JSValidateTypes,TypeScriptValidateJSTypes
        socket.kickOut(channel);
        Logger.printDebugInfo(`Socket with id: ${socket.id} is kicked from channel ${channel}`);
    }

    /**
     * Kick socket from channels with search string.
     * @param socket
     * @param search
     */
    static kickOutSearch(socket : UpSocket, search : string) : void {
        const subs : string[] = socket.subscriptions();
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
    static subscriptionSearch(socket : UpSocket, search : string) : string[] {
        return socket.subscriptions().filter((s) => {
            return s.indexOf(search) !== -1;
        });
    }

    /**
     * Returns if the search string is included in the subscriptions.
     * @param socket
     * @param search
     */
    static subscriptionFindSearch(socket : UpSocket, search : string) : boolean {
        const subs : string[] = socket.subscriptions();
        for(let i = 0; i < subs.length; i++) {
            if(subs[i].indexOf(search) !== -1) {return true;}
        }
        return false;
    }

    /**
     * Returns all custom channel subscriptions of a socket.
     * @param socket
     * @param name (optional filter for a specific name)
     */
    static getCustomChannelSubscriptions(socket : UpSocket,name ?: string) : string[] {
        return ChUtils.subscriptionSearch(socket,ChUtils.buildCustomChannelName(name));
    }

    /**
     * Returns if the socket has subscribed the user channel.
     * @param socket
     */
    static hasSubUserCh(socket : UpSocket) : boolean {
        return ChUtils.subscriptionFindSearch(socket,ZationChannel.USER_CHANNEL_PREFIX);
    }

    /**
     * Returns if the socket has subscribed the auth user group channel.
     * @param socket
     */
    static hasSubAuthUserGroupCh(socket : UpSocket) : boolean {
        return ChUtils.subscriptionFindSearch(socket,ZationChannel.AUTH_USER_GROUP_PREFIX);
    }

    /**
     * Returns if the socket has subscribed the default user group channel.
     * @param socket
     */
    static hasSubDefaultUserGroupCh(socket : UpSocket) : boolean {
        return socket.subscriptions().includes(ZationChannel.DEFAULT_USER_GROUP);
    }

    /**
     * Returns if the socket has subscribed the all channel.
     * @param socket
     */
    static hasSubAllCh(socket : UpSocket) : boolean {
        return socket.subscriptions().includes(ZationChannel.ALL);
    }

    /**
     * Returns if the socket has subscribed the custom channel.
     * @param socket
     * @param name
     * @param id
     */
    static hasSubCustomCh(socket : UpSocket,name ?: string, id ?: string) : boolean {
        return ChUtils.subscriptionFindSearch(socket,ChUtils.buildCustomChannelName(name,id));
    }

    /**
     * Returns if the socket has subscribed the panel out channel.
     * @param socket
     */
    static hasSubPanelOutCh(socket : UpSocket) : boolean {
        return socket.subscriptions().includes(ZationChannel.PANEL_OUT);
    }

    /**
     * Kick socket from custom channel/s.
     * @param socket
     * @param name
     * @param id
     */
    static kickCustomChannel(socket : UpSocket, name ?: string, id ?: string) : void {
        ChUtils.kickOutSearch(socket,ChUtils.buildCustomChannelName(name,id));
    }

    /**
     * Add the socket sid to publish data.
     * @param req
     * @param socket
     */
    static pubDataAddSocketSrcSid(req : any,socket : UpSocket) {
        if(typeof req.data === "object") {
            req.data['ssi'] = socket.sid;
        }
    }

    /**
     * Builds publish data.
     * @param eventName
     * @param data
     * @param srcSocketSid
     */
    static buildData(eventName : string,data : any,srcSocketSid ?: string) : PubData
    {
        return {
            e : eventName,
            d : data,
            sSid : srcSocketSid
        };
    }
}