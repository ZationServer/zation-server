/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TokenTools     = require('./tokenTools');
import Const          = require('../constants/constWrapper');
import SHBridge       = require("../bridges/shBridge");
import ZationWorker   = require("../../main/zationWorker");
import ZationConfig   = require("../../main/zationConfig");
const uniqid          = require('uniqid');

class TokenEngine
{
    private readonly shBridge : SHBridge;
    private readonly worker : ZationWorker;
    private readonly zc : ZationConfig;
    
    constructor(shBridge,worker,zc)
    {
        this.shBridge = shBridge;
        this.worker = worker;
        this.zc = zc;
    }

    private generateExpiry() : number {
        const defaultExp = this.zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY);
        return Math.floor(Date.now() / 1000) +  defaultExp;
    }

    //to create a new Token
    async createToken(data : object) : Promise<boolean> {
        data[Const.Settings.TOKEN.EXPIRE] = this.generateExpiry();
        data[Const.Settings.TOKEN.TOKEN_ID]  = uniqid();
        return TokenTools.createNewToken(data,this.shBridge.getTokenBridge(),this.worker);
    }

    private updateWorkerMap(data : object) : void
    {
        //update worker mapper
        if(this.shBridge.isWebSocket()) {
            //update worker mapper
            if(!this.shBridge.getTokenBridge().hasToken()) {
                //take new id and tokenId
                if(!!data[Const.Settings.TOKEN.USER_ID]) {
                    this.worker.getUserToScIdMapper().map(data[Const.Settings.TOKEN.USER_ID].toString(), this.shBridge.getSocket());
                }
                if(!!data[Const.Settings.TOKEN.TOKEN_ID]) {
                    this.worker.getTokenIdToScIdMapper().map(data[Const.Settings.TOKEN.TOKEN_ID].toString(),this.shBridge.getSocket());
                }
            }
            else {
                const oldToken = this.shBridge.getTokenBridge().getToken();
                //check changed (tokenId can't change)
                if(oldToken[Const.Settings.TOKEN.USER_ID] !== data[Const.Settings.TOKEN.USER_ID]) {
                    //userId Changed
                    if(!!data[Const.Settings.TOKEN.TOKEN_ID]) {
                        //take new user id
                        this.worker.getUserToScIdMapper().map(data[Const.Settings.TOKEN.USER_ID].toString(), this.shBridge.getSocket());
                    }
                    if(!!oldToken[Const.Settings.TOKEN.USER_ID]) {
                        //remove old token user id
                        this.worker.getUserToScIdMapper().removeValueFromKey(oldToken[Const.Settings.TOKEN.USER_ID].toString(), this.shBridge.getSocket());
                    }
                }

                //update authUserGroup Mapper
                if(oldToken[Const.Settings.TOKEN.AUTH_USER_GROUP] !== data[Const.Settings.TOKEN.AUTH_USER_GROUP]) {
                    //authUserGroup Changed
                    if(!!data[Const.Settings.TOKEN.AUTH_USER_GROUP]) {
                        //take new user id
                        this.worker.getAuthUserGroupToScMapper().map(data[Const.Settings.TOKEN.AUTH_USER_GROUP], this.shBridge.getSocket());
                    }
                    if(!!oldToken[Const.Settings.TOKEN.AUTH_USER_GROUP]) {
                        //remove old token user id
                        this.worker.getAuthUserGroupToScMapper().removeValueFromKey(oldToken[Const.Settings.TOKEN.USER_ID],this.shBridge.getSocket());
                    }
                }

            }
        }
    }

    async updateTokenVariable(data : object) : Promise<boolean> {
        this.updateWorkerMap(data);
        return await TokenTools.updateToken(data,this.shBridge.getTokenBridge(),this.worker);
    }

    //getATokenVariable
    getTokenVariable(key : any) : any {
        return TokenTools.getTokenVariable(key,this.shBridge.getTokenBridge());
    }

    getCustomTokenVar() : object {
        return TokenTools.getTokenVariable(Const.Settings.TOKEN.CUSTOM_VARIABLES,this.shBridge.getTokenBridge());
    }

    async setCustomTokenVar(data : object) : Promise<boolean> {
        return await TokenTools.updateCustomTokenVar(data,this.shBridge.getTokenBridge(),this.worker);
    }
}

export = TokenEngine;