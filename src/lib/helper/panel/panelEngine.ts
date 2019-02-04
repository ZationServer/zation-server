/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Timer            = NodeJS.Timer;
import ZationWorker     = require("../../main/zationWorker");
import ChExchangeEngine = require("../channel/chExchangeEngine");
import {PanelUserConfig}  from "../configs/mainConfig";
import {ZationChannel}    from "../constants/internal";
import ZationConfig     = require("../../main/zationConfig");

class PanelEngine
{

    private panelInUse : boolean = false;
    private panelInUseTimeout : Timer;

    private zw : ZationWorker;
    private zc : ZationConfig;

    private readonly panelAccessData : object[] = [];

    private alreadyFirstPong : boolean = false;

    constructor(zw : ZationWorker)
    {
        this.zw = zw;
        this.zc = this.zw.getZationConfig();
        if(this.zc.mainConfig.usePanel) {
            this.loadPanelAccessData();
            this.createPingInterval();
            this.registerPanelInEvent();
        }
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

    private addUser(config : PanelUserConfig) : void
    {
        const data = {};
        data['p'] = this.zw.getPreparedSmallBag().hashSha512(config.password);
        data['u'] = config.userName;
        this.panelAccessData.push(data);
    }

    private createPingInterval()
    {
        setInterval(() => {
            this.pubInPanel('ping')
        },5000);
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
        catch (e) {}
    }

    update(type : string,data : object) {
        this.pubInPanel('update-'+type,data);
    }

    // noinspection JSUnusedGlobalSymbols
    private pubInPanel(eventName : string,data : object = {})
    {
        if(this.isPanelInUse()) {
            // noinspection TypeScriptValidateJSTypes
            this.zw.scServer.exchange.publish(ZationChannel.PANEL_OUT,ChExchangeEngine.buildData(eventName,data));
        }
    }

    isPanelInUse() : boolean {
        return this.panelInUse;
    }

    isPanelLoginDataValid(userName : string,password : string) : boolean
    {
        const passwordHash =
            this.zw.getPreparedSmallBag().hashSha512(password);

        let foundUser = false;
        for(let i = 0; i < this.panelAccessData.length; i++)
        {
            if(this.panelAccessData[i]['u'] === userName &&
               this.panelAccessData[i]['p'] === passwordHash) {
                foundUser = true;
                break;
            }
        }
        return foundUser;
    }

}

export = PanelEngine;