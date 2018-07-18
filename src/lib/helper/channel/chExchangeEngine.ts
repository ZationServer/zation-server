/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description :
This class is to publish into channels with the scServer.exchange object.
It is used by the SmallBag and the ChannelEngine.
 */

import Const             = require('../constants/constWrapper');
import ChTools           = require('./chTools');
import ZationConfig      = require("../../main/zationConfig");
import Logger            = require("../logger/logger");
import {WorkerChActions} from "../constants/workerChActions";

class ChExchangeEngine
{
    private readonly scServer : any;

    constructor(scServer)
    {
        this.scServer = scServer;
    }

    publishAuthOut(userId  : any) : void
    {
        this.publishInUserCh(userId,Const.Settings.USER_CHANNEL.AUTH_OUT,{});
    }

    publishReAuth(userId : any) : void
    {
        this.publishInUserCh(userId,Const.Settings.USER_CHANNEL.RE_AUTH,{});
    }

    publish(channel : string,eventName : string,data : any,cb ?: Function) : void
    {
        // noinspection TypeScriptValidateJSTypes
        this.scServer.exchange.publish(channel,ChExchangeEngine.buildData(eventName,data),cb);
    }

    publishTaskToWorker(action : WorkerChActions,id : string | number | (string | number)[], ch ?: string)
    {
        let ids : (string | number)[] = [];
        if(!Array.isArray(id)) {
            ids = [id];
        }
        else {
            ids = id;
        }

        this.publishToWorker({ids,action,ch});
    }

    publishToWorker(data : any)
    {
        this.scServer.exchange.publish(Const.Settings.CHANNEL.ALL_WORKER,data,(e) => {
            if(e)
            {
                Logger.printWarning(`Failed to publish data: '${data.toString()}' in worker channel!`);
            }
        });
    }

    publishInUserCh(id : number | string | (string | number)[],eventName : string,data : any,cb ?: Function) : void
    {
        if(Array.isArray(id)) {
            for(let i = 0; i < id.length; i++) {
                this.publish(ChTools.buildUserChName(id[i]),eventName,data,cb)
            }
        }
        else {
            this.publish(ChTools.buildUserChName(id),eventName,data,cb)
        }
    }

    publishInDefaultUserGroupCh(eventName : string, data : any, cb ?: Function) : void
    {
        this.publish(Const.Settings.CHANNEL.DEFAULT_USER_GROUP,eventName,data,cb);
    }

    publishInAllCh(eventName : string,data : any,cb ?: Function) : void
    {
        this.publish(Const.Settings.CHANNEL.ALL,eventName,data,cb);
    }

    publishInAuthUserGroupCh(authUserGroup : string | string[], eventName : string, data : any, cb ?: Function) : void
    {
        if(Array.isArray(authUserGroup)) {
            for(let i = 0; i < authUserGroup.length; i++) {
                this.publish(ChTools.buildAuthUserGroupChName(authUserGroup[i]),eventName,data,cb);
            }
        }
        else {
            this.publish(ChTools.buildAuthUserGroupChName(authUserGroup),eventName,data,cb);
        }
    }

    static buildData(eventName : string,data : any) : object
    {
        return {
            e : eventName,
            d : data
        };
    }

    publishToAllAuthUserGroupCh(eventName : string, data : any,zc : ZationConfig,cb ?: Function)
    {
        let groups = zc.getApp(Const.App.KEYS.USER_GROUPS)[Const.App.USER_GROUPS.AUTH];
        for(let k in groups)
        {
            if(groups.hasOwnProperty(k))
            {
                this.publishInAuthUserGroupCh(groups[k],eventName,data,cb);
            }
        }
    }

    publishToCustomIdChannel(channel : string, id : any, eventName : string, data : any, cb ?: Function) : void
    {
        let channelFullName = ChTools.buildCustomIdChannelName(channel,id);
        this.publish(channelFullName,eventName,data,cb);
    }

    publishToCustomChannel(channel : string | string[], eventName : string, data : any, cb ?: Function) : void
    {
        if(Array.isArray(channel)) {
            for(let i = 0; i < channel.length; i++)
            {
                let channelFullName = ChTools.buildCustomChannelName(channel[i]);
                this.publish(channelFullName,eventName,data,cb);
            }
        }
        else
        {
            let channelFullName = ChTools.buildCustomChannelName(channel);
            this.publish(channelFullName,eventName,data,cb);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    destroyChannel(channel : string) : void
    {
        // noinspection JSValidateTypes
        this.scServer.exchange.channel(channel).destroy();
    }

}

export = ChExchangeEngine;
