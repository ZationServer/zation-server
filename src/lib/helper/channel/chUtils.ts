/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationChannel} from "../constants/internal";
import UpSocket          from "../sc/socket";
import Logger          from "../logger/logger";
import PubData         from "../infoObjects/pubData";

export default class ChUtils
{

    /**
     * Build a custom id channel name.
     * @param name
     * @param id
     */
    static buildCustomIdChannelName(name : string | undefined,id : string = '') : string {
        if(name !== undefined) {
            return ZationChannel.CUSTOM_ID_CHANNEL_PREFIX + name
                + ZationChannel.CUSTOM_CHANNEL_ID + id;
        }
        else {
            return ZationChannel.CUSTOM_ID_CHANNEL_PREFIX;
        }
    }

    /**
     * Get full the custom id channel info from a built string.
     * @param ch
     */
    static getCustomIdChannelInfo(ch : string) : {name : string,id : string} {
        const nameAndId = ch.split('.');
        return {
            name : nameAndId[1],
            id : nameAndId[2]
        };
    }

    /**
     * Get custom channel id channel name from a built string.
     * @param ch
     */
    static getCustomIdChannelName(ch : string) : string {
        return ch.split('.')[1];
    }

    /**
     * Build a custom channel name.
     * @param name
     */
    static buildCustomChannelName(name : string = '') : string {
        return ZationChannel.CUSTOM_CHANNEL_PREFIX + name;
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
     * Kick socket from custom id channel/s.
     * @param socket
     * @param name
     * @param id
     */
    static kickCustomIdChannel(socket : UpSocket, name ?: string, id ?: string) : void {
        ChUtils.kickOutSearch(socket,ChUtils.buildCustomIdChannelName(name,id));
    }


    /**
     * Kick socket from custom channel/s.
     * @param socket
     * @param name
     */
    static kickCustomChannel(socket : UpSocket, name ?: string) : void {
        ChUtils.kickOutSearch(socket,ChUtils.buildCustomChannelName(name));
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