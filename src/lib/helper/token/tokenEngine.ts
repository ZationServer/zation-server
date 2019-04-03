/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TokenTools     = require('./tokenTools');
import ZationWorker   = require("../../main/zationWorker");
import ZationConfig   = require("../../main/zationConfig");
import {PrepareZationToken, ZationToken} from "../constants/internal";
import {BaseSHBridge} from "../bridges/baseSHBridge";
const uniqid          = require('uniqid');

class TokenEngine
{
    private readonly shBridge : BaseSHBridge;
    private readonly worker : ZationWorker;
    private readonly zc : ZationConfig;
    
    constructor(shBridge : BaseSHBridge,worker : ZationWorker,zc : ZationConfig)
    {
        this.shBridge = shBridge;
        this.worker = worker;
        this.zc = zc;
    }

    private generateExpiry() : number {
        const defaultExp : number = this.zc.mainConfig.authDefaultExpiry;
        return Math.floor(Date.now() / 1000) +  defaultExp;
    }

    //to create a new Token
    async createToken(data : object) : Promise<boolean> {
        data[nameof<ZationToken>(s => s.exp)] = this.generateExpiry();
        data[nameof<ZationToken>(s => s.zationTokenId)]  = uniqid();
        data[nameof<ZationToken>(s => s.zationCheckKey)] = this.zc.internalData.tokenCheckKey;
        if(typeof data[nameof<ZationToken>(s => s.zationCustomVariables)] !== 'object'){
            data[nameof<ZationToken>(s => s.zationCustomVariables)] = {};
        }
        return TokenTools.createNewToken(data,this.shBridge,this.worker);
    }

    private updateWorkerMap(data : PrepareZationToken) : void
    {
        //update worker mapper
        if(this.shBridge.isWebSocket()) {
            //update worker mapper
            const oldToken = this.shBridge.getToken();
            if(oldToken === null) {
                //take new id and tokenId
                if(!!data.zationUserId) {
                    this.worker.getUserToScMapper().map(data.zationUserId.toString(), this.shBridge.getSocket());
                }
                if(!!data.zationTokenId) {
                    this.worker.getTokenIdToScMapper().map(data.zationTokenId.toString(),this.shBridge.getSocket());
                }
            }
            else {
                //check changed (tokenId can't change)
                if(oldToken.zationUserId !== data.zationUserId) {
                    //userId Changed
                    if(!!data.zationTokenId && !!data.zationUserId) {
                        //take new user id
                        this.worker.getUserToScMapper().map(data.zationUserId.toString(), this.shBridge.getSocket());
                    }
                    if(!!oldToken.zationUserId) {
                        //remove old token user id
                        this.worker.getUserToScMapper().removeValueFromKey(oldToken.zationUserId.toString(), this.shBridge.getSocket());
                    }
                }

                //update authUserGroup Mapper
                if(oldToken.zationAuthUserGroup !== data.zationAuthUserGroup) {
                    //authUserGroup Changed
                    if(!!data.zationAuthUserGroup) {
                        //take new auth user group
                        this.worker.getAuthUserGroupToScMapper().map(data.zationAuthUserGroup, this.shBridge.getSocket());
                    }
                    if(!!oldToken.zationAuthUserGroup) {
                        //remove old token auth user group
                        this.worker.getAuthUserGroupToScMapper().removeValueFromKey(oldToken.zationAuthUserGroup,this.shBridge.getSocket());
                    }
                }

                //update panel user set
                if(!oldToken.zationOnlyPanelToken && data.zationOnlyPanelToken){
                    this.worker.getPanelUserSet().add(this.shBridge.getSocket());
                }
                else if(oldToken.zationOnlyPanelToken && !data.zationOnlyPanelToken) {
                    this.worker.getPanelUserSet().remove(this.shBridge.getSocket());
                }
            }
        }
    }

    async updateTokenVariable(data : PrepareZationToken) : Promise<boolean> {
        this.updateWorkerMap(data);
        return await TokenTools.updateToken(data,this.shBridge,this.worker);
    }

    //getATokenVariable
    // noinspection JSUnusedGlobalSymbols
    getTokenVariable(key : any) : any {
        return TokenTools.getTokenVariable(key,this.shBridge);
    }

    getCustomTokenVariable() : object {
        const ctv = TokenTools.getTokenVariable
        (nameof<ZationToken>(s => s.zationCustomVariables),this.shBridge);
        return ctv !== undefined ? ctv : {};
    }

    async setCustomTokenVariable(data : object) : Promise<boolean> {
        return await TokenTools.updateCustomTokenVar(data,this.shBridge,this.worker);
    }
}

export = TokenEngine;