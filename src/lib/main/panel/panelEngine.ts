/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Timer               = NodeJS.Timer;
import ZationWorker        = require("../../core/zationWorker");
import {PanelUserConfig}     from "../config/definitions/mainConfig";
import {AuthUserGroupConfig} from "../config/definitions/appConfig";
import ZationConfig          from "../config/manager/zationConfig";
import ChUtils               from "../channel/chUtils";
import {ZationChannel}       from "../channel/channelDefinitions";

export default class PanelEngine
{

    private panelInUse : boolean = false;
    private panelInUseTimeout : Timer;

    private zw : ZationWorker;
    private zc : ZationConfig;

    private readonly panelUserMap : Record<string,string>;

    private readonly panelAccessData : {p : string,u : string}[] = [];

    private alreadyFirstPong : boolean = false;

    private readonly idData;

    constructor(zw : ZationWorker,authUserGroups : Record<string,AuthUserGroupConfig>)
    {
        this.zw = zw;
        this.zc = this.zw.getZationConfig();
        this.panelUserMap = this.initPanelUserMap(authUserGroups);
        if(this.zc.mainConfig.usePanel) {
            this.loadPanelAccessData();
            this.registerPanelInEvent();
            this.idData = {
                instanceId  : this.zw.options.instanceId,
                workerFullId: this.zw.getFullWorkerId(),
                workerId    : this.zw.id
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private initPanelUserMap(authUserGroups : Record<string,AuthUserGroupConfig>) : Record<string,string>
    {
        let map = {};
        for(let k in authUserGroups) {
            if(authUserGroups.hasOwnProperty(k) &&
                authUserGroups[k].panelDisplayName !== undefined) {
                map[k] = authUserGroups[k].panelDisplayName;
            }
        }
        return map;
    }

    private loadPanelAccessData()
    {
        const user = this.zc.mainConfig.panelUser;
        if(Array.isArray(user)) {
            for(let i = 0; i < user.length; i++) {
                this.addUser(user[i]);
            }
        }
        else if(typeof user === 'object') {
            this.addUser(user);
        }
    }

    private addUser(config : PanelUserConfig) : void {
        this.panelAccessData.push({
            p : this.zw.getPreparedBag().hashSha512(config.password),
            u : config.username
        });
    }

    private registerPanelInEvent()
    {
        const channel = this.zw.exchange.subscribe(ZationChannel.PANEL_IN);
        channel.watch(async (data) =>
        {
            if(data.e === 'ping') {
                this.renewPanelInUse();
                //if the worker is new
                if(!this.alreadyFirstPong) {
                    await this.sendFirstPong();
                }
            }
            else if(data.e === 'firstPing') {
                this.renewPanelInUse();
                await this.sendFirstPong();
            }
        });
    }

    private renewPanelInUse() : void
    {
        //clear old timeout
        if(!!this.panelInUseTimeout) {
            clearTimeout(this.panelInUseTimeout);
        }
        this.panelInUse = true;

        //set new timeout
        this.panelInUseTimeout = setTimeout(() => {
            this.panelInUse = false;
        },5000);
    }

    private async sendFirstPong() : Promise<void> {
        try {
            this.pubInPanel('firstPong',(await this.zw.getFirstPanelInfo()));
        }
        catch (e) {console.log(e);}
    }

    updateLeaderInfo(data : object) {
        this.pubInPanel('up-l',data);
    }

    update(data : object) {
        this.pubInPanel('up',data);
    }

    // noinspection JSUnusedGlobalSymbols
    private pubInPanel(eventName : string,data : object = {})
    {
        if(this.isPanelInUse()) {
            // noinspection TypeScriptValidateJSTypes
            this.zw.scServer.exchange.publish(ZationChannel.PANEL_OUT,ChUtils.buildData(eventName,
                {
                id : this.idData,
                info : data
            }));
        }
    }

    isPanelInUse() : boolean {
        return this.panelInUse;
    }

    isPanelLoginDataValid(userName : string,password : string) : boolean
    {
        const passwordHash =
            this.zw.getPreparedBag().hashSha512(password);

        let foundUser = false;
        for(let i = 0; i < this.panelAccessData.length; i++)
        {
            if(this.panelAccessData[i].u === userName &&
               this.panelAccessData[i].p === passwordHash) {
                foundUser = true;
                break;
            }
        }
        return foundUser;
    }

    getPanelUserMap() : Record<string,string> {
        return this.panelUserMap;
    }

}