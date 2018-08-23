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

    //PART Publish

    publish(channel : string,eventName : string,data : any,cb ?: Function,srcSocketId ?: string) : void
    {
        // noinspection TypeScriptValidateJSTypes
        this.scServer.exchange.publish(channel,ChExchangeEngine.buildData(eventName,data,srcSocketId),cb);
    }

    private pubAsync(channel : string,eventName : string,data : any,srcSocketId ?: string) : Promise<void>
    {
        return new Promise<void>((resolve, reject) => {
            this.publish(channel,eventName,data,(err) => {
                if(!!err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            },srcSocketId);
        });
    }

    private pubAsyncInternal(channel : string,data : any) : Promise<void>
    {
        return new Promise<void>((resolve, reject) => {
            this.scServer.exchange.publish(channel,data,(err) => {
                if(!!err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    //Part Worker sync channel

    async publishToWorker(data : any) : Promise<void>
    {
        try {
            await this.pubAsyncInternal(Const.Settings.CHANNEL.ALL_WORKER,data);
        }
        catch (e) {
            Logger.printDebugWarning(`Failed to publish data: '${data.toString()}' in worker channel!`);
            throw e;
        }
    }

    async publishTaskToWorker(action : WorkerChActions, id : string | number | (string | number)[], mainData : object = {}) : Promise<void>
    {
        let ids : (string | number)[] = [];
        if(!Array.isArray(id)) {
            ids = [id];
        }
        else {
            ids = id;
        }
        await this.publishToWorker({ids,action,mainData});
    }

    //Part Zation Channels

    async publishInUserCh(id : number | string | (string | number)[],eventName : string,data : any,srcSocketId ?: string) : Promise<void>
    {
        if(Array.isArray(id)) {
            let promises : Promise<void>[] = [];
            for(let i = 0; i < id.length; i++) {
                promises.push(this.pubAsync(ChTools.buildUserChName(id[i]),eventName,data,srcSocketId));
            }
            await Promise.all(promises);
        }
        else {
            await this.pubAsync(ChTools.buildUserChName(id),eventName,data,srcSocketId);
        }
    }


    async publishInDefaultUserGroupCh(eventName : string, data : any,srcSocketId ?: string) : Promise<void>
    {
        await this.pubAsync(Const.Settings.CHANNEL.DEFAULT_USER_GROUP,eventName,data,srcSocketId);
    }

    async publishInAllCh(eventName : string,data : any,srcSocketId ?: string) : Promise<void>
    {
        await this.pubAsync(Const.Settings.CHANNEL.ALL,eventName,data,srcSocketId);
    }

    async publishInAuthUserGroupCh(authUserGroup : string | string[], eventName : string, data : any,srcSocketId ?: string) : Promise<void>
    {
        if(Array.isArray(authUserGroup)) {
            let promises : Promise<void>[] = [];
            for(let i = 0; i < authUserGroup.length; i++) {
               promises.push(this.pubAsync(ChTools.buildAuthUserGroupChName(authUserGroup[i]),eventName,data,srcSocketId));
            }
            await Promise.all(promises);
        }
        else {
            await this.pubAsync(ChTools.buildAuthUserGroupChName(authUserGroup),eventName,data,srcSocketId);
        }
    }

    static buildData(eventName : string,data : any,srcSocketId ?: string) : object
    {
        return {
            e : eventName,
            d : data,
            ssi : srcSocketId
        };
    }

    async publishToAllAuthUserGroupCh(eventName : string, data : any,zc : ZationConfig,srcSocketId ?: string) : Promise<void>
    {
        let groups = zc.getApp(Const.App.KEYS.USER_GROUPS)[Const.App.USER_GROUPS.AUTH];
        await this.publishInAuthUserGroupCh(Object.keys(groups),eventName,data,srcSocketId);
    }

    async publishToCustomIdChannel(channel : string, id : any, eventName : string, data : any,srcSocketId ?: string) : Promise<void>
    {
        let channelFullName = ChTools.buildCustomIdChannelName(channel,id);
        await this.pubAsync(channelFullName,eventName,data,srcSocketId);
    }

    async publishToCustomChannel(channel : string | string[], eventName : string, data : any,srcSocketId ?: string) : Promise<void>
    {
        if(Array.isArray(channel)) {
            let promises : Promise<void>[] = [];
            for(let i = 0; i < channel.length; i++)
            {
                let channelFullName = ChTools.buildCustomChannelName(channel[i]);
                promises.push(this.pubAsync(channelFullName,eventName,data,srcSocketId));
            }
            await Promise.all(promises);
        }
        else
        {
            let channelFullName = ChTools.buildCustomChannelName(channel);
            await this.pubAsync(channelFullName,eventName,data,srcSocketId);
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
