/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
const Const         = require('../constante/constWrapper');
const TaskError     = require('../../api/TaskError');
const MainErrors      = require('../zationTaskErrors/mainTaskErrors');


class AuthEngine
{
    constructor(data)
    {
        this._zc = data.zc;
        this._useAuth             = this._zc.getMain(Const.Main.USE_AUTH);

        if(this._useAuth)
        {
            this._groupsConfig        = this._zc.getMain(Const.App.GROUPS);
            this._authGroups          = this._groupsConfig[Const.App.GROUPS_AUTH_GROUPS];
            this._authDefaultAccess   = this._zc.getApp(Const.App.ACCESS_DEFAULT);

            this._channelController   = data['channelController'];

            this._isSocket            = data['isSocket'];
            this._socket              = data['socket'];

            this._req                 = data['req'];
            this._zationReq           = data['zationReq'];
            this._res                 = data['res'];

            this._scServer            = data['scServer'];

            this._newAuthGroup        = undefined;
            this._newAuthId           = undefined;

            this._currentDefault      = true;
            this._currentGroup        = undefined;

            if(this._isSocket)
            {
                this._processGroupWithSocket();
            }
            else
            {
                this._processGroupWithHttp();
            }
        }
    }

    getNewAuthId()
    {
        return this._newAuthId;
    }

    // noinspection JSUnusedGlobalSymbols
    getNewAuthGroup()
    {
        return this._newAuthGroup;
    }

    _processGroupWithHttp()
    {
        if(this._useAuth)
        {
            if(this._zationReq[Const.Settings.INPUT_TOKEN] === undefined)
            {
                //returnDefault
                this.group = AuthEngine.getDefaultGroup();
            }
            else
            {



                if(this.checkIsIn(this.req.session[CA.CLIENT_AUTH_GROUP]))
                {
                    this.group = this.req.session[CA.CLIENT_AUTH_GROUP];
                    this.default = false;
                }
                else
                {
                    //saved AuthEngine In Server is not define
                    req.session.destroy();
                    throw new TaskError(MainErrors.savedAuthGroupFromClientDataNotFound,
                        {
                            savedAuthGroup : this.req.session[CA.CLIENT_AUTH_GROUP],
                            authGroupsInZationConfig : this._authGroups
                        });
                }
            }
        }
    }


    _processGroupWithSocket()
    {
        if(this._useAuth)
        {
            // noinspection JSUnresolvedFunction
            let authToken = this._socket.getAuthToken();
            if(authToken !== null)
            {
                if(authToken[CA.CLIENT_AUTH_GROUP] !== undefined) {
                    if (this.checkIsIn(authToken[CA.CLIENT_AUTH_GROUP])) {
                        this.group = authToken[CA.CLIENT_AUTH_GROUP];
                        this.default = false;
                    }
                    else {
                        //saved AuthEngine In Server is not define
                        // noinspection JSUnresolvedFunction
                        this._socket.deauthenticate();
                        throw new TaskError(MainErrors.savedAuthGroupFromClientDataNotFound,
                            {
                                savedAuthGroup: authToken[CA.CLIENT_AUTH_GROUP],
                                authGroupsInZationConfig: this._authGroups
                            });
                    }
                }
                else
                {
                    //AuthEngine without auth group!
                    this._socket.deauthenticate();
                    throw new TaskError(MainErrors.tokenWithoutAuthGroup);
                }
            }
            else
            {
                this.group = AuthEngine.getDefaultGroup();
            }
        }
    }


    isAuth()
    {
        return !(this.isDefault());
    }

    isDefault()
    {
        return this.default;
    }

    // noinspection JSUnusedGlobalSymbols
    isUseAuth()
    {
        return this.useAuth();
    }

    static getDefaultGroup()
    {
        let defaultGroup = cationConfig[CA.CATION_AUTH_GROUPS][CA.AUTH_DEFAULT_GROUP];
        if(defaultGroup === undefined)
        {
            throw new TaskError(MainErrors.defaultGroupNotFound);
        }
        return defaultGroup;
    }

    checkIsIn(authGroup)
    {
        if(this.authGroups !== undefined)
        {
            return this.authGroups.hasOwnProperty(authGroup);
        }
        else
        {
            return false;
        }
    }

    getGroup()
    {
        return this.group;
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthGroup()
    {
        return this.isDefault() ? undefined : this.group;
    }

    authTo(group,id,clientData)
    {
        let suc = false;
        if(this.checkIsIn(group))
        {
            let oldAuthGroup =
                ClientStorage.getClientVariable([CA.CLIENT_AUTH_GROUP],this.isSocket,this.socket,this.req);

            //Update AuthEngine
            this.default = false;
            this.group = group;

            //Update AuthEngine New
            this.newAuthGroup = group;

            let obj = {};
            obj[CA.CLIENT_AUTH_GROUP] = group;

            //Id to setBoth in time
            if(id !== undefined)
            {
                let oldId =
                    ClientStorage.getClientVariable([CA.CLIENT_AUTH_ID],this.isSocket,this.socket,this.req);

                obj[CA.CLIENT_AUTH_ID] = id;

                this.newAuthId = id;

                if(oldId !== undefined && oldId !== id && this.isSocket)
                {
                    this.channelController.kickOutUserChannel(oldId);
                }
            }

            //create AuthEngine Token!
            ClientStorage.setCationData(obj,this.isSocket,this.socket,this.req,this.channelController,true);

            //Kick out from default auth group channel!
            this.channelController.kickOutFromDefaultGroupChannel();

            if(oldAuthGroup !== undefined && oldAuthGroup !== group)
            {
                //KickOut from Old UserGroup Channel
                this.channelController.kickOutFromAuthGroupChannel(oldAuthGroup);
            }

            ClientStorage.setClientData(clientData,this.isSocket,this.socket,this.req,this.channelController);

            suc = true;
        }
        return suc;
    }

    setClientId(id)
    {
        let suc = false;
        if(id !== undefined)
        {
            let oldId =
                ClientStorage.getClientVariable([CA.CLIENT_AUTH_ID],this.isSocket,this.socket,this.req);

            let obj = {};
            obj[CA.CLIENT_AUTH_ID] = id;
            ClientStorage.setCationData(obj,this.isSocket,this.socket,this.req,this.channelController);

            suc = true;

            //Update New AuthEngine id
            this.newAuthId = id;

            if(oldId !== undefined && oldId !== id && this.isSocket)
            {
                this.channelController.kickOutUserChannel(oldId);
            }

        }
        else
        {
            throw new TaskError(MainErrors.cantSetUndefinedId);
        }
        return suc;
    }

    authOut()
    {
        //Update AuthEngine
        this.default = true;
        this.group = AuthEngine.getDefaultGroup();
        this.newAuthGroup  = '';

        if(this.isSocket)
        {
            let id =
                ClientStorage.getClientVariable([CA.CLIENT_AUTH_ID],this.isSocket,this.socket,this.req);

            if(id !== undefined)
            {
                //Kick out User group channel
                this.channelController.kickOutUserChannel(id);
            }

            this.channelController.kickOutFromAllAuthGroupChannels();
            this.socket.deauthenticate();
        }
        else
        {
            this.req.session[CA.CLIENT_AUTH_GROUP] = undefined;
            req.session.destroy();
        }
    }

    hasServerProtocolAccess(controller)
    {
        let hasAccess = false;
        let defaultConf  = cationConfig[CA.CATION_ACCESS_DEFAULT];

        if(this.isSocket)
        {
            if(controller[CA.CATION_SERVER_SOCKET_ACCESS] !== undefined)
            {
                hasAccess = controller[CA.CATION_SERVER_SOCKET_ACCESS];
            }
            else if(defaultConf !== undefined &&
            defaultConf[CA.CATION_SERVER_SOCKET_ACCESS] !== undefined)
            {
                hasAccess = defaultConf[CA.CATION_SERVER_SOCKET_ACCESS];
            }
        }
        else
        {
            if(controller[CA.CATION_SERVER_HTTP_ACCESS] !== undefined)
            {
                hasAccess = controller[CA.CATION_SERVER_HTTP_ACCESS];
            }
            else if(defaultConf !== undefined &&
                defaultConf[CA.CATION_SERVER_HTTP_ACCESS] !== undefined)
            {
                hasAccess = defaultConf[CA.CATION_SERVER_HTTP_ACCESS];
            }
        }
        return hasAccess;
    }

    hasAccessToController(controller)
    {
        let hasAccess = false;

        let keyWord = AuthEngine.getAccessKeyWord(controller);

        if(keyWord === '')
        {
            keyWord = AuthEngine.getAccessKeyWord(this.authDefault,true);
            if(keyWord === '')
            {
                if(this.debug)
                {
                    console.err('CATION -> No default Access Found! Access will denied!');
                }
                return false;
            }
            else
            {
                hasAccess = this.hasAccessToThis(keyWord,this.authDefault[keyWord]);
            }
        }
        else
        {
            hasAccess = this.hasAccessToThis(keyWord,controller[keyWord]);
        }
        return hasAccess;
    }

    static getAccessKeyWord(obj,isDefault = false)
    {
        let notAccess = obj[CA.CONTROLLER_NOT_ACCESS];
        let access    = obj[CA.CONTROLLER_ACCESS];
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
                keyWord = CA.CONTROLLER_NOT_ACCESS;
            }
            else if(notAccess === undefined && access !== undefined)
            {
                keyWord = CA.CONTROLLER_ACCESS;
            }
        }
        return keyWord;
    }

    hasAccessToThis(key,value)
    {
        let access = false;

        if(typeof value === 'string' || value instanceof String)
        {
            if(value === CA.ACCESS_ALL)
            {
                access = AuthEngine.accessKeyWordChanger(key,true);
            }
            else if(value === CA.ACCESS_ALL_AUTH)
            {
                access = AuthEngine.accessKeyWordChanger(key,this.isAuth());
            }
            else if(value === CA.ACCESS_ALL_NOT_AUTH)
            {
                access = AuthEngine.accessKeyWordChanger(key,this.isDefault());
            }
            else if(this.checkIsIn(key))
            {
                //Group!
                access = AuthEngine.accessKeyWordChanger(key,this.getGroup() === value);
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
            access = AuthEngine.accessKeyWordChanger(key,imIn);
        }
        return access;
    }

    static accessKeyWordChanger(key,access)
    {
        if(key === CA.CONTROLLER_NOT_ACCESS)
        {
            return !access;
        }
        return access;
    }

    getProtocol()
    {
        return this.isSocket ? 'socket' : 'http';
    }

    _getNewAuthData()
    {
        return {
        newAuthId : this.getNewAuthId(),
        newAuthGroup : this.getNewAuthGroup()
    };


    }
}

module.exports = AuthEngine;