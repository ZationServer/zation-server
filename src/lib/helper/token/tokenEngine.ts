/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker   = require("../../main/zationWorker");
import {PrepareZationToken, ZationToken} from "../constants/internal";
import BaseSHBridge     from "../bridges/baseSHBridge";
import ZationConfig     from "../../main/zationConfig";
import TokenTools       from "./tokenTools";
const uniqid          = require('uniqid');

export default class TokenEngine
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

    /**
     * Update zation token variable.
     * @param data
     */
    async updateTokenVariable(data : PrepareZationToken) : Promise<boolean> {
        this.updateWorkerMap(data);
        return await TokenTools.updateToken(data,this.shBridge,this.worker);
    }

    /**
     * Get a token variable.
      * @param key
     */
    // noinspection JSUnusedGlobalSymbols
    getTokenVariable(key : any) : any {
        return TokenTools.getTokenVariable(key,this.shBridge);
    }

    /**
     * Get a custom token variable.
     */
    getCustomTokenVariable() : object {
        const ctv = TokenTools.getTokenVariable
        (nameof<ZationToken>(s => s.zationCustomVariables),this.shBridge);
        return ctv !== undefined ? ctv : {};
    }

    /**
     * Set a custom token variable
     * @param data
     */
    async setCustomTokenVariable(data : object) : Promise<boolean> {
        return await TokenTools.updateCustomTokenVar(data,this.shBridge,this.worker);
    }
}