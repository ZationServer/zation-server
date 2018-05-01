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
    constructor(data)
    {
        this._zc = data.zc;
        this._useAuth             = this._zc.getMain(Const.Main.USE_AUTH);

        if(this._useAuth)
        {
            this._groupsConfig        = this._zc.getApp(Const.App.GROUPS);
            this._authDefaultAccess   = this._zc.getApp(Const.App.ACCESS_DEFAULT);

            if(this._groupsConfig !== undefined)
            {
                this._authGroups          = this._groupsConfig[Const.App.GROUPS_AUTH_GROUPS];
                let defaultGroup = this._groupsConfig[Const.App.GROUPS_DEFAULT_GROUP];
                if(defaultGroup === undefined)
                {
                    throw new TaskError(MainErrors.defaultGroupNotFound);
                }
                else
                {
                    this._defaultGroup = defaultGroup;
                }
            }
            else
            {
                throw new TaskError(MainErrors.groupsConfigNotFound);
            }

            this._shBridge = data.shBridge;
            this._tokenEngine = data.tokenEngine;

            this._currentDefault      = true;
            this._currentGroup        = undefined;
        }
    }

    async init()
    {
        await this._processGroup();
    }

    async _processGroup()
    {
        if(this._useAuth)
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
                                authGroupsInZationConfig: this._authGroups
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
        return this._useAuth;
    }

    getDefaultGroup()
    {
       return this._defaultGroup;
    }

    checkIsIn(authGroup)
    {
        return this._authGroups.hasOwnProperty(authGroup);
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

    //PART ACCESS CHECKER

    hasServerProtocolAccess(controller)
    {
        let hasAccess = false;

        if(this._shBridge.isSocket())
        {
            if(controller[Const.App.SERVER_SOCKET_ACCESS] !== undefined)
            {
                hasAccess = controller[Const.App.SERVER_SOCKET_ACCESS];
            }
            else if(this._authDefaultAccess !== undefined &&
                this._authDefaultAccess[Const.App.SERVER_SOCKET_ACCESS] !== undefined)
            {
                hasAccess = this._authDefaultAccess[Const.App.SERVER_SOCKET_ACCESS];
            }
        }
        else
        {
            if(controller[Const.App.SERVER_HTTP_ACCESS] !== undefined)
            {
                hasAccess = controller[Const.App.SERVER_HTTP_ACCESS];
            }
            else if(this._authDefaultAccess !== undefined &&
                this._authDefaultAccess[Const.App.SERVER_HTTP_ACCESS] !== undefined)
            {
                hasAccess = this._authDefaultAccess[Const.App.SERVER_HTTP_ACCESS];
            }
        }
        return hasAccess;
    }

    hasAccessToController(controller)
    {
        let hasAccess = false;

        let keyWord = AuthEngine._getAccessKeyWord(controller);

        if(keyWord === '')
        {
            keyWord = AuthEngine._getAccessKeyWord(this._authDefaultAccess,true);
            if(keyWord === '')
            {
                this._zc.printDebugWarning('No default Access Found! Access will denied!');
                return false;
            }
            else
            {
                hasAccess = this._hasAccessToThis(keyWord,this._authDefaultAccess[keyWord]);
            }
        }
        else
        {
            hasAccess = this._hasAccessToThis(keyWord,controller[keyWord]);
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

    getProtocol()
    {
        return this._shBridge.isSocket() ? 'socket' : 'http';
    }
}

module.exports = AuthEngine;