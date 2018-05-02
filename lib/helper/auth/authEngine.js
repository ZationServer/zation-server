/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
const Const         = require('../constants/constWrapper');
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
        this._controllerDefault = this._aePreparedPart.getControllerDefault();
    }

    async init()
    {
        await this._processGroup();
    }

    async _processGroup()
    {
        if(this._aePreparedPart.useAuth())
        {
            // noinspection JSUnresolvedFunction
            let authToken = this._shBridge.getTokenBridge().getToken();
            if(authToken !== null && authToken !== undefined)
            {
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
            this._currentGroup = group;

            await this._tokenEngine.setTokenVariable(clientData);

            suc = true;
        }
        return suc;
    }

    async setClientId(id)
    {
        let suc = false;
        if(id !== undefined)
        {
            let obj = {};
            obj[Const.Settings.CLIENT_AUTH_ID] = id;
            await this._tokenEngine.setTokenVariable(obj,true);
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
        await this._tokenEngine.deauthenticate();
    }

    //PART AUTHENTICATION ACCESS CHECKER

    hasAccessToController(controller)
    {
        let hasAccess = false;

        let keyWord = AuthEngine._getAccessKeyWord(controller);

        if(keyWord === Const.App.CONTROLLER_ACCESS &&
            typeof controller[Const.App.CONTROLLER_ACCESS] === 'function')
        {
            let token = this._shBridge.getTokenBridge().getToken();
            let smallBag = this._aePreparedPart.getWorker().getPreparedSmallBag();
            hasAccess = controller[Const.App.CONTROLLER_ACCESS](smallBag,token);
        }
        else
        {
            if(keyWord === '')
            {
                keyWord = AuthEngine._getAccessKeyWord(this._controllerDefault,true);
                if(keyWord === '')
                {
                    this._aePreparedPart.getZationConfig()
                        .printDebugWarning('No default Access Found! Access will denied!');

                    return false;
                }
                else
                {
                    hasAccess = this._hasAccessToThis(keyWord,this._controllerDefault[keyWord]);
                }
            }
            else
            {
                hasAccess = this._hasAccessToThis(keyWord,controller[keyWord]);
            }
        }
        return hasAccess;
    }

    static _getAccessKeyWord(obj,isDefault = false)
    {
        let notAccess = obj[Const.App.CONTROLLER_NOT_ACCESS];
        let access    = obj[Const.App.CONTROLLER_ACCESS];
        let keyWord = '';

        if(notAccess !== undefined && access !== undefined)
        {
            throw new TaskError(MainErrors.doubleAccessKeyWord, {isInController : !isDefault});
        }
        else
        {
            //search One
            if(notAccess !== undefined && access === undefined)
            {
                keyWord = Const.App.CONTROLLER_NOT_ACCESS;
            }
            else if(notAccess === undefined && access !== undefined)
            {
                keyWord = Const.App.CONTROLLER_ACCESS;
            }
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
                if(this.getGroup() === value)
                {
                    imIn = true;
                    break;
                }
            }
            access = AuthEngine._accessKeyWordChanger(key,imIn);
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

        if(this._shBridge.isSocket())
        {
            if(controller[Const.App.SERVER_SOCKET_ACCESS] !== undefined)
            {
                hasAccess = controller[Const.App.SERVER_SOCKET_ACCESS];
            }
            else if(this._controllerDefault !== undefined &&
                this._controllerDefault[Const.App.SERVER_SOCKET_ACCESS] !== undefined)
            {
                hasAccess = this._controllerDefault[Const.App.SERVER_SOCKET_ACCESS];
            }
        }
        else
        {
            if(controller[Const.App.SERVER_HTTP_ACCESS] !== undefined)
            {
                hasAccess = controller[Const.App.SERVER_HTTP_ACCESS];
            }
            else if(this._controllerDefault !== undefined &&
                this._controllerDefault[Const.App.SERVER_HTTP_ACCESS] !== undefined)
            {
                hasAccess = this._controllerDefault[Const.App.SERVER_HTTP_ACCESS];
            }
        }
        return hasAccess;
    }

    getProtocol()
    {
        return this._shBridge.isSocket() ? 'socket' : 'http';
    }
}

module.exports = AuthEngine;