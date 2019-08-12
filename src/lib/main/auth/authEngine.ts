/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker        = require("../../core/zationWorker");
import {PrepareZationToken, ZationToken} from "../constants/internal";
import BaseSHBridge         from "../bridges/baseSHBridge";
import AEPreparedPart       from "./aePreparedPart";
import AuthenticationError  from "../error/authenticationError";
import TokenUtils           from "../token/tokenUtils";
import JwtSignOptions       from "../constants/jwt";

export default class AuthEngine
{
    protected readonly aePreparedPart : AEPreparedPart;
    protected readonly shBridge : BaseSHBridge;
    protected readonly worker : ZationWorker;
    protected readonly tokenClusterKey : string;

    protected currentDefault : boolean;
    protected currentUserGroup : string | undefined;
    protected currentUserId : string | number | undefined;

    constructor(shBridge : BaseSHBridge,worker : ZationWorker)
    {
        this.aePreparedPart = worker.getAEPreparedPart();
        this.shBridge       = shBridge;
        this.worker         = worker;
        this.tokenClusterKey  = worker.getZationConfig().internalData.tokenClusterKey;

        this.currentDefault   = true;
        this.currentUserGroup = this.aePreparedPart.getDefaultGroup();
        this.currentUserId    = undefined;
    }

    /**
     * Load the information from token in the memory of the auth engine.
     */
    refresh(token : null | ZationToken) : void {
        if(token !== null) {
            this.currentUserId = token.zationUserId;
            this.currentUserGroup = token.zationAuthUserGroup;
            this.currentDefault = false;
        }
        else {
            this.currentDefault = true;
            this.currentUserGroup = this.aePreparedPart.getDefaultGroup();
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

    getAuthUserGroup() : string | undefined {
        return this.isDefault() ? undefined : this.currentUserGroup;
    }

    getUserId() : number | string | undefined {
        return this.currentUserId;
    }

    async authenticate(authUserGroup : string, userId ?: string | number,tokenCustomVar : object = {},jwtOptions : JwtSignOptions = {}) : Promise<void>
    {
        if(this.checkIsIn(authUserGroup)) {

            const token : PrepareZationToken =
                this.shBridge.hasToken() ?
                {} : TokenUtils.generateToken(this.tokenClusterKey);

            token.zationAuthUserGroup = authUserGroup;
            token.zationCustomVariables = tokenCustomVar;

            if(userId !== undefined) {
                token.zationUserId = userId;
            }
            //check auto panelAccess
            if(this.aePreparedPart.authUserGroupPanelAccess(authUserGroup)) {
                token.zationPanelAccess = true;
            }

            await this.shBridge.setToken(TokenUtils.combineTokens(this.shBridge.getToken(),token),jwtOptions);
        }
        else {
            throw new AuthenticationError(`Auth group '${authUserGroup}' is not found in the app.config.`);
        }
    }

    async setPanelAccess(access : boolean) : Promise<void>
    {
        let token = this.shBridge.getToken();
        if(token !== null) {
            token = {...token};
            token.zationPanelAccess = access;
            await this.shBridge.setToken(token);
        }
        else {
            throw new AuthenticationError(`Panel access can not be updated if the socket is unauthenticated!`);
        }
    }

    hasPanelAccess() : boolean {
        const token = this.shBridge.getToken();
        if(token !== null && typeof token.zationPanelAccess === 'boolean'){
            return token.zationPanelAccess;
        }
        return false;
    }

    async setUserId(userId : number | string | undefined) : Promise<void> {
        let token = this.shBridge.getToken();
        if(token !== null) {
            token = {...token};
            token.zationUserId = userId;
            await this.shBridge.setToken(token);
        }
        else {
            throw new AuthenticationError(`User id can not be updated if the socket is unauthenticated!`);
        }
    }

    async removeUserId() : Promise<void> {
       await this.setUserId(undefined);
    }

    async deauthenticate() : Promise <void> {
        if(this.isAuth()) {
            this.shBridge.deauthenticate();
        }
    }

    isUseTokenStateCheck() : boolean {
        return this.aePreparedPart.isUseTokenStateCheck();
    }

    // noinspection JSUnusedGlobalSymbols
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

