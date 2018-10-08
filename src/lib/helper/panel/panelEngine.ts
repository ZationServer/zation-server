/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Timer            = NodeJS.Timer;
import ZationWorker     = require("../../main/zationWorker");
import Const            = require("../constants/constWrapper");
import ChExchangeEngine = require("../channel/chExchangeEngine");
import {PanelUserConfig} from "../configEditTool/mainConfigStructure";

class PanelEngine
{

    private panelInUse : boolean = false;
    private panelInUseTimeout : Timer;

    private zw : ZationWorker;

    private readonly panelAccessData : object[];

    private alreadyFirstPong : boolean = false;

    constructor(zw : ZationWorker)
    {
        this.zw = zw;
        if(zw.getZationConfig().getMain(Const.Main.KEYS.USE_PANEL)) {
            this.loadPanelAccessData();
            this.registerPanelInEvent();
        }
    }

    private loadPanelAccessData()
    {
        const user = this.zw.getZationConfig().getMain(Const.Main.KEYS.PANEL_USER);
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
        data['p'] = this.zw.getPreparedSmallBag().hashSha512(config[Const.Main.PANEL_USER.PASSWORD]);
        data['u'] = config[Const.Main.PANEL_USER.USER_NAME];
        this.panelAccessData.push(data);
    }

    private registerPanelInEvent()
    {
        const channel = this.zw.exchange.subscribe(Const.Settings.CHANNEL.PANEL_IN);
        channel.watch(async (data) =>
        {
            if(data.action === 'ping') {
                this.renewPanelInUse();
                if(!this.alreadyFirstPong) {
                    this.sendFirstPong();
                }
            }
            else if(data.action === 'firstPing') {
                this.renewPanelInUse();
                this.sendFirstPong();
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

    private sendFirstPong() : void
    {
        this.alreadyFirstPong = true;

    }

    pubInPanel(eventName : string,data : object)
    {
        if(this.isPanelInUse()) {
            // noinspection TypeScriptValidateJSTypes
            this.zw.scServer.exchange.publish(Const.Settings.CHANNEL.PANEL_OUT,ChExchangeEngine.buildData(eventName,data));
        }
    }

    isPanelInUse() : boolean {
        return this.panelInUse;
    }

    isPanelLoginDataValid(userName : string,hashPassword : string) : boolean
    {
        let foundUser = false;
        for(let i = 0; i < this.panelAccessData.length; i++)
        {
            if(this.panelAccessData[i]['u'] === userName &&
               this.panelAccessData[i]['p'] === hashPassword)
            {
                foundUser = true;
                break;
            }
        }
        return foundUser;
    }

}

export = PanelEngine;