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
import Const                = require('../constants/constWrapper');
import Logger               = require('../logger/logger');
import ChTools              = require('./chTools');
import SmallBag             = require("../../api/SmallBag");
import ZationConfig         = require("../../main/zationConfig");
import ZationWorker         = require("../../main/zationWorker");
import AccessChInfo         = require("../infoObjects/accessChInfo");

class ChAccessEngine
{
    //Part Access
    private static async hasAccessTo(value : any,socket : any,smallBag : SmallBag,chId ?: string) : Promise<boolean>
    {
        let access = false;

        if(typeof value === 'boolean')
        {
            access = value;
        }
        else
        {
            let info  : AccessChInfo = new AccessChInfo(socket,chId);

            if(typeof value === 'string')
            {
                if(value === Const.Channel.ACCESS.ALL)
                {
                    access = true;
                }
                else if(value === Const.Channel.ACCESS.ALL_AUTH)
                {
                    access = info.isAuthIn;
                }
                else if(value === Const.Channel.ACCESS.ALL_NOT_AUTH)
                {
                    access = !info.isAuthIn;
                }
                else if(info.authUserGroup === value)
                {
                    //Group!
                    access = true;
                }
            }
            else if(typeof value === 'function')
            {
                let getFunc = ChTools.getGetSocketDataFunc(socket);

                let res = await value(smallBag,info,getFunc);
                if(typeof res === 'boolean')
                {
                    access = res;
                }
            }
            else if(Array.isArray(value))
            {
                for(let i = 0; i < value.length; i++)
                {
                    if(typeof value[i] === 'string' && value[i] === info.authUserGroup)
                    {
                        access = true;
                        break;
                    }
                    else if(typeof value[i] === 'number' && value[i] === info.userId)
                    {
                        access = true;
                        break;
                    }
                }
            }
            else if(typeof value === 'number')
            {
                if(info.userId === value)
                {
                    access = true;
                }
            }
        }

        return access;
    }

    //Part CustomCh Access

    static async hasAccessToSub(socket, channelConfig : object, smallBag : SmallBag, chId ?: string) : Promise<boolean>
    {
        if(channelConfig.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE))
        {
            let value = channelConfig[Const.Channel.CHANNEL.SUBSCRIBE];
            return await ChAccessEngine.hasAccessTo(value,socket,smallBag,chId);
        }
        else if(channelConfig.hasOwnProperty(Const.Channel.CHANNEL.NOT_SUBSCRIBE))
        {
            let value = channelConfig[Const.Channel.CHANNEL.NOT_SUBSCRIBE];
            return !(await ChAccessEngine.hasAccessTo(value,socket,smallBag,chId));
        }
        else
        {
            //default if no setting found!
            return false;
        }
    }

    static async hasAccessToPub(socket, channelConfig : object, smallBag : SmallBag,chId ?: string) : Promise<boolean>
    {
        if(channelConfig.hasOwnProperty(Const.Channel.CHANNEL.PUBLISH))
        {
            let value = channelConfig[Const.Channel.CHANNEL.PUBLISH];
            return await ChAccessEngine.hasAccessTo(value,socket,smallBag,chId);
        }
        else if(channelConfig.hasOwnProperty(Const.Channel.CHANNEL.NOT_PUBLISH))
        {
            let value = channelConfig[Const.Channel.CHANNEL.NOT_PUBLISH];
            return !( await ChAccessEngine.hasAccessTo(value,socket,smallBag,chId));
        }
        else
        {
            //default if no setting found!
            return false;
        }
    }

    //Part Middleware Checks

    static async checkAccessSubCustomIdCh(socket,trySubName : string,smallBag : SmallBag,zc : ZationConfig) : Promise<any>
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
            if(await (ChAccessEngine.hasAccessToSub(socket,chConfig,smallBag,id)))
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

    static async checkAccessPubCustomIdCh(socket,tryPubName : string,smallBag : SmallBag,zc : ZationConfig) : Promise<any>
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
            if(await (ChAccessEngine.hasAccessToPub(socket,chConfig,smallBag,id)))
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
    static async checkAccessSubCustomCh(socket,trySubName : string,smallBag : SmallBag,zc : ZationConfig) : Promise<any>
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
            if(await (ChAccessEngine.hasAccessToSub(socket,chConfig,smallBag)))
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
    static async checkAccessPubCustomCh(socket,tryPubName : string,smallBag : SmallBag,zc : ZationConfig) : Promise<any>
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
            if((await ChAccessEngine.hasAccessToPub(socket,chConfig,smallBag)))
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

    static async checkSocketCustomChAccess(socket, worker : ZationWorker) : Promise<void>
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
                    if(! (await ChAccessEngine.hasAccessToSub(socket,config,worker.getPreparedSmallBag(),id)))
                    {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }
                else if(subs[i].indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1)
                {
                    //custom channel

                    let name = ChTools.getCustomChannelName(subs[i]);
                    let config = ChTools.getCustomChConfig(zc,name);
                    if(! (await ChAccessEngine.hasAccessToSub(socket,config,worker.getPreparedSmallBag())))
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
