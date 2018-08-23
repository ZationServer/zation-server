/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const          = require('../constants/constWrapper');
import Logger         = require('../logger/logger');
import TaskError      = require('../../api/TaskError');
import AEPreparedPart = require('./aePreparedPart');
import SHBridge       = require("../bridges/shBridge");
import TokenEngine    = require("../token/tokenEngine");
import MainErrors     = require("../zationTaskErrors/mainTaskErrors");
import ZationToken = require("../infoObjects/zationInfo");
import {ChAccessEngine} from "../channel/chAccessEngine";

class AuthEngine
{
    private aePreparedPart : AEPreparedPart;
    private shBridge : SHBridge;
    private tokenEngine : TokenEngine;

    private currentDefault : boolean;
    private currentUserGroup :string | undefined;
    private currentUserId : any;

    constructor(shBridge : SHBridge,tokenEngine :TokenEngine,aePreparedPart : AEPreparedPart)
    {
        this.aePreparedPart = aePreparedPart;
        this.shBridge       = shBridge;
        this.tokenEngine    = tokenEngine;

        this.currentDefault      = true;
        this.currentUserGroup    = undefined;
        this.currentUserId       = undefined;
    }

    async init() : Promise<void>
    {
        await this._processGroupAndId();
    }

    async _processGroupAndId(): Promise<void>
    {
        if(this.aePreparedPart.isUseAuth())
        {
            // noinspection JSUnresolvedFunction
            let authToken = this.shBridge.getTokenBridge().getToken();
            if(authToken !== null && authToken !== undefined)
            {
                this.currentUserId = authToken[Const.Settings.CLIENT.USER_ID];
                let authUserGroup = authToken[Const.Settings.CLIENT.AUTH_USER_GROUP];
                if(authUserGroup !== undefined)
                {
                    if (this.checkIsIn(authUserGroup))
                    {
                        this.currentUserGroup = authUserGroup;
                        this.currentDefault = false;
                    }
                    else
                    {
                        //saved authGroup is in Server not define
                        //noinspection JSUnresolvedFunction
                        await this.authOut();

                        throw new TaskError(MainErrors.inTokenSavedAuthGroupIsNotFound,
                            {
                                savedAuthGroup: authUserGroup,
                                authGroupsInZationConfig: this.aePreparedPart.getAuthGroups()
                            });
                    }
                }
                else
                {
                    //token without auth group!
                    await this.authOut();
                    throw new TaskError(MainErrors.tokenWithoutAuthGroup);
                }
            }
            else
            {
                this.currentUserGroup = this.getDefaultGroup();
            }
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

    //PART AUTHENTICATION

    async authTo(authUserGroup : string,userId ?: string | number,clientData : object = {}) : Promise<boolean>
    {
        let suc = false;
        if(this.checkIsIn(authUserGroup))
        {
            let obj = {};
            obj[Const.Settings.CLIENT.AUTH_USER_GROUP] = authUserGroup;

            //Id to setBoth in time
            if(userId !== undefined)
            {
                obj[Const.Settings.CLIENT.USER_ID] = userId;
            }

            //create AuthEngine Token!
            if(this.shBridge.getTokenBridge().hasToken())
            {
                await this.tokenEngine.setTokenVariable(obj,true);
            }
            else
            {
                await this.tokenEngine.createToken(obj);
            }

            this.currentDefault = false;
            this.currentUserId = userId;
            this.currentUserGroup = authUserGroup;

            await this.tokenEngine.setTokenVariable(clientData);

            suc = true;
        }
        return suc;
    }

    async setUserId(userId : number | string) : Promise<boolean>
    {
        let suc = false;
        if(userId !== undefined)
        {
            let obj = {};
            obj[Const.Settings.CLIENT.USER_ID] = userId;
            //is only set if the client has a auth token (than he has also a user group)
            await this.tokenEngine.setTokenVariable(obj,true);
            this.currentUserId(userId);
            suc = true;
        }
        else
        {
            throw new TaskError(MainErrors.cantSetUndefinedId);
        }
        return suc;
    }

    async authOut() : Promise <void>
    {
        if(!this.isAuth()) {
            return;
        }

        this.currentDefault = true;
        this.currentUserGroup = this.getDefaultGroup();
        this.currentUserId = undefined;

        //deauthenticate socket/send info by http back
        this.shBridge.deauthenticate();

        //block oldToken and disconnect all sockets with Token Id
        await this.tokenEngine.deauthenticate(this.shBridge.getTokenBridge().getToken());

        //check channels from socket
        if(this.shBridge.isWebSocket())
        {
            await ChAccessEngine.checkSocketCustomChAccess(this.shBridge.getSocket(),this.aePreparedPart.getWorker());
            ChAccessEngine.checkSocketZationChAccess(this.shBridge.getSocket());
        }
    }

    //PART AUTHENTICATION ACCESS CHECKER

    hasAccessToController(controller : object) : boolean
    {
        let hasAccess = false;
        let keyWord = AuthEngine.getAccessKeyWord(controller);

        if(keyWord === '')
        {
            Logger.printDebugWarning('No controller access config found! Access will denied!');
            return false;
        }
        else
        {
            hasAccess = this.hasAccessToThis(keyWord,controller[keyWord]);
        }
        return hasAccess;
    }

    private static getAccessKeyWord(obj : object) : string
    {
        let notAccess = obj[Const.App.CONTROLLER.NOT_ACCESS];
        let access    = obj[Const.App.CONTROLLER.ACCESS];
        let keyWord = '';

        //double keyword is checked in the starter checkConfig
        //search One
        if(notAccess !== undefined && access === undefined)
        {
            keyWord = Const.App.CONTROLLER.NOT_ACCESS;
        }
        else if(notAccess === undefined && access !== undefined)
        {
            keyWord = Const.App.CONTROLLER.ACCESS;
        }
        return keyWord;
    }

    private hasAccessToThis(key : string, value) : boolean
    {
        let access = false;

        if(typeof value === 'string')
        {
            if(value === Const.App.ACCESS.ALL)
            {
                access = AuthEngine.accessKeyWordChanger(key,true);
            }
            else if(value === Const.App.ACCESS.ALL_AUTH)
            {
                access = AuthEngine.accessKeyWordChanger(key,this.isAuth());
            }
            else if(value === Const.App.ACCESS.ALL_NOT_AUTH)
            {
                access = AuthEngine.accessKeyWordChanger(key,this.isDefault());
            }
            else if(this.checkIsIn(value))
            {
                //Group!
                access = AuthEngine.accessKeyWordChanger(key,this.getUserGroup() === value);
            }
        }
        else if(Array.isArray(value))
        {
            //authGroups
            let imIn = false;
            for(let i = 0; i < value.length;i++)
            {
                if(((typeof value[i] === 'string' || value[i] instanceof String)&&value[i] === this.getUserGroup())
                || (Number.isInteger(value[i]) && value[i] === this.getUserId()))
                {
                    imIn = true;
                    break;
                }
            }
            access = AuthEngine.accessKeyWordChanger(key,imIn);
        }
        else if(typeof value === 'function')
        {
            let token = this.shBridge.getTokenBridge().getToken();
            let smallBag = this.aePreparedPart.getWorker().getPreparedSmallBag();
            access = AuthEngine.accessKeyWordChanger(key,value(smallBag,new ZationToken(token)));
        }
        else if(Number.isInteger(value))
        {
            access = AuthEngine.accessKeyWordChanger(key, this.getUserId() === value);
        }
        return access;
    }

    private static accessKeyWordChanger(key : string,access : boolean) : boolean
    {
        if(key === Const.App.CONTROLLER.NOT_ACCESS)
        {
            return !access;
        }
        return access;
    }

    //PART PROTOCOL ACCESS CHECKER

    hasServerProtocolAccess(controller : object) : boolean
    {
        let hasAccess = true;
        if(this.shBridge.isWebSocket() && controller[Const.App.CONTROLLER.WS_ACCESS] !== undefined)
        {
            hasAccess = controller[Const.App.CONTROLLER.WS_ACCESS];
        }
        else if(controller[Const.App.CONTROLLER.HTTP_ACCESS] !== undefined)
        {
            hasAccess = controller[Const.App.CONTROLLER.HTTP_ACCESS];
        }
        return hasAccess;
    }

    getProtocol() : string
    {
        return this.shBridge.isWebSocket() ? 'ws' : 'http';
    }
}

export = AuthEngine;