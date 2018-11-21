/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Logger         = require('../logger/logger');
import TaskError      = require('../../api/TaskError');
import AEPreparedPart = require('./aePreparedPart');
import SHBridge       = require("../bridges/shBridge");
import TokenEngine    = require("../token/tokenEngine");
import MainErrors     = require("../zationTaskErrors/mainTaskErrors");
import ZationTokenInfo    = require("../infoObjects/zationTokenInfo");
import {ChAccessEngine} from "../channel/chAccessEngine";
import AuthenticationError = require("../error/authenticationError");
import ZationWorker        = require("../../main/zationWorker");
import {PrepareZationToken, ZationAccess, ZationToken} from "../constants/internal";
import {ControllerConfig} from "../configs/appConfig";

class AuthEngine
{
    private aePreparedPart : AEPreparedPart;
    private shBridge : SHBridge;
    private tokenEngine : TokenEngine;
    private chAccessEngine : ChAccessEngine;
    private worker : ZationWorker;

    private currentDefault : boolean;
    private currentUserGroup :string | undefined;
    private currentUserId : string | number | undefined;

    constructor(shBridge : SHBridge,tokenEngine :TokenEngine,worker : ZationWorker)
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

    async init() : Promise<void>
    {
        await this.processGroupAndId();
    }

    private async processGroupAndId(): Promise<void>
    {
        // noinspection JSUnresolvedFunction
        const authToken : ZationToken | null = this.shBridge.getTokenBridge().getToken();
        if(authToken !== null && authToken !== undefined)
        {
            this.currentUserId = !!authToken.zationUserId ? authToken.zationUserId : undefined;
            const authUserGroup = authToken.zationAuthUserGroup;

            if(authUserGroup !== undefined) {
                if (this.checkIsIn(authUserGroup)) {
                    this.currentUserGroup = authUserGroup;
                    this.currentDefault = false;
                }
                else {
                    //saved authGroup is in Server not define
                    //noinspection JSUnresolvedFunction
                    await this.deauthenticate();
                    throw new TaskError(MainErrors.inTokenSavedAuthGroupIsNotFound,
                        {
                            savedAuthGroup: authUserGroup,
                            authGroupsInZationConfig: this.aePreparedPart.getAuthGroups()
                        });
                }
            }
            else {
                if(!(typeof authToken.zationOnlyPanelToken === 'boolean' && authToken.zationOnlyPanelToken)) {
                    //token without auth group and it is not a only panel token.
                    await this.deauthenticate();
                    throw new TaskError(MainErrors.tokenWithoutAuthGroup);
                }
            }
        }
        else {
            this.currentUserGroup = this.getDefaultGroup();
        }
    }

    isAuth() : boolean
    {
        return !(this.isDefault());
    }

    isDefault() : boolean
    {
        return this.currentDefault;
    }

    // noinspection JSUnusedGlobalSymbols
    isUseAuth() : boolean
    {
        return this.aePreparedPart.isUseAuth();
    }

    getDefaultGroup() : string
    {
       return this.aePreparedPart.getDefaultGroup();
    }

    checkIsIn(authGroup : string) : boolean
    {
        return this.aePreparedPart.isAuthGroup(authGroup);
    }

    getUserGroup() : string | undefined
    {
        return this.currentUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthUserGroup() : string | undefined
    {
        return this.isDefault() ? undefined : this.currentUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getUserId() : number | string | undefined
    {
        return this.currentUserId;
    }

    //PART AUTHENTICATION&
    async authenticate(authUserGroup : string, userId ?: string | number,tokenCustomVar ?: object) : Promise<void>
    {
        if(this.checkIsIn(authUserGroup)) {

            const obj : PrepareZationToken = {};
            obj.zationAuthUserGroup = authUserGroup;

            //Id to setBoth in time
            if(userId !== undefined) {
                obj.zationUserId = userId;
            }

            //check auto panelAccess
            if(this.aePreparedPart.authUserGroupPanelAccess(authUserGroup)) {
                obj.zationPanelAccess = true;
            }

            //create AuthEngine Token!
            let suc = false;
            if(this.shBridge.getTokenBridge().hasToken()) {
                suc = await this.tokenEngine.updateTokenVariable(obj);
            }
            else {
                suc = await this.tokenEngine.createToken(obj);
            }

            if(suc) {
                this.currentDefault = false;
                this.currentUserId = userId;
                this.currentUserGroup = authUserGroup;

                if(!!tokenCustomVar) {
                    await this.tokenEngine.setCustomTokenVariable(tokenCustomVar);
                }
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

    //PART AUTHENTICATION ACCESS CHECKER

    hasAccessToController(controller : object) : boolean
    {
        let hasAccess = false;
        let keyWord = controller['speedAccessKey'];

        if(keyWord === '') {
            Logger.printDebugWarning('No controller protocolAccess config found! Access will denied!');
            return false;
        }
        else {
            hasAccess = this.hasAccessToThis(keyWord,controller[keyWord]);
        }
        return hasAccess;
    }

    private hasAccessToThis(key : string, value) : boolean
    {
        let access = false;

        if(typeof value === 'string')
        {
            if(value === ZationAccess.ALL) {
                access = AuthEngine.accessKeyWordChanger(key,true);
            }
            else if(value === ZationAccess.ALL_AUTH) {
                access = AuthEngine.accessKeyWordChanger(key,this.isAuth());
            }
            else if(value === ZationAccess.ALL_NOT_AUTH) {
                access = AuthEngine.accessKeyWordChanger(key,this.isDefault());
            }
            else if(this.checkIsIn(value)) {
                //GROUP!
                access = AuthEngine.accessKeyWordChanger(key,this.getUserGroup() === value);
            }
        }
        else if(Array.isArray(value))
        {
            //authGroups
            let imIn = false;
            for(let i = 0; i < value.length;i++) {
                if(((typeof value[i] === 'string' || value[i] instanceof String)&&value[i] === this.getUserGroup())
                || (Number.isInteger(value[i]) && value[i] === this.getUserId())) {
                    imIn = true;
                    break;
                }
            }
            access = AuthEngine.accessKeyWordChanger(key,imIn);
        }
        else if(typeof value === 'function') {
            let token = this.shBridge.getTokenBridge().getToken();
            let smallBag = this.aePreparedPart.getWorker().getPreparedSmallBag();
            access = AuthEngine.accessKeyWordChanger(key,value(smallBag,token !== null ? new ZationTokenInfo(token) : null));
        }
        else if(Number.isInteger(value)) {
            access = AuthEngine.accessKeyWordChanger(key, this.getUserId() === value);
        }
        return access;
    }

    private static accessKeyWordChanger(key : string,access : boolean) : boolean
    {
        if(key === nameof<ControllerConfig>(s => s.notAccess)) {
            return !access;
        }
        return access;
    }

}

export = AuthEngine;