/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker        = require("../../main/zationWorker");
import {PrepareZationToken, ZationToken} from "../constants/internal";
import BaseSHBridge         from "../bridges/baseSHBridge";
import AEPreparedPart       from "./aePreparedPart";
import ChAccessEngine       from "../channel/chAccessEngine";
import TokenEngine          from "../token/tokenEngine";
import AuthenticationError  from "../error/authenticationError";

export default class AuthEngine
{
    protected readonly aePreparedPart : AEPreparedPart;
    protected readonly shBridge : BaseSHBridge;
    protected readonly tokenEngine : TokenEngine;
    protected readonly chAccessEngine : ChAccessEngine;
    protected readonly worker : ZationWorker;

    protected currentDefault : boolean;
    protected currentUserGroup :string | undefined;
    protected currentUserId : string | number | undefined;

    constructor(shBridge : BaseSHBridge,tokenEngine :TokenEngine,worker : ZationWorker)
    {
        this.aePreparedPart = worker.getAEPreparedPart();
        this.shBridge       = shBridge;
        this.tokenEngine    = tokenEngine;
        this.chAccessEngine = worker.getChAccessEngine();
        this.worker         = worker;

        this.currentDefault      = true;
        this.currentUserGroup    = undefined;
        this.currentUserId       = undefined;
    }

    /**
     * Load information from token.
     */
    refresh() : void {
        // noinspection JSUnresolvedFunction
        const authToken : ZationToken | null = this.shBridge.getToken();
        if(authToken !== null)
        {
            this.currentUserId = authToken.zationUserId;
            this.currentUserGroup = authToken.zationAuthUserGroup;
            this.currentDefault = false;
        }
        else {
            this.currentUserGroup = this.getDefaultGroup();
        }
    }

    isAuth() : boolean {
        return !(this.isDefault());
    }

    isDefault() : boolean {
        return this.currentDefault;
    }

    getUserGroup() : string | undefined {
        return this.currentUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthUserGroup() : string | undefined {
        return this.isDefault() ? undefined : this.currentUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getUserId() : number | string | undefined {
        return this.currentUserId;
    }

    async authenticate(authUserGroup : string, userId ?: string | number,tokenCustomVar ?: object) : Promise<void>
    {
        if(this.checkIsIn(authUserGroup)) {

            const obj : PrepareZationToken = {
                zationAuthUserGroup : authUserGroup
            };

            //Id to setBoth in time
            if(userId !== undefined) {
                obj.zationUserId = userId;
            }

            //check auto panelAccess
            if(this.aePreparedPart.authUserGroupPanelAccess(authUserGroup)) {
                obj.zationPanelAccess = true;
            }

            //custom token var
            if(tokenCustomVar){
                obj[nameof<ZationToken>(s => s.zationCustomVariables)] = tokenCustomVar;
            }

            //create AuthEngine Token!
            let suc = false;
            if(this.shBridge.hasToken()) {
                suc = await this.tokenEngine.updateTokenVariable(obj);
            }
            else {
                suc = await this.tokenEngine.createToken(obj);
            }

            if(suc) {
                this.currentDefault = false;
                this.currentUserId = userId;
                this.currentUserGroup = authUserGroup;
            }
            else {
                throw new AuthenticationError(`Update or create token is failed!`);
            }
        }
        else {
            throw new AuthenticationError(`Auth group '${authUserGroup}' is not found in the app.config!`);
        }
    }

    async setPanelAccess(access : boolean) : Promise<void>
    {
        if(this.isAuth()) {
            const obj : PrepareZationToken = {};
            obj.zationPanelAccess = access;
            await this.tokenEngine.updateTokenVariable(obj);
        }
        else {
            throw new AuthenticationError(`Panel access can not be updated if the socket is unauthenticated!`);
        }
    }

    async setUserId(userId : number | string) : Promise<void>
    {
        if(this.isAuth()) {
            const obj : PrepareZationToken = {};
            obj.zationUserId = userId;
            //is only set if the client has a auth token (than he has also a user group)
            const suc = await this.tokenEngine.updateTokenVariable(obj);
            if(suc) {
                this.currentUserId = userId;
            }
            else {
                throw new AuthenticationError(`Update token is failed!`);
            }
        }
        else {
            throw new AuthenticationError(`User ID can not be updated if the socket is unauthenticated!`);
        }
    }

    async removeUserId() : Promise<void>
    {
        if(this.isAuth()) {
            const obj : PrepareZationToken = {};
            obj.zationUserId = null;
            const suc = await this.tokenEngine.updateTokenVariable(obj);
            if(suc) {
                this.currentUserId = undefined;
            }
            else {
                throw new AuthenticationError(`Update token is failed!`);
            }
        }
        else {
            throw new AuthenticationError(`User ID can not be updated if the socket is unauthenticated!`);
        }
    }

    async deauthenticate() : Promise <void>
    {
        if(!this.isAuth()) {
            return;
        }

        this.currentDefault = true;
        this.currentUserGroup = this.getDefaultGroup();
        this.currentUserId = undefined;

        //deauthenticate sc/send info by http back
        this.shBridge.deauthenticate();

        //check channels from sc
        if(this.shBridge.isWebSocket()) {
            await this.chAccessEngine.checkSocketCustomChAccess(this.shBridge.getSocket());
            ChAccessEngine.checkSocketZationChAccess(this.shBridge.getSocket());
        }
    }

    // noinspection JSUnusedGlobalSymbols
    isUseAuth() : boolean {
        return this.aePreparedPart.isUseAuth();
    }

    getDefaultGroup() : string {
        return this.aePreparedPart.getDefaultGroup();
    }

    checkIsIn(authGroup : string) : boolean {
        return this.aePreparedPart.isAuthGroup(authGroup);
    }

    getSHBridge() : BaseSHBridge {
        return this.shBridge;
    }

    getWorker() : ZationWorker {
        return this.worker;
    }
}

