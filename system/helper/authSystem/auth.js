const CA            = require('../constante/settings');
const TaskError     = require('../../api/TaskError');
const SyErrors      = require('../cationTaskErrors/systemTaskErrors');
const cationConfig  = require('../../../App/Config/cation.config');
const ClientStorage = require('../clientStorage/clientStorage');


class Auth
{
    constructor(data)
    {
        this.authGroupConfig = cationConfig[CA.CATION_AUTH_GROUPS];
        this.authGroups      = this.authGroupConfig[CA.AUTH_AUTH_GROUPS];

        this.authDefault     = cationConfig[CA.CATION_ACCESS_DEFAULT];

        this.channelController = data['channelController'];

        this.useAuth         = data['useAuth'];
        this.isSocket        = data['isSocket'];

        this.default         = true;
        this.debug           = data['debug'];

        this.req             = data['req'];
        this.res             = data['res'];

        this.socket          = data['socket'];
        this.scServer        = data['scServer'];

        this.newAuthGroup = undefined;
        this.newAuthId    = undefined;

        this.group = undefined;

        if(this.isSocket)
        {
            this.processGroupWithSocket();
        }
        else
        {
            this.processGroupWithHttp();
        }

    }

    getNewAuthId()
    {
        return this.newAuthId;
    }

    // noinspection JSUnusedGlobalSymbols
    getNewAuthGroup()
    {
        return this.newAuthGroup;
    }

    processGroupWithHttp()
    {
        if(this.useAuth)
        {
            if(this.req.session[CA.CLIENT_AUTH_GROUP] === undefined)
            {
                //returnDefault
                this.group = Auth.getDefaultGroup();
            }
            else if(this.checkIsIn(this.req.session[CA.CLIENT_AUTH_GROUP]))
            {
                this.group = this.req.session[CA.CLIENT_AUTH_GROUP];
                this.default = false;
            }
            else
            {
                //saved Auth In Server is not define
                req.session.destroy();
                throw new TaskError(SyErrors.savedAuthGroupFromClientDataNotFound,
                    {
                        savedAuthGroup : this.req.session[CA.CLIENT_AUTH_GROUP],
                        authGroupsInCationConfig : this.authGroupConfig[CA.AUTH_AUTH_GROUPS]
                    });
            }
        }
    }


    processGroupWithSocket()
    {
        if(this.useAuth)
        {
            let authToken = this.socket.getAuthToken();
            if(authToken !== null)
            {
                if(authToken[CA.CLIENT_AUTH_GROUP] !== undefined) {
                    if (this.checkIsIn(authToken[CA.CLIENT_AUTH_GROUP])) {
                        this.group = authToken[CA.CLIENT_AUTH_GROUP];
                        this.default = false;
                    }
                    else {
                        //saved Auth In Server is not define
                        this.socket.deauthenticate();
                        throw new TaskError(SyErrors.savedAuthGroupFromClientDataNotFound,
                            {
                                savedAuthGroup: this.req.session[CA.CLIENT_AUTH_GROUP],
                                authGroupsInCationConfig: this.authGroupConfig[CA.AUTH_AUTH_GROUPS]
                            });
                    }
                }
                else
                {
                    //Auth without auth group!
                    this.socket.deauthenticate();
                    throw new TaskError(SyErrors.tokenWithoutAuthGroup);
                }
            }
            else
            {
                this.group = Auth.getDefaultGroup();
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
            throw new TaskError(SyErrors.defaultGroupNotFound);
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

            //Update Auth
            this.default = false;
            this.group = group;

            //Update Auth New
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

            //create Auth Token!
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

            //Update New Auth id
            this.newAuthId = id;

            if(oldId !== undefined && oldId !== id && this.isSocket)
            {
                this.channelController.kickOutUserChannel(oldId);
            }

        }
        else
        {
            throw new TaskError(SyErrors.cantSetUndefinedId);
        }
        return suc;
    }

    authOut()
    {
        //Update Auth
        this.default = true;
        this.group = Auth.getDefaultGroup();
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

        let keyWord = Auth.getAccessKeyWord(controller);

        if(keyWord === '')
        {
            keyWord = Auth.getAccessKeyWord(this.authDefault,true);
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
            throw new TaskError(SyErrors.doubleAccessKeyWord, {isInController : !isDefault});
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
                access = Auth.accessKeyWordChanger(key,true);
            }
            else if(value === CA.ACCESS_ALL_AUTH)
            {
                access = Auth.accessKeyWordChanger(key,this.isAuth());
            }
            else if(value === CA.ACCESS_ALL_NOT_AUTH)
            {
                access = Auth.accessKeyWordChanger(key,this.isDefault());
            }
            else if(this.checkIsIn(key))
            {
                //Group!
                access = Auth.accessKeyWordChanger(key,this.getGroup() === value);
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
            access = Auth.accessKeyWordChanger(key,imIn);
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

module.exports = Auth;