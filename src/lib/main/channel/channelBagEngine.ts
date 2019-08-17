/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/*
Class Description :
This class is to publish into channels with the scServer.exchange object.
It is used by the Bag and the ChannelEngine.
 */

import ZationWorker = require("../../core/zationWorker");
import {WorkerChMapTaskActions, WorkerChSpecialTaskActions} from "../constants/workerChTaskActions";
import {WorkerChTargets}  from "../constants/workerChTargets";
import ScServer           from "../sc/scServer";
import {SyncTokenActions} from "../constants/syncTokenActions";
import {WorkerChTaskType} from "../constants/workerChTaskType";
import ZSocket            from "../internalApi/ZSocket";
import Logger             from "../logger/logger";
import ChUtils            from "./chUtils";
import {ChannelPrepare}   from "./channelPrepare";
import AEPreparedPart     from "../auth/aePreparedPart";
import Bag                from "../../api/Bag";
import {ZationChannel}    from "./channelDefinitions";
import UnknownCustomCh    from "../error/unknownCustomCh";

export default class ChannelBagEngine
{
    private readonly scServer: ScServer;
    private readonly chPrepare : ChannelPrepare;
    private readonly aePreparedPart : AEPreparedPart;

    private _bag : Bag;

    constructor(worker: ZationWorker,aePreparedPart : AEPreparedPart,chPrepare : ChannelPrepare) {
        this.scServer = worker.scServer;
        this.aePreparedPart = aePreparedPart;
        this.chPrepare = chPrepare;
    }

    set bag(value: Bag) {
        this._bag = value;
    }

    //PART Publish
    /**
     * Publish async in a channel.
     * @param channel
     * @param data
     */
    private pubAsync(channel: string, data: any): Promise<void> {
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
    /**
     * Publish to all worker.
     * @param data
     */
    private async publishToWorker(data: any): Promise<void> {
        try {
            await this.pubAsync(ZationChannel.ALL_WORKER, data);
        } catch (e) {
            Logger.printDebugWarning(`Failed to publish data: '${data.toString()}' in worker channel!`);
            throw e;
        }
    }

    /**
     * Publish map task to workers.
     * @param target
     * @param action
     * @param ids
     * @param exceptSocketSids
     * @param mainData
     */
    async publishMapTaskToWorker(target: WorkerChTargets,
                                 action: WorkerChMapTaskActions,
                                 ids: string | number | (string | number)[],
                                 exceptSocketSids: string[] | string,
                                 mainData: object = {}): Promise<void>
    {
        await this.publishToWorker({
            ids: Array.isArray(ids) ? ids : [ids],
            actionType : WorkerChTaskType.MAP_TASK,
            action: action,
            target: target,
            mainData: mainData,
            exceptSocketSids: Array.isArray(exceptSocketSids) ? exceptSocketSids : [exceptSocketSids]
        });
    }

    /**
     * Publish special task to worker.
     * @param action
     * @param mainData
     */
    async publishSpecialTaskToWorker(action : WorkerChSpecialTaskActions,mainData : any): Promise<void> {
        await this.publishToWorker({
            actionType : WorkerChTaskType.SPECIAL_TASK,
            action: action,
            mainData: mainData
        });
    }

    /**
     * Publish update user token worker task.
     * @param actions
     * @param userId
     * @param exceptSocketSids
     */
    async publishUpdateUserTokenWorkerTask(
            actions: { action: SyncTokenActions, params: any[] }[],
            userId,
            exceptSocketSids: string[] | string): Promise<void>
    {
        await this.publishSpecialTaskToWorker(
            WorkerChSpecialTaskActions.UPDATE_USER_TOKENS,
            {
                actions : actions,
                target : userId,
                exceptSocketSids : Array.isArray(exceptSocketSids) ? exceptSocketSids : [exceptSocketSids]
            }
        );
    }

    /**
     * Publish update group token worker task.
     * @param actions
     * @param authUserGroup
     * @param exceptSocketSids
     */
    async publishUpdateGroupTokenWorkerTask(
            actions: { action: SyncTokenActions, params: any[] }[],
            authUserGroup,
            exceptSocketSids: string[] | string): Promise<void>
    {
        await this.publishSpecialTaskToWorker(
            WorkerChSpecialTaskActions.UPDATE_GROUP_TOKENS,
            {
                actions : actions,
                target : authUserGroup,
                exceptSocketSids : Array.isArray(exceptSocketSids) ? exceptSocketSids : [exceptSocketSids]
            }
        );
    }

    //Part Zation Channels functions for the Bag
    /**
     * Publish in user channel.
     * @param id
     * @param eventName
     * @param data
     * @param srcSocketSid
     * @param socketInfo
     */
    async publishInUserCh(id : number | string | (string | number)[],eventName : string,data : any,srcSocketSid ?: string,socketInfo ?: ZSocket) : Promise<void>
    {
        const onBagPub = this.chPrepare.getUserChInfo().onBagPub;
        const pubData = ChUtils.buildData(eventName, data, srcSocketSid);

        const eventTrigger = (selectedId : number | string) => {
            onBagPub(this._bag,pubData,socketInfo,selectedId.toString());
        };

        if(Array.isArray(id)) {
            const promises : Promise<void>[] = [];
            for(let i = 0; i < id.length; i++) {
                promises.push(this.pubAsync(ChUtils.buildUserChName(id[i]),pubData));
                eventTrigger(id[i]);
            }
            await Promise.all(promises);
        }
        else {
            await this.pubAsync(ChUtils.buildUserChName(id),pubData);
            eventTrigger(id);
        }
    }

    /**
     * Publish in default user group channel.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * @param socketInfo
     */
    async publishInDefaultUserGroupCh(eventName : string, data : any,srcSocketSid ?: string,socketInfo ?: ZSocket) : Promise<void>
    {
        const onBagPub = this.chPrepare.getDefaultUserGroupChInfo().onBagPub;
        const pubData = ChUtils.buildData(eventName, data, srcSocketSid);

        await this.pubAsync(ZationChannel.DEFAULT_USER_GROUP,pubData);
        onBagPub(this._bag,pubData,socketInfo);
    }

    /**
     * Publish in all channel.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * @param socketInfo
     */
    async publishInAllCh(eventName : string,data : any,srcSocketSid ?: string,socketInfo ?: ZSocket) : Promise<void>
    {
        const onBagPub = this.chPrepare.getAllChInfo().onBagPub;
        const pubData = ChUtils.buildData(eventName, data, srcSocketSid);

        await this.pubAsync(ZationChannel.ALL,pubData);
        onBagPub(this._bag,pubData,socketInfo);
    }

    /**
     * Publish in auth user group channel.
     * @param authUserGroup
     * @param eventName
     * @param data
     * @param srcSocketSid
     * @param socketInfo
     */
    async publishInAuthUserGroupCh(authUserGroup : string | string[], eventName : string, data : any,srcSocketSid ?: string,socketInfo ?: ZSocket) : Promise<void>
    {
        const onBagPub = this.chPrepare.getAuthUserGroupChInfo().onBagPub;
        const pubData = ChUtils.buildData(eventName, data, srcSocketSid);

        const eventTrigger = (selectedAuthUserGroup : string) => {
            onBagPub(this._bag,pubData,socketInfo,selectedAuthUserGroup);
        };

        if(Array.isArray(authUserGroup)) {
            const promises : Promise<void>[] = [];
            for(let i = 0; i < authUserGroup.length; i++) {
                promises.push(this.pubAsync(ChUtils.buildAuthUserGroupChName(authUserGroup[i]),pubData));
                eventTrigger(authUserGroup[i]);
            }
            await Promise.all(promises);
        }
        else {
            await this.pubAsync(ChUtils.buildAuthUserGroupChName(authUserGroup),pubData);
            eventTrigger(authUserGroup);
        }
    }

    /**
     * Publish in all auth user group channels.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * @param socketInfo
     */
    async publishInAllAuthUserGroupCh(eventName : string,
                                      data : any,
                                      srcSocketSid ?: string,
                                      socketInfo ?: ZSocket) : Promise<void>
    {
        await this.publishInAuthUserGroupCh
        (Object.keys(this.aePreparedPart.getAuthGroups()),eventName,data,srcSocketSid,socketInfo);
    }

    /**
     * Publish in custom id channel.
     * @param target
     * @param eventName
     * @param data
     * @param srcSocketSid
     * @param socketInfo
     * @throws UnknownCustomCh
     */
    async publishInCustomCh({name,id} : {name : string,id ?: string}, eventName : string, data : any, srcSocketSid ?: string, socketInfo ?: ZSocket) : Promise<void>
    {
        if(this.chPrepare.existCustomCh(name)){
            const onBagPub = this.chPrepare.getCustomChPreInfo(name).onBagPub;
            const pubData = ChUtils.buildData(eventName, data, srcSocketSid);

            await this.pubAsync(ChUtils.buildCustomChannelName(name,id),pubData);
            onBagPub(this._bag,pubData,socketInfo,{name,id});
        }
        else {
            throw new UnknownCustomCh(name);
        }
    }
}
