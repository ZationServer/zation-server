/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description :
This class is to check the access for publish or subscribe channels.
It is used to check the access in the middleware or to check when the
token is changed.
 */
import Const         = require('../constants/constWrapper');
import Logger        = require('../logger/logger');
import ChTools       = require('./chTools');
import ObjectTools   = require('../tools/objectTools');
import SmallBag      = require("../../api/SmallBag");
import ZationConfig  = require("../../main/zationConfig");
import ZationWorker  = require("../../main/zationWorker");

class ChAccessEngine
{
    //Part Access
    private static hasAccessTo(value : any,socket : any,smallBag : SmallBag,info : object = {}) : boolean
    {
        let access = false;
        if(typeof value === 'boolean')
        {
            access = value;
        }
        else if(typeof value === 'string')
        {
            let {authUserGroup} = ChTools.generateInfo(socket);
            if(authUserGroup === value)
            {
                access = true;
            }
        }
        else if(typeof value === 'function')
        {
            let sInfo = ChTools.generateInfo(socket);
            ObjectTools.addObToOb(info,sInfo);
            let getFunc = ChTools.getGetSocketDataFunc(socket);

            let res = value(smallBag,sInfo,getFunc);
            if(typeof res === 'boolean')
            {
                access = res;
            }
        }
        else if(Array.isArray(value))
        {
            let {authUserGroup,userId} = ChTools.generateInfo(socket);

            for(let i = 0; i < value.length; i++)
            {
                if(typeof value[i] === 'string' && value[i] === authUserGroup)
                {
                    access = true;
                    break;
                }
                else if(typeof value[i] === 'number' && value[i] === userId)
                {
                    access = true;
                    break;
                }
            }
        }
        else if(typeof value === 'number')
        {
            let {userId} = ChTools.generateInfo(socket);
            if(userId === value)
            {
                access = true;
            }
        }
        return access;
    }

    //Part CustomCh Access

    static hasAccessToSub(socket, channelConfig : object, smallBag : SmallBag, info : object = {}) : boolean
    {
        if(channelConfig.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE))
        {
            let value = channelConfig[Const.Channel.CHANNEL.SUBSCRIBE];
            return ChAccessEngine.hasAccessTo(value,socket,smallBag,info);
        }
        else if(channelConfig.hasOwnProperty(Const.Channel.CHANNEL.NOT_SUBSCRIBE))
        {
            let value = channelConfig[Const.Channel.CHANNEL.NOT_SUBSCRIBE];
            return !ChAccessEngine.hasAccessTo(value,socket,smallBag,info);
        }
        else
        {
            //default if no setting found!
            return false;
        }
    }

    static hasAccessToPub(socket, channelConfig : object, smallBag : SmallBag, info : object = {}) : boolean
    {
        if(channelConfig.hasOwnProperty(Const.Channel.CHANNEL.PUBLISH))
        {
            let value = channelConfig[Const.Channel.CHANNEL.PUBLISH];
            return ChAccessEngine.hasAccessTo(value,socket,smallBag,info);
        }
        else if(channelConfig.hasOwnProperty(Const.Channel.CHANNEL.NOT_PUBLISH))
        {
            let value = channelConfig[Const.Channel.CHANNEL.NOT_PUBLISH];
            return !ChAccessEngine.hasAccessTo(value,socket,smallBag,info);
        }
        else
        {
            //default if no setting found!
            return false;
        }
    }

    //Part Middleware Checks

    static checkAccessSubCustomIdCh(socket,trySubName : string,smallBag : SmallBag,zc : ZationConfig) : any
    {
        //return error
        let {name,id} = ChTools.getCustomIdChannelInfo(trySubName);

        if(name === undefined || name === '')
        {
            let err = new Error('You need an name, to sub an customIdChannel!');
            // @ts-ignore'
            err.code = 4592;
            return Error;
        }
        if(id === undefined || id === '')
        {
            let err = new Error('You need an id, to sub an customIdChannel!');
            // @ts-ignore'
            err.code = 4591;
            return Error;
        }

        let chConfig = ChTools.getCustomIdChConfig(zc,name);

        if(chConfig === undefined)
        {
            let err = new Error('Unknown customIdChannel!');
            // @ts-ignore'
            err.code = 4593;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to subscribe an unknown customIdChannel. Name: '${name}',Id: '${id}'.`);
            return Error;
        }
        else
        {
            if(ChAccessEngine.hasAccessToSub(socket,chConfig,smallBag,{channelId : id}))
            {
                //allOk
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} subscribes customIdChannel. Name: '${name}',Id: '${id}'.`);
                return undefined;
            }
            else
            {
                let err = new Error('No access to sub this customIdChannel!');
                // @ts-ignore'
                err.code = 4594;
                return err;
            }
        }
    }

    static checkAccessPubCustomIdCh(socket,tryPubName : string,smallBag : SmallBag,zc : ZationConfig) : any
    {
        //return error
        let {name,id} = ChTools.getCustomIdChannelInfo(tryPubName);

        if(name === undefined || name === '')
        {
            let err = new Error('You need an name, to pub in customIdChannel!');
            // @ts-ignore'
            err.code = 4595;
            return Error;
        }
        if(id === undefined || id === '')
        {
            let err = new Error('You need an id, to pub in customIdChannel!');
            // @ts-ignore'
            err.code = 4596;
            return Error;
        }

        let chConfig = ChTools.getCustomIdChConfig(zc,name);

        if(chConfig === undefined)
        {
            let err = new Error('Unknown customIdChannel!');
            // @ts-ignore'
            err.code = 4597;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to publish in unknown customIdChannel. Name: '${name}',Id: '${id}'.`);
            return Error;
        }
        else
        {
            if(ChAccessEngine.hasAccessToPub(socket,chConfig,smallBag,{channelId : id}))
            {
                //allOk
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} publish in customIdChannel. Name: '${name}',Id: '${id}'.`);
                return undefined;
            }
            else
            {
                let err = new Error('No access to publish in this customIdChannel!');
                // @ts-ignore'
                err.code = 4598;
                return err;
            }
        }
    }
    static checkAccessSubCustomCh(socket,trySubName : string,smallBag : SmallBag,zc : ZationConfig) : any
    {
        //return error
        let name = ChTools.getCustomChannelName(trySubName);

        if(name === undefined || name === '')
        {
            let err = new Error('You need an name, to sub a customChannel!');
            // @ts-ignore'
            err.code = 4582;
            return Error;
        }

        let chConfig = ChTools.getCustomChConfig(zc,name);

        if(chConfig === undefined)
        {
            let err = new Error('Unknown customChannel!');
            // @ts-ignore'
            err.code = 4583;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to subscribe an unknown customChannel. Name: '${name}'.`);
            return Error;
        }
        else
        {
            if(ChAccessEngine.hasAccessToSub(socket,chConfig,smallBag))
            {
                //allOk
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} subscribes a customChannel: '${name}'.`);
                return undefined;
            }
            else
            {
                let err = new Error('No access to subscribe this customChannel!');
                // @ts-ignore'
                err.code = 4584;
                return err;
            }
        }
    }
    static checkAccessPubCustomCh(socket,tryPubName : string,smallBag : SmallBag,zc : ZationConfig) : any
    {
        //return error
        let name = ChTools.getCustomChannelName(tryPubName);

        if(name === undefined || name === '')
        {
            let err = new Error('You need an name, to pub in customChannel!');
            // @ts-ignore'
            err.code = 4585;
            return Error;
        }

        let chConfig = ChTools.getCustomChConfig(zc,name);

        if(chConfig === undefined)
        {
            let err = new Error('Unknown customChannel!');
            // @ts-ignore'
            err.code = 4586;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to publish in an unknown customChannel. Name: '${name}'.`);
            return Error;
        }
        else
        {
            if(ChAccessEngine.hasAccessToPub(socket,chConfig,smallBag))
            {
                //allOk
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} publish in a customChannel: '${name}'.`);
                return undefined;
            }
            else
            {
                let err = new Error('No access to publish in this customChannel!');
                // @ts-ignore'
                err.code = 4587;
                return err;
            }
        }

    }

    //Part Check Access auto
    //(When the token is changed)

    static checkSocketCustomChAccess(socket, worker : ZationWorker) : void
    {
        let zc = worker.getZationConfig();
        if(socket !== undefined)
        {
            let subs = socket.subscriptions();

            for(let i = 0; i < subs.length; i++)
            {
                if(subs[i].indexOf(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX) !== -1)
                {
                    //custom id channel

                    let {name,id} = ChTools.getCustomIdChannelInfo(subs[i]);
                    let config = ChTools.getCustomIdChConfig(zc,name);
                    if(!ChAccessEngine.hasAccessToSub(socket,config,worker.getPreparedSmallBag(),{channelId : id}))
                    {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }
                else if(subs[i].indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1)
                {
                    //custom channel

                    let name = ChTools.getCustomChannelName(subs[i]);
                    let config = ChTools.getCustomChConfig(zc,name);
                    if(!ChAccessEngine.hasAccessToSub(socket,config,worker.getPreparedSmallBag()))
                    {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }
            }
        }
    }

    static checkSocketZationChAccess(socket) : void
    {
        if(socket !== undefined)
        {
            // noinspection JSUnresolvedFunction
            let token = socket.getAuthToken();
            let subs = socket.subscriptions();

            let authUserGroup = undefined;
            let userId = undefined;
            let panelAccess = undefined;

            if(token !== undefined && token !== null)
            {
                authUserGroup = token[Const.Settings.CLIENT.AUTH_USER_GROUP];
                userId = token[Const.Settings.CLIENT.USER_ID];
                panelAccess = token[Const.Settings.CLIENT.PANEL_ACCESS]
            }

            for(let i = 0; i < subs.length; i++)
            {
                //Default group channel
                if(subs[i] === Const.Settings.CHANNEL.DEFAULT_USER_GROUP
                    && authUserGroup !== ''
                    && authUserGroup !== undefined)
                {
                    ChTools.kickOut(socket,Const.Settings.CHANNEL.DEFAULT_USER_GROUP);
                }

                //Auth Group
                if(subs[i].indexOf(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX) !== -1)
                {
                    let authGroupSub = subs[i].replace(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX,'');
                    if(authUserGroup !== authGroupSub)
                    {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }

                //User Channel
                if(subs[i].indexOf(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX) !== -1)
                {
                    let userIdSub = subs[i].replace(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX,'');
                    if(userId !== userIdSub)
                    {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }

                //Panel Channel
                if(subs[i] === Const.Settings.CHANNEL.PANEL && !panelAccess)
                {
                    ChTools.kickOut(socket,subs[i]);
                }

            }
        }
    }

}

export = ChAccessEngine;
