/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker   = require("../../main/zationWorker");
import {PrepareZationToken, ZationToken} from "../constants/internal";
import BaseSHBridge     from "../bridges/baseSHBridge";
import ZationConfig     from "../configManager/zationConfig";
import TokenUtils       from "./tokenUtils";
const uniqid          = require('uniqid');

export default class TokenEngine
{
    private readonly worker : ZationWorker;
    private readonly zc : ZationConfig;

    constructor(worker : ZationWorker,zc : ZationConfig) {
        this.worker = worker;
        this.zc = zc;
    }

    private updateWorkerMap(data : PrepareZationToken,shBridge : BaseSHBridge) : void
    {
        //update worker mapper
        if(shBridge.isWebSocket()) {
            //update worker mapper
            const oldToken = shBridge.getToken();
            if(oldToken === null) {
                //take new id and tokenId
                if(data.zationUserId !== undefined) {
                    this.worker.getUserToScMapper().map(data.zationUserId.toString(), shBridge.getSocket());
                }
                if(data.zationTokenId !== undefined) {
                    this.worker.getTokenIdToScMapper().map(data.zationTokenId.toString(),shBridge.getSocket());
                }
            }
            else {
                //check changed (tokenId can't change)
                if(oldToken.zationUserId !== data.zationUserId) {
                    //userId Changed
                    if(!!data.zationTokenId && !!data.zationUserId) {
                        //take new user id
                        this.worker.getUserToScMapper().map(data.zationUserId.toString(), shBridge.getSocket());
                    }
                    if(!!oldToken.zationUserId) {
                        //remove old token user id
                        this.worker.getUserToScMapper().removeValueFromKey(oldToken.zationUserId.toString(), shBridge.getSocket());
                    }
                }

                //update authUserGroup Mapper
                if(oldToken.zationAuthUserGroup !== data.zationAuthUserGroup) {
                    //authUserGroup Changed
                    if(!!data.zationAuthUserGroup) {
                        //take new auth user group
                        this.worker.getAuthUserGroupToScMapper().map(data.zationAuthUserGroup, shBridge.getSocket());
                    }
                    if(!!oldToken.zationAuthUserGroup) {
                        //remove old token auth user group
                        this.worker.getAuthUserGroupToScMapper().removeValueFromKey(oldToken.zationAuthUserGroup,shBridge.getSocket());
                    }
                }

                //update panel user set
                if(!oldToken.zationOnlyPanelToken && data.zationOnlyPanelToken){
                    this.worker.getPanelUserSet().add(shBridge.getSocket());
                }
                else if(oldToken.zationOnlyPanelToken && !data.zationOnlyPanelToken) {
                    this.worker.getPanelUserSet().remove(shBridge.getSocket());
                }
            }
        }
    }

}