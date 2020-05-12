/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Timer               = NodeJS.Timer;
import ZationWorker        = require("../../core/zationWorker");
import {PanelUserConfig}     from "../config/definitions/main/mainConfig";
import {AuthUserGroupConfig} from "../config/definitions/parts/userGroupsConfig";
import MiddlewareUtils       from "../utils/middlewareUtils";
import ZationConfigFull      from "../config/manager/zationConfigFull";
import {INTERNAL_PANEL_CH}   from '../internalChannels/internalChannelEngine';
import PanelChannel          from '../channel/systemChannels/channels/PanelChannel';

export default class PanelEngine
{

    private panelInUse: boolean = false;
    private panelInUseTimeout: Timer;

    private zw: ZationWorker;
    private readonly panelChannel: PanelChannel;
    private zc: ZationConfigFull;

    private readonly panelUserMap: Record<string,string>;

    private readonly panelAccessData: {p: string,u: string}[] = [];

    private alreadyFirstPong: boolean = false;

    private readonly idData;

    constructor(zw: ZationWorker,panelChannel: PanelChannel,authUserGroups: Record<string,AuthUserGroupConfig>) {
        this.zw = zw;
        this.panelChannel = panelChannel;
        this.zc = this.zw.getZationConfig();
        this.panelUserMap = this.initPanelUserMap(authUserGroups);
        if(this.zc.mainConfig.usePanel) {
            this.loadPanelAccessData();
            this.registerPanelInEvent();
            this.idData = {
                instanceId : this.zw.options.instanceId,
                workerFullId: this.zw.getFullWorkerId(),
                workerId   : this.zw.id
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private initPanelUserMap(authUserGroups: Record<string,AuthUserGroupConfig>): Record<string,string>
    {
        let map = {};
        for(const k in authUserGroups) {
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

    private addUser(config: PanelUserConfig): void {
        this.panelAccessData.push({
            p: this.zw.getPreparedBag().hashSha512(config.password),
            u: config.username
        });
    }

    private registerPanelInEvent()
    {
        this.zw.exchange.subscribe(INTERNAL_PANEL_CH).watch(async (firstPing) => {
            this.renewPanelInUse();
            if(firstPing){
                await this.sendFirstPong();
            }
            else {
                //if the worker is new
                if(!this.alreadyFirstPong) {
                    await this.sendFirstPong();
                }
            }
        });
    }

    private renewPanelInUse(): void
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

    private async sendFirstPong(): Promise<void> {
        try {
            this.pubInPanel('firstPong',(await this.zw.getFirstPanelInfo()));
        }
        catch (e) {console.log(e);}
    }

    updateLeaderInfo(data: object) {
        this.pubInPanel('up-l',data);
    }

    update(data: object) {
        this.pubInPanel('up',data);
    }

    private pubInPanel(event: string,data: object = {}) {
        if(this.isPanelInUse()) {
            this.panelChannel.publish(event,[
                this.idData,
                data
            ]);
        }
    }

    isPanelInUse(): boolean {
        return this.panelInUse;
    }

    async isPanelLoginDataValid(username: string,password: string): Promise<boolean>
    {
        const passwordHash =
            this.zw.getPreparedBag().hashSha512(password);

        let foundUser = false;
        for(let i = 0; i < this.panelAccessData.length; i++)
        {
            if(this.panelAccessData[i].u === username &&
               this.panelAccessData[i].p === passwordHash) {
                foundUser = true;
                break;
            }
        }
        if(!foundUser){
            const middlewareRes = (await MiddlewareUtils.checkMiddleware
            (this.zc.middleware.panelAuth,false,username,password));
            return typeof middlewareRes === 'boolean'? middlewareRes : false;
        }
        return foundUser;
    }

    getPanelUserMap(): Record<string,string> {
        return this.panelUserMap;
    }

}