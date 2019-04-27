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

import ZationWorker = require("../../main/zationWorker");
import {WorkerChMapTaskActions, WorkerChSpecialTaskActions} from "../constants/workerChTaskActions";
import {WorkerChTargets}  from "../constants/workerChTargets";
import ScServer           from "../sc/scServer";
import {ZationChannel}    from "../constants/internal";
import {SyncTokenActions} from "../constants/syncTokenActions";
import {WorkerChTaskType} from "../constants/workerChTaskType";
import SocketInfo         from "../infoObjects/socketInfo";
import Logger             from "../logger/logger";
import ChUtils            from "./chUtils";
import PubDataInfo        from "../infoObjects/pubDataInfo";
import FuncUtils          from "../utils/funcUtils";
import ZationConfig       from "../configManager/zationConfig";
import CChInfo            from "../infoObjects/cChInfo";
import CIdChInfo          from "../infoObjects/cIdChInfo";

export default class ChExchangeEngine {
    private readonly scServer: ScServer;
    private readonly worker: ZationWorker;

    constructor(worker: ZationWorker) {
        this.worker = worker;
        this.scServer = worker.scServer;
    }

    //PART Publish

    publish(channel: string, eventName: string, data: any, cb ?: Function, srcSocketSid ?: string): void {
        // noinspection TypeScriptValidateJSTypes
        this.scServer.exchange.publish(channel, ChExchangeEngine.buildData(eventName, data, srcSocketSid), cb);
    }

    private pubAsync(channel: string, eventName: string, data: any, srcSocketSid ?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.publish(channel, eventName, data, (err) => {
                if (!!err) {
                    reject(err);
                } else {
                    resolve();
                }
            }, srcSocketSid);
        });
    }

    private pubAsyncInternal(channel: string, data: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.scServer.exchange.publish(channel, data, (err) => {
                if (!!err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    //Part Worker sync channel

    async publishToWorker(data: any): Promise<void> {
        try {
            await this.pubAsyncInternal(ZationChannel.ALL_WORKER, data);
        } catch (e) {
            Logger.printDebugWarning(`Failed to publish data: '${data.toString()}' in worker channel!`);
            throw e;
        }
    }

    async publishMapTaskToWorker(target: WorkerChTargets, action: WorkerChMapTaskActions, ids: string | number | (string | number)[], exceptSocketSids: string[] | string, mainData: object = {}): Promise<void> {
        const tmpIds: (string | number | null)[] = Array.isArray(ids) ? ids : [ids];
        const tmpExceptSocketSids: string[] = Array.isArray(exceptSocketSids) ? exceptSocketSids : [exceptSocketSids];
        await this.publishToWorker({
            ids: tmpIds,
            actionType : WorkerChTaskType.MAP_TASK,
            action: action,
            target: target,
            mainData: mainData,
            exceptSocketSids: tmpExceptSocketSids
        });
    }

    async publishSpecialTaskToWorker(action : WorkerChSpecialTaskActions,mainData : any): Promise<void> {
        await this.publishToWorker({
            actionType : WorkerChTaskType.SPECIAL_TASK,
            action: action,
            mainData: mainData
        });
    }

    async publishUpdateUserTokenWorkerTask(actions: { action: SyncTokenActions, params: any[] }[], userId, exceptSocketSids: string[] | string): Promise<void> {
        const tmpExceptSocketSids: string[] = Array.isArray(exceptSocketSids) ? exceptSocketSids : [exceptSocketSids];
        await this.publishSpecialTaskToWorker(
            WorkerChSpecialTaskActions.UPDATE_USER_TOKENS,
            {
                actions : actions,
                target : userId,
                exceptSocketSids : tmpExceptSocketSids
            }
        );
    }

    async publishUpdateGroupTokenWorkerTask(actions: { action: SyncTokenActions, params: any[] }[], authUserGroup, exceptSocketSids: string[] | string): Promise<void> {
        const tmpExceptSocketSids: string[] = Array.isArray(exceptSocketSids) ? exceptSocketSids : [exceptSocketSids];
        await this.publishSpecialTaskToWorker(
            WorkerChSpecialTaskActions.UPDATE_GROUP_TOKENS,
            {
                actions : actions,
                target : authUserGroup,
                exceptSocketSids : tmpExceptSocketSids
            }
        );
    }

    //Part Zation Channels

    async publishInUserCh(id : number | string | (string | number)[],eventName : string,data : any,srcSocketSid ?: string,socketInfo ?: SocketInfo) : Promise<void>
    {
        const eventTrigger = (id : number | string) => {
            //trigger pub bag userCh event
            const func = this.worker.getChConfigManager().getOnBagPubUserCh();
            if(!!func) {
                (async () => {
                    await FuncUtils.emitEvent
                    (func, this.worker.getPreparedSmallBag(), id, new PubDataInfo(eventName,data,srcSocketSid),socketInfo);
                })();
            }
        };

        if(Array.isArray(id)) {
            let promises : Promise<void>[] = [];
            for(let i = 0; i < id.length; i++) {
                eventTrigger(id[i]);
                promises.push(this.pubAsync(ChUtils.buildUserChName(id[i]),eventName,data,srcSocketSid));
            }
            await Promise.all(promises);
        }
        else {
            eventTrigger(id);
            await this.pubAsync(ChUtils.buildUserChName(id),eventName,data,srcSocketSid);
        }
    }


    async publishInDefaultUserGroupCh(eventName : string, data : any,srcSocketSid ?: string,socketInfo ?: SocketInfo) : Promise<void>
    {
        const func = this.worker.getChConfigManager().getOnBagPubDefaultUserUserCh();
        if(!!func) {
            (async () => {
                await FuncUtils.emitEvent
                (func, this.worker.getPreparedSmallBag(), new PubDataInfo(eventName,data,srcSocketSid),socketInfo);
            })();
        }
        await this.pubAsync(ZationChannel.DEFAULT_USER_GROUP,eventName,data,srcSocketSid);
    }

    async publishInAllCh(eventName : string,data : any,srcSocketSid ?: string,socketInfo ?: SocketInfo) : Promise<void>
    {
        const func = this.worker.getChConfigManager().getOnBagPubAllCh();
        if(!!func) {
            (async () => {
                await FuncUtils.emitEvent
                (func, this.worker.getPreparedSmallBag(), new PubDataInfo(eventName,data,srcSocketSid),socketInfo);
            })();
        }
        await this.pubAsync(ZationChannel.ALL,eventName,data,srcSocketSid);
    }

    async publishInAuthUserGroupCh(authUserGroup : string | string[], eventName : string, data : any,srcSocketSid ?: string,socketInfo ?: SocketInfo) : Promise<void>
    {
        const eventTrigger = (group : string) => {
            //trigger pub bag auth user group Ch event
            const func = this.worker.getChConfigManager().getOnBagPubAuthUserUserCh();
            if(!!func) {
                (async () => {
                    await FuncUtils.emitEvent
                    (func, this.worker.getPreparedSmallBag(), group, new PubDataInfo(eventName,data,srcSocketSid),socketInfo);
                })();
            }
        };

        if(Array.isArray(authUserGroup)) {
            let promises : Promise<void>[] = [];
            for(let i = 0; i < authUserGroup.length; i++) {
                eventTrigger(authUserGroup[i]);
                promises.push(this.pubAsync(ChUtils.buildAuthUserGroupChName(authUserGroup[i]),eventName,data,srcSocketSid));
            }
            await Promise.all(promises);
        }
        else {
            eventTrigger(authUserGroup);
            await this.pubAsync(ChUtils.buildAuthUserGroupChName(authUserGroup),eventName,data,srcSocketSid);
        }
    }

    static buildData(eventName : string,data : any,srcSocketSid ?: string) : object
    {
        return {
            e : eventName,
            d : data,
            sSid : srcSocketSid
        };
    }

    async publishInAllAuthUserGroupCh(eventName : string, data : any, zc : ZationConfig
                                      , srcSocketSid ?: string, socketInfo ?: SocketInfo) : Promise<void>
    {
        // @ts-ignore
        const groups : object = zc.appConfig.userGroups.auth;
        await this.publishInAuthUserGroupCh(Object.keys(groups),eventName,data,srcSocketSid,socketInfo);
    }

    async publishInCustomIdChannel(channel : string, id : any, eventName : string, data : any, srcSocketSid ?: string, socketInfo ?: SocketInfo) : Promise<void>
    {
        const channelFullName = ChUtils.buildCustomIdChannelName(channel,id);
        //trigger pub bag customCh event
        const func = this.worker.getChConfigManager().getOnBagPubCustomIdCh(channel);
        if(!!func) {
            (async () => {
                await FuncUtils.emitEvent
                (func, this.worker.getPreparedSmallBag(), new CIdChInfo(channel, id), new PubDataInfo(eventName,data,srcSocketSid),socketInfo);
            })();
        }
        await this.pubAsync(channelFullName,eventName,data,srcSocketSid);
    }

    async publishInCustomChannel(channel : string | string[], eventName : string, data : any, srcSocketSid ?: string, socketInfo ?: SocketInfo) : Promise<void>
    {
        const eventTrigger = (chName : string) =>
        {
            //trigger pub bag customCh event
            const func = this.worker.getChConfigManager().getOnBagPubCustomCh(chName);
            if(!!func) {
                (async () => {
                    await FuncUtils.emitEvent
                    (func, this.worker.getPreparedSmallBag(), new CChInfo(chName), new PubDataInfo(eventName,data,srcSocketSid),socketInfo);
                })();
            }
        };

        if(Array.isArray(channel)) {
            let promises : Promise<void>[] = [];
            for(let i = 0; i < channel.length; i++)
            {
                let channelFullName = ChUtils.buildCustomChannelName(channel[i]);
                eventTrigger(channel[i]);
                promises.push(this.pubAsync(channelFullName,eventName,data,srcSocketSid));
            }
            await Promise.all(promises);
        }
        else
        {
            let channelFullName = ChUtils.buildCustomChannelName(channel);
            eventTrigger(channel);
            await this.pubAsync(channelFullName,eventName,data,srcSocketSid);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    destroyChannel(channel : string) : void
    {
        // noinspection JSValidateTypes
        this.scServer.exchange.channel(channel).destroy();
    }

}
