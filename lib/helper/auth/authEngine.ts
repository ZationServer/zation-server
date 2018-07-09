/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
const Const         = require('../constants/constWrapper');
const Logger        = require('../logger/logger');
const TaskError     = require('../../api/TaskError');
import AEPreparedPart = require('./aePreparedPart');

class AuthEngine
{
    constructor(shBridge,tokenEngine,aePreparedPart : AEPreparedPart)
    {
        this._aePreparedPart = aePreparedPart;
        this._shBridge = shBridge;
        this._tokenEngine = tokenEngine;

        this._currentDefault      = true;
        this._currentUserGroup        = undefined;
        this._currentUserId       = undefined;
    }

    async init()
    {
        await this._processGroupAndId();
    }

    async _processGroupAndId()
    {
        if(this._aePreparedPart.useAuth())
        {
            // noinspection JSUnresolvedFunction
            let authToken = this._shBridge.getTokenBridge().getToken();
            if(authToken !== null && authToken !== undefined)
            {
                this._currentUserId = authToken[Const.Settings.CLIENT.USER_ID];
                let authUserGroup = authToken[Const.Settings.CLIENT.AUTH_USER_GROUP];
                if(authUserGroup !== undefined)
                {
                    if (this.checkIsIn(authUserGroup))
                    {
                        this._currentUserGroup = authUserGroup;
                        this._currentDefault = false;
                    }
                    else
                    {
                        //saved AuthEngine In Server is not define
                        // noinspection JSUnresolvedFunction
                        await this.authOut();

                        throw new TaskError(MainErrors.savedAuthGroupInTokenNotFound,
                            {
                                savedAuthGroup: authUserGroup,
                                authGroupsInZationConfig: this._aePreparedPart.getAuthGroups()
                            });
                    }
                }
                else
                {
                    //AuthEngine without auth group!
                    await this.authOut();
                    throw new TaskError(MainErrors.tokenWithoutAuthGroup);
                }
            }
            else
            {
                this._currentUserGroup = this.getDefaultGroup();
            }
        }
    }


    isAuth()
    {
        return !(this.isDefault());
    }

    isDefault()
    {
        return this._currentDefault;
    }

    // noinspection JSUnusedGlobalSymbols
    isUseAuth()
    {
        return this._aePreparedPart.useAuth();
    }

    getDefaultGroup()
    {
       return this._aePreparedPart.getDefaultGroup();
    }

    checkIsIn(authGroup)
    {
        return this._aePreparedPart.getAuthGroups().hasOwnProperty(authGroup);
    }

    getUserGroup()
    {
        return this._currentUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthUserGroup()
    {
        return this.isDefault() ? undefined : this._currentUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getUserId()
    {
        return this._currentUserId;
    }

    //PART AUTHENTICATION

    async authTo(authUserGroup,userId,clientData)
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
            if(this._shBridge.getTokenBridge().hasToken())
            {
                await this._tokenEngine.setTokenVariable(obj,true);
            }
            else
            {
                await this._tokenEngine.createToken(obj);
            }

            this._currentDefault = false;
            this._currentUserId = userId;
            this._currentUserGroup = authUserGroup;

            await this._tokenEngine.setTokenVariable(clientData);

            suc = true;
        }
        return suc;
    }

    async setUserId(userId)
    {
        let suc = false;
        if(userId !== undefined)
        {
            let obj = {};
            obj[Const.Settings.CLIENT.USER_ID] = userId;
            //is only set if the client has a auth token (than he has also a user group)
            await this._tokenEngine.setTokenVariable(obj,true);
            this._currentUserId(userId);
            suc = true;
        }
        else
        {
            throw new TaskError(MainErrors.cantSetUndefinedId);
        }
        return suc;
    }

    async authOut()
    {
        this._currentDefault = true;
        this._currentUserGroup = this.getDefaultGroup();
        this._currentUserId = undefined;
        await this._tokenEngine.deauthenticate();
    }

    //PART AUTHENTICATION ACCESS CHECKER

    hasAccessToController(controller)
    {
        let hasAccess = false;
        let keyWord = AuthEngine._getAccessKeyWord(controller);
        if(keyWord === '')
        {
            Logger.printDebugWarning('No controller access config found! Access will denied!');
            return false;
        }
        else
        {
            hasAccess = this._hasAccessToThis(keyWord,controller[keyWord]);
        }
        return hasAccess;
    }

    static _getAccessKeyWord(obj)
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

    _hasAccessToThis(key,value)
    {
        let access = false;

        if(typeof value === 'string' || value instanceof String)
        {
            if(value === Const.App.ACCESS.ALL)
            {
                access = AuthEngine._accessKeyWordChanger(key,true);
            }
            else if(value === Const.App.ACCESS.ALL_AUTH)
            {
                access = AuthEngine._accessKeyWordChanger(key,this.isAuth());
            }
            else if(value === Const.App.ACCESS.ALL_NOT_AUTH)
            {
                access = AuthEngine._accessKeyWordChanger(key,this.isDefault());
            }
            else if(this.checkIsIn(key))
            {
                //Group!
                access = AuthEngine._accessKeyWordChanger(key,this.getUserGroup() === value);
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
            access = AuthEngine._accessKeyWordChanger(key,imIn);
        }
        else if(typeof value === 'function')
        {
            let token = this._shBridge.getTokenBridge().getToken();
            let smallBag = this._aePreparedPart.getWorker().getPreparedSmallBag();
            access = AuthEngine._accessKeyWordChanger(key,value(smallBag,token));
        }
        else if(Number.isInteger(value))
        {
            access = AuthEngine._accessKeyWordChanger(key, this.getUserId() === value);
        }
        return access;
    }

    static _accessKeyWordChanger(key,access)
    {
        if(key === Const.App.CONTROLLER.NOT_ACCESS)
        {
            return !access;
        }
        return access;
    }

    //PART PROTOCOL ACCESS CHECKER

    hasServerProtocolAccess(controller)
    {
        let hasAccess = true;
        if(this._shBridge.isWebSocket() && controller[Const.App.CONTROLLER.WS_ACCESS] !== undefined)
        {
            hasAccess = controller[Const.App.CONTROLLER.WS_ACCESS];
        }
        else if(controller[Const.App.CONTROLLER.HTTP_ACCESS] !== undefined)
        {
            hasAccess = controller[Const.App.CONTROLLER.HTTP_ACCESS];
        }
        return hasAccess;
    }

    getProtocol()
    {
        return this._shBridge.isWebSocket() ? 'ws' : 'http';
    }
}

module.exports = AuthEngine;