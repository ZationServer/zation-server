/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
const Const         = require('../constants/constWrapper');
const Logger        = require('./../logger/logger');
const TaskError     = require('../../api/TaskError');
const MainErrors    = require('../zationTaskErrors/mainTaskErrors');

class AuthEngine
{
    constructor(shBridge,tokenEngine,aePreparedPart)
    {
        this._aePreparedPart = aePreparedPart;
        this._shBridge = shBridge;
        this._tokenEngine = tokenEngine;

        this._currentDefault      = true;
        this._currentGroup        = undefined;
        this._currentAuthId       = undefined;
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
                this._currentAuthId = authToken[Const.Settings.CLIENT_AUTH_ID];
                let authGroup = authToken[Const.Settings.CLIENT_AUTH_GROUP];
                if(authGroup !== undefined)
                {
                    if (this.checkIsIn(authGroup))
                    {
                        this._currentGroup = authGroup;
                        this._currentDefault = false;
                    }
                    else
                    {
                        //saved AuthEngine In Server is not define
                        // noinspection JSUnresolvedFunction
                        await this.authOut();

                        throw new TaskError(MainErrors.savedAuthGroupInTokenNotFound,
                            {
                                savedAuthGroup: authGroup,
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
                this._currentGroup = this.getDefaultGroup();
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

    getGroup()
    {
        return this._currentGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthGroup()
    {
        return this.isDefault() ? undefined : this._currentGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthId()
    {
        return this._currentAuthId;
    }

    //PART AUTHENTICATION

    async authTo(group,id,clientData)
    {
        let suc = false;
        if(this.checkIsIn(group))
        {
            let obj = {};
            obj[Const.Settings.CLIENT_AUTH_GROUP] = group;

            //Id to setBoth in time
            if(id !== undefined)
            {
                obj[Const.Settings.CLIENT_AUTH_ID] = id;
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
            this._currentAuthId = id;
            this._currentGroup = group;

            await this._tokenEngine.setTokenVariable(clientData);

            suc = true;
        }
        return suc;
    }

    async setAuthId(authId)
    {
        let suc = false;
        if(authId !== undefined)
        {
            let obj = {};
            obj[Const.Settings.CLIENT_AUTH_ID] = authId;
            //is only set if the client has a auth token (than he has also a user group)
            await this._tokenEngine.setTokenVariable(obj,true);
            this._currentAuthId(authId);
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
        this._currentGroup = this.getDefaultGroup();
        this._currentAuthId = undefined;
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
        let notAccess = obj[Const.App.CONTROLLER_NOT_ACCESS];
        let access    = obj[Const.App.CONTROLLER_ACCESS];
        let keyWord = '';

        //double keyword is checked in the starter checkConfig
        //search One
        if(notAccess !== undefined && access === undefined)
        {
            keyWord = Const.App.CONTROLLER_NOT_ACCESS;
        }
        else if(notAccess === undefined && access !== undefined)
        {
            keyWord = Const.App.CONTROLLER_ACCESS;
        }
        return keyWord;
    }

    _hasAccessToThis(key,value)
    {
        let access = false;

        if(typeof value === 'string' || value instanceof String)
        {
            if(value === Const.App.ACCESS_ALL)
            {
                access = AuthEngine._accessKeyWordChanger(key,true);
            }
            else if(value === Const.App.ACCESS_ALL_AUTH)
            {
                access = AuthEngine._accessKeyWordChanger(key,this.isAuth());
            }
            else if(value === Const.App.ACCESS_ALL_NOT_AUTH)
            {
                access = AuthEngine._accessKeyWordChanger(key,this.isDefault());
            }
            else if(this.checkIsIn(key))
            {
                //Group!
                access = AuthEngine._accessKeyWordChanger(key,this.getGroup() === value);
            }
        }
        else if(Array.isArray(value))
        {
            //authGroups
            let imIn = false;
            for(let i = 0; i < value.length;i++)
            {
                if(((typeof value[i] === 'string' || value[i] instanceof String)&&value[i] === this.getGroup())
                || (Number.isInteger(value[i]) && value[i] === this.getAuthId()))
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
            access = AuthEngine._accessKeyWordChanger(key, this.getAuthId() === value);
        }
        return access;
    }

    static _accessKeyWordChanger(key,access)
    {
        if(key === Const.App.CONTROLLER_NOT_ACCESS)
        {
            return !access;
        }
        return access;
    }

    //PART PROTOCOL ACCESS CHECKER

    hasServerProtocolAccess(controller)
    {
        let hasAccess = true;
        if(this._shBridge.isSocket() && controller[Const.App.SERVER_SOCKET_ACCESS] !== undefined)
        {
            hasAccess = controller[Const.App.SERVER_SOCKET_ACCESS];
        }
        else if(controller[Const.App.SERVER_HTTP_ACCESS] !== undefined)
        {
            hasAccess = controller[Const.App.SERVER_HTTP_ACCESS];
        }
        return hasAccess;
    }

    getProtocol()
    {
        return this._shBridge.isSocket() ? 'socket' : 'http';
    }
}

module.exports = AuthEngine;