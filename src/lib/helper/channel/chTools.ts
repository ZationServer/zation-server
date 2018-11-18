/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Logger        = require('../logger/logger');
import {ZationChannel} from "../constants/internal";
import {Socket} from "../sc/socket";

class ChTools
{
    static buildCustomIdChannelName(name ?: string,id : string = '') : string
    {
        if(!!name) {
            return ZationChannel.CUSTOM_ID_CHANNEL_PREFIX + name
                + ZationChannel.CUSTOM_CHANNEL_ID + id;
        }
        else {
            return ZationChannel.CUSTOM_ID_CHANNEL_PREFIX;
        }
    }

    static buildCustomChannelName(name : string = '') : string
    {
        return ZationChannel.CUSTOM_CHANNEL_PREFIX + name;
    }

    static buildAuthUserGroupChName(authUserGroup : string = '') : string
    {
        return ZationChannel.AUTH_USER_GROUP_PREFIX + authUserGroup;
    }

    static buildUserChName(id : number | string) : string
    {
        return ZationChannel.USER_CHANNEL_PREFIX+id;
    }

    static kickOut(socket,channel : string) : void
    {
        // noinspection JSUnresolvedFunction,JSValidateTypes,TypeScriptValidateJSTypes
        socket.kickOut(channel);
        Logger.printDebugInfo(`Socket with id: ${socket.id} is kick out from channel ${channel}`);
    }

    static getCustomIdChannelInfo(ch : string) : any
    {
        let nameAndId = ch.replace(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX,'')
            .split(ZationChannel.CUSTOM_CHANNEL_ID);

        if(nameAndId.length === 2)
        {
            return {
                name : nameAndId[0],
                id : nameAndId[1]
            };
        }
        else
        {
            return {
                name : nameAndId[0]
            };
        }
    }

    static getCustomIdChannelName(ch : string) : string {
        return ChTools.getCustomIdChannelInfo(ch).name;
    }

    static getUserIdFromCh(ch : string) : string {
        return ch.split('.')[2];
    }

    static getUserAuthGroupFromCh(ch : string) : string {
        return ch.split('.')[2];
    }

    static getCustomChannelName(ch : string) : string
    {
        return ch.replace(ZationChannel.CUSTOM_CHANNEL_PREFIX,'');
    }

    static pubDataAddSocketSrcSid(req : any,socket : Socket)
    {
        if(typeof req.data === "object") {
            req.data['ssi'] = socket.sid;
        }
    }

}

export = ChTools;
