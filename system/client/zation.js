/*
Zation JavaScript Client 1.0.0
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection JSUnusedGlobalSymbols
class Zation
{
    constructor(settings = {})
    {
        //Var
        this._settings = settings;

        this._currentAuthId = undefined;
        this._currentAuthGroup = undefined;

        this._authData = {};
        this._debug = false;
        this._autoStartAuth = false;
        this._autoReAuth = true;
        this._system = 'U';
        this._version = 1;
        this._hostname = 'localhost';
        this._path = '';
        this._port = 3000;
        this._secure = false;
        this._rejectUnauthorized = false;
        this._postKeyWord = 'zation';

        //SystemVars
        this._isAuthOut = false;
        this._isReAuth  = false;
        this._isFirstStart = true;
        this._authTokenName = 'zationToken';
        this._reconnect = false;

        //ChannelRegistration
        this._userChannelAutoRegistration         = true;
        this._authGroupChannelAutoRegistration    = true;
        this._defaultGroupChannelAutoRegistration = true;
        this._allChannelAutoRegistration          = true;

        this._events = [];

        //Responds
        this._requestResponds = new Box();
        this._channelResponds = new Box();

        //Init
        this._createSystemResponds();
        this._readServerSettings();
        this._readSettings();
        this._addRespondsFromSettings();
        this._createSystemReactions();
        this._buildConnection();
    }

    _createSystemResponds()
    {
        this._requestRespondSystem = this._requestResponds.addFixedItem(new RequestRespond());
        this._channelRespondSystem = this._channelResponds.addFixedItem(new ChannelRespond());
    }

    _createSystemReactions()
    {
        let requestResp = this._requestResponds.getFixedItem(this._requestRespondSystem);
        let channelResp = this._channelResponds.getFixedItem(this._channelRespondSystem);

        requestResp.onError(
            "authOut",
            () =>
            {
                this.authOut();
            },
            {
                name : 'clientAuthOut',
                type : ZationConst.ERROR_TYP_REACT
            }
        );

        channelResp.onUserCh(ZationConst.USER_CHANNEL_AUTH_OUT,() =>
        {
            this.authOut();
        });

        channelResp.onUserCh(ZationConst.USER_CHANNEL_RE_AUTH,() =>
        {
            this.reAuth();
        });
    }

    //Part Ping

    async ping()
    {
        let req = new Request(ZationConst.SYSTEM_CONTROLLER_PING);
        let start = Date.now();
        await this.send(req);
        return Date.now() - start;
    }

    //Part Responds

    // noinspection JSUnusedGlobalSymbols
    getRequestRespond(key)
    {
        return this._requestResponds.getItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    getChannelRespond(key)
    {
        return this._channelResponds.getItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    removeAllResponds()
    {
        this._requestResponds.removeAllItems();
        this._channelResponds.removeAllItems();
    }


    _addRespondsFromSettings()
    {
        let resp = this._settings['responds'];
        if (resp !== undefined)
        {
            if (Array.isArray(resp))
            {
                for(let i = 0; i < resp.length; i++)
                {
                    this.addRespond(resp[i]);
                }
            }
            else if(typeof resp === 'object')
            {
                for(let k in resp)
                {
                    if(resp.hasOwnProperty(k))
                    {
                        this.addRespond(resp[k],k);
                    }
                }
            }
            else if(resp instanceof Respond)
            {
                this.addRespond(resp);
            }
        }
    }


    // noinspection JSUnusedGlobalSymbols
    addRespond(respond,key,overwrite = true)
    {
        if(respond instanceof RequestRespond)
        {
            this._requestResponds.addItem(respond,key,overwrite);
            return true;
        }
        else if(respond instanceof ChannelRespond)
        {
            this._channelResponds.addItem(respond,key,overwrite);
            return true;
        }
        else
        {
            return false;
        }
    }

    //Part Events

    on(event,reaction = () => {})
    {
        return new Promise((resolve) =>
        {
            if(typeof reaction === 'function')
            {
                this._events.push({event : event,reaction : (data) =>
                    {
                        reaction(data);
                        resolve(data);
                    }});
                return true;
            }
            else
            {
                return false;
            }
        });
    }

    _emitEvent(event,data)
    {
        for(let i = 0; i < this._events.length; i++)
        {
            if(this._events[i].event === event)
            {
                this._events[i].reaction(data);
            }
        }
    }

    //Part Auth


    isAuthIn()
    {
        return ZationTools._isAuthIn(this._currentAuthGroup);
    }

    _setNewAuthId(id)
    {
        if (this._currentAuthId !== id)
        {
            this.unregisterUserChannel();

            this._currentAuthId = id;

            if(this._userChannelAutoRegistration)
            {
                this.registerUserChannel();
            }
        }
    }

    _setNewAuthGroup(group)
    {
        if (this._currentAuthGroup !== group)
        {
            if (group !== undefined && group !== '')
            {
                this.unregisterDefaultGroupChannel();
                this.unregisterAuthGroupChannel();

                this._currentAuthGroup = group;

                if(this._authGroupChannelAutoRegistration)
                {
                    this.registerAuthGroupChannel();
                }

                if(this._debug)
                {
                    ZationTools._printInfo(`User is Login with id -> ${this._currentAuthId} in Group
                 -> ${this._currentAuthGroup}`);
                }
            }
            else
            {
                this.unregisterAuthGroupChannel();

                this._currentAuthGroup = group;

                if(this._defaultGroupChannelAutoRegistration)
                {
                    this.registerDefaultGroupChannel();
                }
            }
        }
    }

    _updateAuthInfo(token)
    {
        if(token !== null)
        {
            if(token[ZationConst.CLIENT_AUTH_ID] !== undefined)
            {
                this._setNewAuthId(token[ZationConst.CLIENT_AUTH_ID]);
            }

            if(token[ZationConst.CLIENT_AUTH_GROUP] !== undefined)
            {
                this._setNewAuthGroup(token[ZationConst.CLIENT_AUTH_GROUP]);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    _socketIsAuthOut()
    {
        this._setNewAuthGroup('');
        this._setNewAuthId(undefined);
    }

    reAuth()
    {
        this._isReAuth = true;
        this._authOutWithAuto();
    }

    _authOutWithAuto()
    {
        this._socket.deauthenticate((e) =>
        {
            if(e)
            {
                this._socket.disconnect();
            }
            else
            {
                this._socketIsAuthOut();
            }
        });
    }

    authOut()
    {
        this._isAuthOut = true;
        this._authOutWithAuto();
    }

    // noinspection JSUnusedGlobalSymbols
    async authIn(respond, authData)
    {
        if(authData !== undefined)
        {
            this._authData = authData;
        }
        else
        {
            authData = this._authData;
        }

        let data = ZationTools._buildAuthRequestData(authData, this._system, this._version);
        await this._emitZationRequest(data,respond);
        return this.isAuthIn();
    }

    //Part trigger RequestResponds

    _triggerRequestResponds(result)
    {
        this._requestResponds.forEach((respond) =>
        {
            respond._trigger(result);
        });
    }

    //Part Channel

    // noinspection JSUnusedGlobalSymbols
    registerUserChannel()
    {
        if(this._currentAuthId !== undefined)
        {
            this._registerZationChannel(ZationConst.CHANNEL_USER_CHANNEL_PREFIX,this._currentAuthId);
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    unregisterUserChannel()
    {
        if(this._currentAuthId !== undefined)
        {
            this._unregisterZationChannel(ZationConst.CHANNEL_USER_CHANNEL_PREFIX + this._currentAuthId);
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    registerAuthGroupChannel()
    {
        if(ZationTools._isAuthIn(this._currentAuthGroup))
        {
            this._registerZationChannel(ZationConst.CHANNEL_AUTH_GROUP_PREFIX, this._currentAuthGroup);
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    unregisterAuthGroupChannel()
    {
        if(ZationTools._isAuthIn(this._currentAuthGroup))
        {
            this._unregisterZationChannel(ZationConst.CHANNEL_AUTH_GROUP_PREFIX + this._currentAuthGroup);
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    registerDefaultGroupChannel()
    {
        if(!ZationTools._isAuthIn(this._currentAuthGroup))
        {
            this._registerZationChannel(ZationConst.CHANNEL_DEFAULT_GROUP);
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    unregisterDefaultGroupChannel()
    {
        if(!ZationTools._isAuthIn(this._currentAuthGroup))
        {
            this._unregisterZationChannel(ZationConst.CHANNEL_DEFAULT_GROUP);
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    registerAllChannel()
    {
        this._registerZationChannel(ZationConst.CHANNEL_ALL);
    }

    // noinspection JSUnusedGlobalSymbols
    unregisterAllChannel()
    {
        this._unregisterZationChannel(ZationConst.CHANNEL_ALL);
    }

    _registerZationChannel(channel,id = '')
    {
        let fullChannel = channel + id;
        this._socket.subscribe(fullChannel,{});

        let watcher = (input) =>
        {
            this._channelResponds.forEach((respond) =>
            {
                respond._trigger(
                    {
                        channel : channel,
                        isSpecial : false,
                        event : input['e'],
                        data : input['d']
                    });
            });
        };
        this._socket.unwatch(fullChannel);
        this._socket.watch(fullChannel,watcher);
    }

    _unregisterZationChannel(channel)
    {
        if(this._socket !== undefined && this._socket.isSubscribed(channel))
        {
            this._socket.destroyChannel(channel);
        }
    }

    //Part Special Channel

    // noinspection JSUnusedGlobalSymbols
    subscribeSpecialCh(channel,id)
    {
        let channelName = ZationConst.CHANNEL_SPECIAL_CHANNEL_PREFIX + channel + ZationConst.CHANNEL_SPECIAL_CHANNEL_ID + id;
        this._socket.subscribe(channelName);

        let watcher = (input) =>
        {
            this._channelResponds.forEach((respond) =>
            {
                respond._trigger(
                    {
                        channel : channel,
                        id : id,
                        isSpecial : true,
                        event : input['e'],
                        data : input['d']
                    });
            });
        };
        this._socket.unwatch(channelName);
        this._socket.watch(channelName,watcher);
    }

    // noinspection JSUnusedGlobalSymbols
    subscribeNewSpecialChannelId(channel,id)
    {
        this.unsubscribeSpecialCh(channel);
        this.subscribeSpecialCh(channel,id);
    }

    // noinspection JSUnusedGlobalSymbols
    isSubscribeSpecialCh(channel,id)
    {
        let channelName = ZationTools.getSpecialChannelName(channel,id);
        let subs = this._socket.subscriptions();
        let found = false;

        for(let i = 0; i < subs.length; i++)
        {
            if(subs[i].indexOf(channelName) !== -1)
            {
                found = true;
            }
        }
        return found;
    }

    // noinspection JSUnusedGlobalSymbols
    static getSpecialChannelName(channel,id)
    {
        let channelName = ZationConst.CHANNEL_SPECIAL_CHANNEL_PREFIX;

        if(channel !== undefined)
        {
            channelName+= id;
            if(id !== undefined)
            {
                channelName += ZationConst.CHANNEL_SPECIAL_CHANNEL_ID + id;
            }
        }

        return channelName;
    }

    // noinspection JSUnusedGlobalSymbols
    unsubscribeSpecialCh(channel,id)
    {
        let channelName = ZationTools.getSpecialChannelName(channel,id);

        let subs = this._socket.subscriptions();
        let isUnsubscribeAChannel = false;

        for(let i = 0; i < subs.length; i++)
        {
            if(subs[i].indexOf(channelName) !== -1)
            {
                this._socket.destroyChannel(subs[i]);
                isUnsubscribeAChannel = true;
            }
        }
        return isUnsubscribeAChannel;
    }

    //Part Main Config

    _readServerSettings()
    {
        // noinspection JSUnresolvedVariable
        if(ZATION_SERVER_SETTINGS !== undefined)
        {
            // noinspection JSUnresolvedVariable
            let zss = ZATION_SERVER_SETTINGS;

            if(zss['HOSTNAME'] !== undefined)
            {
                this._hostname = zss['HOSTNAME'];
            }

            if(zss['PORT'] !== undefined)
            {
                this._port = zss['PORT'];
            }

            if(zss['SECURE'] !== undefined)
            {
                this._secure = zss['SECURE'];
            }

            if(zss['POST_KEY_WORD'] !== undefined)
            {
                this._postKeyWord = zss['POST_KEY_WORD'];
            }
        }
    }

    _readSettings()
    {
        if (this._settings.debug !== undefined) {
            this._debug = this._settings.debug;
        }

        if (this._settings['autoReAuth'] !== undefined) {
            this._autoReAuth = this._settings['autoReAuth'];
        }

        if (this._settings._userChannelAutoRegistration !== undefined) {
            this._userChannelAutoRegistration = this._settings._userChannelAutoRegistration;
        }

        if (this._settings._authGroupChannelAutoRegistration !== undefined) {
            this._authGroupChannelAutoRegistration = this._settings._authGroupChannelAutoRegistration;
        }

        if (this._settings._defaultGroupChannelAutoRegistration !== undefined) {
            this._defaultGroupChannelAutoRegistration = this._settings._defaultGroupChannelAutoRegistration;
        }

        if (this._settings._allChannelAutoRegistration !== undefined) {
            this._allChannelAutoRegistration = this._settings._allChannelAutoRegistration;
        }

        if (this._settings['system'] !== undefined) {
            this._system = this._settings['system'];
        }

        if (this._settings.version !== undefined) {
            this._version = this._settings.version;
        }

        if (this._settings.hostname !== undefined)
        {
            this._hostname = this._settings.hostname;
        }

        if (this._settings['authData'] !== undefined)
        {
            this._authData = this._settings['authData'] ;
        }

        if (this._settings.path !== undefined) {
            this._path = this._settings.path;
        }

        if (this._settings.port !== undefined) {
            this._port = this._settings.port;
        }

        if (this._settings._postKeyWord !== undefined) {
            this._postKeyWord = this._settings._postKeyWord;
        }

        if (this._settings.secure !== undefined) {
            this._secure = this._settings.secure;
        }

        if (this._settings.rejectUnauthorized !== undefined) {
            this._rejectUnauthorized = this._settings.rejectUnauthorized;
        }

    }

    // noinspection JSUnusedGlobalSymbols
    getRejectUnauthorized()
    {
        return this._rejectUnauthorized;
    }

    // noinspection JSUnusedGlobalSymbols
    getSystem()
    {
        return this._system;
    };

    // noinspection JSUnusedGlobalSymbols
    getVersion()
    {
        return this._version;
    };

    // noinspection JSUnusedGlobalSymbols
    getHostname()
    {
        return this._hostname;
    };

    // noinspection JSUnusedGlobalSymbols
    getPort()
    {
        return this._port;
    };

    // noinspection JSUnusedGlobalSymbols
    getSecure()
    {
        return this._secure;
    };

    // noinspection JSUnusedGlobalSymbols
    getServerAddress()
    {
        return this._hostname + ':' + this._settings.port;
    };

    // noinspection JSUnusedGlobalSymbols
    isAutoReAuth()
    {
        return this._autoReAuth;
    };

    // noinspection JSUnusedGlobalSymbols
    disableAutoReAuth()
    {
        this._autoReAuth = false;
    }

    // noinspection JSUnusedGlobalSymbols
    enableAutoReAuth()
    {
        this._autoReAuth = true;
    }

    //Part Connection

    // noinspection JSUnusedGlobalSymbols
    _refreshChannelRegistration()
    {
        this.registerAllChannel();
        this.registerDefaultGroupChannel();
        this.registerUserChannel();
        this.registerAuthGroupChannel();
    }

    _emitReady()
    {
        if(this._isFirstStart)
        {
            this._isFirstStart = false;
            this._emitEvent('ready',this._socket);
        }
    }

    _buildOptions()
    {
        let options =   {
            hostname: this._hostname,
            port: this._port,
            secure: this._secure,
            rejectUnauthorized: this._rejectUnauthorized,
            autoReconnect: true,
            authTokenName : this._authTokenName
        };

        if(this._path !== '')
        {
            options.path = this._path;
        }

        return options;
    }

    _buildConnection()
    {
        // noinspection JSUnresolvedVariable
        this._socket = socketCluster.create(this._buildOptions());
        this._ConBackup = new ConBackup(this);

        this._socket.on('connect', async () => {

            this._emitEvent('connected',this._socket);

            if(this._reconnect)
            {
                await this._ConBackup.restoreBackup();
                this._reconnect = false;
            }
            else
            {
                if(this._allChannelAutoRegistration)
                {
                    this.registerAllChannel();
                }

                if(this._defaultGroupChannelAutoRegistration)
                {
                    this.registerDefaultGroupChannel();
                }

                if(this._autoStartAuth)
                {
                    this._socket.auth.loadToken(this._authTokenName,async (err,token) =>
                    {
                        if(token === undefined || token === null)
                        {
                            await this.authIn(this._authData);
                        }
                    });
                }
                else
                {
                    this._emitReady();
                }
            }
        });

        this._socket.on('authenticate',() => {

            this._emitEvent('authenticate',this._socket);
            this._updateAuthInfo(this._socket['authToken']);
            if(this._autoStartAuth)
            {
                this._emitReady();
            }

        });

        this._socket.on('deauthenticate',async () =>
        {
            this._socketIsAuthOut();
            if(!this._reconnect)
            {
                if(this._autoReAuth || this._isReAuth)
                {
                    this._isReAuth = false;

                    if(!this._isAuthOut)
                    {
                        await this.authIn();
                    }
                    else
                    {
                        this._isAuthOut = false;
                    }
                }
            }
        });

        this._socket.on('authTokenChange',() =>
        {
            this._updateAuthInfo(this._socket.authToken);
        });

        this._socket.on('zationBadAuthToken',async () =>
        {
            this._emitEvent('badAuthToken',this._socket);
        });

        this._socket.on('close',() =>
        {
            this._currentAuthId =  undefined;
            this._currentAuthGroup = '';
            this._reconnect = true;
            this._emitEvent('close',{});
        });

        this._socket.on('connectAbort',() =>
        {
            this._emitEvent('connectAbort',this._socket);
        });

        this._socket.on('disconnect',() =>
        {
            this._emitEvent('disconnect',this._socket);
        });

        this._socket.on('kickOut',(message, channelName) =>
        {
            if(channelName.indexOf(ZationConst.CHANNEL_SPECIAL_CHANNEL_PREFIX) !== -1)
            {
                this._emitEvent('kickOutFromSpecialChannel',channelName);
            }
        });
    }

    async send(request,reaction)
    {
        let data = await ZationTools._buildRequestData(request, this._system, this._version);
        return await this._emitZationRequest(data,reaction);
    };

    _emitZationRequest(data,reaction)
    {
        return new Promise((resolve, reject)=>
        {
            this._socket.emit('zationRequest',data,(err,res) =>
            {
                if(res !== undefined)
                {
                    let result = new Result(res);

                    if(typeof reaction === 'function')
                    {
                        reaction(result);
                    }
                    else if(reaction instanceof RequestRespond)
                    {
                        reaction._trigger(result);
                    }

                    resolve(result);
                    this._triggerRequestResponds(result);
                }
                else
                {
                    let err = new Event('No Result!');
                    reject(err);
                }
            });
        });
    }

    _sendHttpZationRequest(data,reaction)
    {
        return new Promise((resolve, reject) =>
        {
            let request = new XMLHttpRequest();
            let sendObj = {};
            sendObj[this._postKeyWord] = data;

            request.addEventListener("load", () =>
            {
                if(request.status >= 200
                    && request.status < 300
                    && request.responseText !== '')
                {
                    let result = new Result(request.responseText);
                    if(typeof reaction === 'function')
                    {
                        reaction(result);
                    }
                    else if(reaction instanceof RequestRespond)
                    {
                        reaction._trigger(result);
                    }

                    resolve(result);
                    this._triggerRequestResponds(result);
                }
                else
                {
                    let err = new Event('No Result!');
                    reject(err);
                }
            });

            request.addEventListener("error", (e) => {reject(e);});

            request.open('POST',this._hostname + this._path + ':' + this._port, true);
            request.setRequestHeader("Content-type", "applization/x-www-form-urlencoded");
            request.send(sendObj);
        });
    }
}

class ConBackup
{
    constructor(zation)
    {
        this._zation = zation;
        this._socket = this._zation._socket;
        this._wasAuthIn = false;
        this._oldChannels = {};

        this._inRestore = false;

        this._save = true;


        this._socket.on('close',() =>
        {
            if(!this._inRestore)
            {
                this._oldChannels = this._socket.channels;
            }
            this._socket.channels = {};
            this._save = false;
        });

        this._socket.on('authenticate',() =>
        {
            if(this._save)
            {
                this._wasAuthIn = true;
            }

            if(this._inRestore)
            {
                this._loadOldChannels();
                this._inRestore = false;
                this._save = true;
            }
        });

        this._socket.on('deauthenticate',() =>
        {
            if(this._save)
            {
                this._wasAuthIn = false;
            }
        });
    }

    _loadOldChannels()
    {
        for(let k in this._oldChannels)
        {
            if(this._oldChannels.hasOwnProperty(k))
            {
                this._socket.subscribe(k,{});
            }
        }
    }

    async restoreBackup()
    {
        this._inRestore = true;

        if(this._wasAuthIn)
        {
            await this._zation.authIn();
        }
        else
        {
            this._loadOldChannels();
            this._inRestore = false;
            this._save = true;
        }
    }
}


class ZationTools
{
    static _isAuthIn(authGroup)
    {
        return authGroup !== undefined && authGroup !== '';
    }

    static async _buildRequestData(request, system, version)
    {
        if (!(request instanceof Request))
        {
            request = new Request(request,{});
        }

        let taskBody = await request.getRequestObj();
        return {
            v: version,
            s: system,
            t: taskBody
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static _printWarning(txt)
    {
        console.error(`ZATION WARNING -> ${txt}`);
    }

    static _printInfo(txt)
    {
        console.log(`ZATION INFO -> ${txt}`);
    }

    static _buildAuthRequestData(authData, system, version)
    {
        return {
            v: version,
            s: system,
            a:
                {
                    p: authData
                }
        };
    }
}

//Part Const
class ZationConst {}
ZationConst.ERROR_TYP_SYSTEM_ERROR         = 'SYSTEM_ERROR';
ZationConst.ERROR_TYP_INPUT_ERROR          = 'INPUT_ERROR';
ZationConst.ERROR_TYP_VALIDATOR_ERROR      = 'VALIDATOR_ERROR';
ZationConst.ERROR_TYP_NORMAL_ERROR         = 'NORMAL_ERROR';
ZationConst.ERROR_TYP_AUTH_ERROR           = 'AUTH_ERROR';
ZationConst.ERROR_TYP_DATABASE_ERROR       = 'DATABASE_ERROR';
ZationConst.ERROR_TYP_COMPATIBILITY_ERROR  = 'COMPATIBILITY_ERROR';
ZationConst.ERROR_TYP_REACT                = 'REACT';

ZationConst.CHANNEL_USER_CHANNEL_PREFIX     = 'ZATION.USER.';
ZationConst.CHANNEL_AUTH_GROUP_PREFIX       = 'ZATION.AUTH_GROUP.';
ZationConst.CHANNEL_ALL                     = 'ZATION.ALL';
ZationConst.CHANNEL_DEFAULT_GROUP           = 'ZATION.DEFAULT_GROUP';
ZationConst.CHANNEL_SPECIAL_CHANNEL_PREFIX  = 'ZATION.SPECIAL_CHANNEL.';
ZationConst.CHANNEL_SPECIAL_CHANNEL_ID      = '.CH_ID.';

ZationConst.USER_CHANNEL_AUTH_OUT          = 'zationAuthOut';
ZationConst.USER_CHANNEL_RE_AUTH           = 'zationReAuth';

ZationConst.CLIENT_AUTH_GROUP              = 'zationAuthGroup';
ZationConst.CLIENT_AUTH_ID                 = 'zationAuthId';

ZationConst.SYSTEM_CONTROLLER_LOG_OUT      = 'zationSC_LogOut';
ZationConst.SYSTEM_CONTROLLER_PING         = 'zationSC_Ping';

class Result
{

    constructor(data)
    {
        this._successful = false;
        this._resultValues = [];
        this._resultKeyValuePairs = {};
        this._erros = [];
        this._newAuthData = {};

        this._newAuthDataBool = false;

        this._newAuthGroup = undefined;
        this._newAuthId = undefined;

        this._readData(data);
        this._buildNewAuthData();
    }


    // noinspection JSUnusedGlobalSymbols
    getValueResults()
    {
        return this._resultValues;
    }

    // noinspection JSUnusedGlobalSymbols
    getKeyValuePairResults()
    {
        return this._resultKeyValuePairs;
    }

    // noinspection JSUnusedGlobalSymbols
    getResultByKey(key)
    {
        return this._resultKeyValuePairs[key];
    }

    // noinspection JSUnusedGlobalSymbols
    hasResultWithKey(key)
    {
        return this._resultKeyValuePairs[key] !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    isSuccessful()
    {
        return this._successful;
    }

    // noinspection JSUnusedGlobalSymbols
    getNewAuthGroup()
    {
        return this._newAuthGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    getNewAuthId()
    {
        return this._newAuthId;
    }

    // noinspection JSUnusedGlobalSymbols
    hasNewAuthId()
    {
        return this._newAuthId !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    hasNewAuthGroup()
    {
        return this._newAuthGroup !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    getErrors()
    {
        return this._erros;
    }

    // noinspection JSUnusedGlobalSymbols
    hasErrors()
    {
        return this._erros.length > 0;
    }

    // noinspection JSUnusedGlobalSymbols
    hasNewAuthData()
    {
        return this._newAuthDataBool;
    }

    // noinspection JSUnusedGlobalSymbols
    getFirstResult()
    {
        return this._resultValues[0];
    }

    // noinspection JSUnusedGlobalSymbols
    hasFirstResultValue()
    {
        return this._resultValues[0] !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    getResultFromIndex(index)
    {
        return this._resultValues[index];
    }

    // noinspection JSUnusedGlobalSymbols
    hasResultWithIndex(index)
    {
        return this._resultValues[index] !== undefined;
    }

    _readData(data)
    {
        if (data.s !== undefined) {
            this._successful = data.s;
        }

        if (data.r !== undefined) {
            if (data.r.v !== undefined && Array.isArray(data.r.v)) {
                this._resultValues = data.r.v;
            }

            if (data.r.kv !== undefined && typeof data.r.kv === 'object') {
                this._resultKeyValuePairs = data.r.kv;
            }
        }

        if (data.a !== undefined && typeof data.a === 'object') {
            this._newAuthData = data.a;
        }

        if (data.e !== undefined && Array.isArray(data.e)) {
            this._erros = data.e;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    isErrorNameIn(name)
    {
        return Filter._getWhoHas(this._erros, name, 'n', Filter._filterEquals).length !== 0;
    }

    // noinspection JSUnusedGlobalSymbols
    isOneOfErrorNameIn(names)
    {
        return Filter._getWhoHasOneOf(this._erros, names, 'n', Filter._filterEquals).length !== 0;
    }

    // noinspection JSUnusedGlobalSymbols
    isErrorTypeIn(type)
    {
        return Filter._getWhoHas(this._erros, type, 't', Filter._filterEquals).length !== 0;
    }

    // noinspection JSUnusedGlobalSymbols
    isOneOfErrorTypeIn(types)
    {
        return Filter._getWhoHasOneOf(this._erros, types, 't', Filter._filterEquals) !== 0;
    }

    // noinspection JSUnusedGlobalSymbols
    getErrorWithName(name)
    {
        let res = undefined;
        for (let i = 0; i < this._erros.length; i++) {
            if (this._erros[i]['n'] === name) {
                res = this._erros[i];
                break;
            }
        }
        return res;
    }

    _buildNewAuthData()
    {
        if (this._newAuthData.hasOwnProperty('newAuthId')) {
            this._newAuthDataBool = true;
            this._newAuthId = this._newAuthData.newAuthId;
        }

        if (this._newAuthData.hasOwnProperty('newAuthGroup')) {
            this._newAuthDataBool = true;
            this._newAuthGroup = this._newAuthData.newAuthGroup;
        }
    }
}

//Part Responds

class Respond
{
    constructor()
    {
        this._active = true;
    }

    // noinspection JSUnusedGlobalSymbols
    activate()
    {
        this._active = true;
    }

    // noinspection JSUnusedGlobalSymbols
    deactivate()
    {
        this._active = false;
    }

    static _addJsonReactions(box,config)
    {
        if(config !== undefined && Array.isArray(config))
        {
            for(let i = 0; i < config.length; i++)
            {
                box.addItem(config,key,config['overwrite']);
            }
        }
        else if(config !== undefined && typeof config === 'object')
        {
            for(let key in config)
            {
                if(config.hasOwnProperty(key))
                {
                    box.addItem(config,key,config['overwrite']);
                }
            }
        }
    }

    _trigger(data)
    {
    };
}

class ChannelRespond extends Respond
{
    constructor(json)
    {
        super();
        //Reactions
        this._userChannelReactions = new Box(ChannelRespond._checkChannelValid);
        this._authGroupChannelReactions = new Box(ChannelRespond._checkChannelValid);
        this._allChannelReactions = new Box(ChannelRespond._checkChannelValid);
        this._defaultGroupChannelReactions = new Box(ChannelRespond._checkChannelValid);

        this._specialChannelReactions = new Box(ChannelRespond._checkSpecialChannelValid);

        if(json !== undefined)
        {
            this.addReactions(json);
        }
    }

    static _checkChannelValid(config)
    {
        return config['event'] !== undefined && config['reaction'] !== undefined;
    }

    static _checkSpecialChannelValid(config)
    {
        return config['reaction'] !== undefined;
    }

    addReactions(json)
    {
        if(json['onUserCh'] !== undefined)
        {
            Respond._addJsonReactions(this._userChannelReactions,json['onUserCh']);
        }
        if(json['onAuthGroupCh'] !== undefined)
        {
            Respond._addJsonReactions(this._authGroupChannelReactions,json['onAuthGroupCh']);
        }
        if(json['onDefaultAuthGroupCh'] !== undefined)
        {
            Respond._addJsonReactions(this._defaultGroupChannelReactions,json['onDefaultGroupCh']);
        }
        if(json['onAllCh'] !== undefined)
        {
            Respond._addJsonReactions(this._allChannelReactions,json['onAllCh']);
        }
        if(json['onSpecialCh'] !== undefined)
        {
            Respond._addJsonReactions(this._specialChannelReactions,json['onSpecialCh'],true);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    onUserCh(event,reaction,key = undefined,overwrite = true)
    {
        return this._userChannelReactions.addItem({event : event,reaction : reaction},key,overwrite);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnUserCh(key)
    {
        return this._userChannelReactions.removeItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    onAuthGroupCh(event,reaction,key,overwrite = true)
    {
        return this._authGroupChannelReactions.addItem({event : event,reaction : reaction},key,overwrite);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnAuthGroupCh(key)
    {
        return this._authGroupChannelReactions.removeItem(key)
    }

    // noinspection JSUnusedGlobalSymbols
    onDefaultGroupCh(event,reaction,key,overwrite = true)
    {
        return this._defaultGroupChannelReactions.addItem({event : event,reaction : reaction},key,overwrite);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnDefaultAuthGroupCh(key)
    {
        return this._defaultGroupChannelReactions.removeItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    onAllCh(event,reaction,key,overwrite = true)
    {
        return this._allChannelReactions.addItem({event : event,reaction : reaction},key,overwrite);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnAllCh(key)
    {
        return this._allChannelReactions.removeItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    onSpecialCh(filter,reaction,key,overwrite = true)
    {
        return this._specialChannelReactions.addItem({filter : filter,reaction : reaction},key,overwrite);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnSpecialCh(key)
    {
        return this._specialChannelReactions.removeItem(key);
    }

    static _triggerReaction({reaction,channel,id,event,isSpecial,data})
    {
        if(typeof reaction === 'function')
        {
            reaction(data);
        }
        else if(reaction instanceof ChannelRespond)
        {
            reaction._trigger({channel : channel, event : event, isSpecial : isSpecial, data : data, id : id});
        }
    }

    static _triggerChannelReactions(box,event,channel,data)
    {
        box.forEach((respond) => {

            if(respond['event'] !== undefined && respond['event'] === event
                && respond['reaction'] !== undefined)
            {
                ChannelRespond._triggerReaction(
                    {reaction : respond['reaction'],channel : channel,event : event,isSpecial : false,data : data});
            }
        });
    }

    static _isFilteredSpecialRespond(filter,channel,event,id)
    {
        if(filter !== undefined)
        {
            if(filter['channel'] !== undefined
                && filter['channel'] !== channel)
            {
                return false;
            }

            if(filter['id'] !== undefined
                && filter['id'] !== id)
            {
                return false;
            }

            if(filter['event'] !== undefined
                && filter['event'] !== event)
            {
                return false;
            }
        }

        return true;
    }

    static _triggerSpecialChannelReactions(box,channel,event,id,data)
    {
        box.forEach((respond) => {

            if(respond['reaction'] !== undefined &&
                ChannelRespond._isFilteredSpecialRespond(respond['filter'],channel,event,id))
            {
                ChannelRespond._triggerReaction(
                    {
                        reaction : respond['reaction'] ,
                        channel : channel,
                        event : event,
                        data : data,
                        id : id,
                        isSpecial : true
                    });
            }
        });
    }

    _trigger({channel,event,id,isSpecial,data})
    {
        if(this._active)
        {
            if (isSpecial) {
                ChannelRespond._triggerSpecialChannelReactions(this._specialChannelReactions, channel, event, id, data);
            }
            else {
                if (channel === ZationConst.CHANNEL_USER_CHANNEL_PREFIX) {
                    ChannelRespond._triggerChannelReactions(this._userChannelReactions, event, channel, data);
                }
                else if (channel === ZationConst.CHANNEL_AUTH_GROUP_PREFIX) {
                    ChannelRespond._triggerChannelReactions(this._authGroupChannelReactions, event, channel, data);
                }
                else if (channel === ZationConst.CHANNEL_ALL) {
                    ChannelRespond._triggerChannelReactions(this._allChannelReactions, event, channel, data);
                }
                else if (channel === ZationConst.CHANNEL_DEFAULT_GROUP) {
                    ChannelRespond._triggerChannelReactions(this._defaultGroupChannelReactions, event, channel, data);
                }
            }
        }
    }
}

class RequestRespond extends Respond
{
    constructor(json)
    {
        super();

        //Reactions
        this._onErrorReactions = new Box(RequestRespond._checkOnReactionValid);
        this._onSuccesfulReactions = new Box(RequestRespond._checkOnReactionValid);
        this._onBothReactions = new Box(RequestRespond._checkOnReactionValid);
        this._onAuthDataReactions = new Box(RequestRespond._checkOnReactionValid);

        if(json !== undefined)
        {
            this.addReactions(json);
        }
    }

    static _checkOnReactionValid(config)
    {
        return config['reaction'] !== undefined;
    }

    addReactions(json)
    {
        if(json['onError'] !== undefined)
        {
            Respond._addJsonReactions(this._onErrorReactions,json['onError']);
        }
        if(json['onSuccessful'] !== undefined)
        {
            Respond._addJsonReactions(this._onErrorReactions,json['onSuccessful']);
        }
        if(json['onBoth'] !== undefined)
        {
            Respond._addJsonReactions(this._onErrorReactions,json['onBoth']);
        }
    }

    _trigger(result)
    {
        if (this._active && result instanceof Result)
        {

            if(result.hasNewAuthData())
            {
                this._onAuthDataReactions.forEach((reaction) => {
                    RequestRespond._triggerReaction(reaction,result);
                });
            }

            this._onBothReactions.forEach((reaction) => {RequestRespond._triggerReaction(reaction,result);});

            if (result.isSuccessful())
            {
                RequestRespond._triggerOnSuccessfulReactions(this._onSuccesfulReactions,result);
            }
            else
            {
                RequestRespond._triggerOnErrorReactions(this._onErrorReactions,result);
            }
        }
    }

    static _triggerOnSuccessfulReactions(box,result)
    {
        box.forEach((reaction) => {

            if(RequestRespond._filterForSuccessfulReaction(reaction,result))
            {
                RequestRespond._triggerReaction(reaction,result);
            }
        });
    }

    static _triggerOnErrorReactions(box,result)
    {
        box.forEach((reaction) => {

            let res = RequestRespond._filterForErrorReaction(reaction,result);
            if(res.length > 0)
            {
                RequestRespond._triggerReaction(reaction,result,res,true);
            }

        });
    }

    static _triggerReaction(reaction,res,res2,onError = false)
    {
        let reactionObj = reaction.reaction;
        if (typeof reactionObj === "function")
        {
            reactionObj(res,res2);
        }
        else if(reactionObj instanceof RequestRespond)
        {
            if(onError)
            {
                reactionObj._trigger(RequestRespond._getFilteredResult(res2));
            }
            else
            {
                reactionObj._trigger(res);
            }
        }
    }

    static _getFilteredResult(filterErr)
    {
        let data = {};
        data.s = false;
        data.e = filterErr;
        return new Result(data);
    }

    static _filterForSuccessfulReaction(reaction, result)
    {
        let resultData = {};
        resultData.v = result.getValueResults();
        resultData.kv = result.getKeyValuePairResults();
        resultData = [resultData];

        let filter = reaction.filter;

        if (filter !== undefined)
        {

            if (filter['pair'] !== undefined || filter['pairs'] !== undefined)
            {
                let input = filter['pair'] !== undefined ? filter['pair'] : filter['pairs'];
                let res = Filter._getWithOneOrMultiOr(resultData,input,'kv',Filter._filterAllParamsSame);

                if(res.length === 0) {return false;}
            }

            if (filter['pairKey'] !== undefined || filter['pairKeys'] !== undefined)
            {
                let input = filter['pairKey'] !== undefined ? filter['pairKey'] : filter['pairKeys'];
                let res = Filter._getWithOneOrMultiOr(resultData, input, 'kv',Filter._filterOneOrMultiAndKey);

                if(res.length === 0) {return false;}
            }

            if (filter['pairValue'] !== undefined || filter['pairValues'] !== undefined)
            {
                let input = filter['pairValue'] !== undefined ? filter['pairValue'] : filter['pairValues'];
                let res = Filter._getWithOneOrMultiOr(resultData, input, 'kv',Filter._filterOneOrMultiAndValue);

                if(res.length === 0) {return false;}
            }

            if (filter['value'] !== undefined || filter['values'] !== undefined)
            {
                let input = filter['value'] !== undefined ? filter['value'] : filter['values'];
                let res = Filter._getWithOneOrMultiOr(resultData, input, 'v',Filter._filterOneOrMultiAndArray);

                if(res.length === 0) {return false;}
            }

        }

        return true;
    }

    static _filterForErrorReaction(reaction, result)
    {
        let filterObj = result.getErrors();
        let filter = reaction.filter;

        if (filter !== undefined) {

            if (filter['name'] !== undefined || filter['names'] !== undefined)
            {
                let input = filter['name'] !== undefined ? filter['name'] : filter['names'];
                filterObj = Filter._getWithOneOrMultiOr(filterObj, input, 'n');
            }

            if (filter['type'] !== undefined || filter['types'] !== undefined)
            {
                let input = filter['type'] !== undefined ? filter['type'] : filter['types'];
                filterObj = Filter._getWithOneOrMultiOr(filterObj, input, 't');
            }

            if (filter['info'] !== undefined)
            {
                filterObj = Filter._getWithOneOrMultiOr(filterObj,filter['info'],'i',Filter._filterAllParamsSame);
            }

            if (filter['infoKey'] !== undefined || filter['infoKeys'] !== undefined)
            {
                let input = filter['infoKey'] !== undefined ? filter['infoKey'] : filter['infoKeys'];
                filterObj = Filter._getWithOneOrMultiOr(filterObj, input, 'i',Filter._filterOneOrMultiAndKey);
            }

            if (filter['infoValue'] !== undefined || filter['infoValues'] !== undefined)
            {
                let input = filter['infoValue'] !== undefined ? filter['infoValue'] : filter['infoValues'];
                filterObj = Filter._getWithOneOrMultiOr(filterObj, input, 'i',Filter._filterOneOrMultiAndValue);
            }
        }
        return filterObj;
    }

    // noinspection JSUnusedGlobalSymbols
    onAuthData(reaction, key, overwrite = true)
    {
        return RequestRespond.addReaction(reaction,undefined,key,overwrite, this._onAuthDataReactions);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnAuthData(key)
    {
        return this._onAuthDataReactions.removeItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    onError(reaction, filter, key, overwrite = true)
    {
        return RequestRespond.addReaction(reaction, filter, key, overwrite, this._onErrorReactions);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnError(key)
    {
        return this._onBothReactions.removeItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    onBoth(reaction, key, overwrite = true)
    {
        return RequestRespond.addReaction(reaction, undefined, key, overwrite, this._onBothReactions);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnBoth(key)
    {
        return this._onBothReactions.removeItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    onSuccessful(reaction, filter, key, overwrite = true)
    {
        return RequestRespond.addReaction(reaction, filter, key, overwrite, this._onSuccesfulReactions);
    }

    // noinspection JSUnusedGlobalSymbols
    removeOnSuccessful(key)
    {
        return this._onSuccesfulReactions.removeItem(key);
    }

    // noinspection JSUnusedGlobalSymbols
    removeFromAll(key)
    {
        this._onBothReactions.removeItem(key);
        this._onSuccesfulReactions.removeItem(key);
        this._onErrorReactions.removeItem(key);
    }


    static addReaction(reaction, filter, key, overwrite, box)
    {
        let storageReaction = {reaction: reaction, filter: filter};
        return box.addItem(storageReaction,key,overwrite);
    }
}

class Box
{
    constructor(validator = () => {return true;})
    {
        this._validator = validator;
        this._itemsWithKey = {};
        this._items = [];
        this._fixedItems = [];
    }

    // noinspection JSUnusedGlobalSymbols
    forEach(func)
    {
        for(let i = 0; i < this._fixedItems.length; i++)
        {
            func(this._fixedItems[i]);
        }

        for(let i = 0; i < this._items.length; i++)
        {
            func(this._items[i]);
        }

        for(let k in this._itemsWithKey)
        {
            if(this._itemsWithKey.hasOwnProperty(k))
            {
                func(this._itemsWithKey[k]);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    addItem(item,key,overwrite = true)
    {
        if(key !== undefined)
        {
            return this.addKeyItem(key,item,overwrite);
        }
        else
        {
            return this.addIndexItem(item)
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeItem(key)
    {
        if(Number.isInteger(key))
        {
            return this.removeIndexItem(key);

        }
        else
        {
            return this.removeKeyItem(key);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    getItem(key)
    {
        if(Number.isInteger(key))
        {
            return this.getIndexItem(key);

        }
        else
        {
            return this.getKeyItem(key);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    addFixedItem(item)
    {
        if(this._validator(item))
        {
            return this._fixedItems.push(item) -1;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    getFixedItem(index)
    {
        return this._fixedItems[index];
    }

    // noinspection JSUnusedGlobalSymbols
    removeAllItems()
    {
        this._items = [];
        this._itemsWithKey = {};
    }

    getIndexItem(index)
    {
        if(index < this._items.length)
        {
            return this._items[index];
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeIndexItem(index)
    {
        if(index < this._items.length)
        {
            this._items = this._items.splice(index,1);
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    addIndexItem(item)
    {
        if(this._validator(item))
        {
            return this._items.push(item) -1;
        }
        else
        {
            return false;
        }
    }

    getKeyItem(key)
    {
        return this._itemsWithKey[key];
    }

    // noinspection JSUnusedGlobalSymbols
    removeKeyItem(key)
    {
        if(this._itemsWithKey.hasOwnProperty(key))
        {
            delete this._itemsWithKey[key];
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    addKeyItem(key,item,overwrite = true)
    {
        if(this._validator(item))
        {
            if((this._itemsWithKey.hasOwnProperty(key) && overwrite) ||
                !this._itemsWithKey.hasOwnProperty(key))
            {
                this._itemsWithKey[key] = item;
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
}

class Request
{
    constructor(controller, params)
    {
        this._controller = controller;
        this._params = params;
    }

    static _readParam(param,howToAdd)
    {
        return new Promise(async (resolve) =>
        {
            if(param instanceof  RequestAble)
            {
                howToAdd(await param.getJson());
                resolve();
            }
            else
            {
                howToAdd(param);
                resolve();
            }
        });
    }

    async getRequestObj()
    {
        let json = {c: this._controller};
        let params = undefined;
        let promises = [];

        if(Array.isArray(this._params))
        {
            params = [];
            for(let i = 0; i < this._params.length; i++)
            {
                promises.push(Request._readParam(this._params[i], (p) =>
                    {
                        params.push(p);
                    }
                ));
            }
        }
        else
        {
            params = {};
            for(let k in this._params)
            {
                if(this._params.hasOwnProperty(k))
                {
                    promises.push(Request._readParam(this._params[k], (p) =>
                        {
                            params[k] = p;
                        }
                    ));
                }
            }
        }

        await Promise.all(promises);
        json['p'] = params;
        return json;
    }
}

class RequestAble
{
    // noinspection JSMethodCanBeStatic
    getJson()
    {
        return {};
    };

}

class Filter
{
    static _filterEquals(v1, v2)
    {
        return v1 === v2;
    }

    static _filterOneOrMultiAndValue(v1, v2)
    {
        if(Array.isArray(v2))
        {
            for(let i = 0; i < v2.length; i++)
            {
                if(! Filter._objectHasValue(v1,v2[i]))
                {
                    return false;
                }
            }
            return true;
        }
        else
        {
            return Filter._objectHasValue(v1,v2);
        }
    }

    static _objectHasValue(obj,value)
    {
        for(let k in obj)
        {
            if(obj.hasOwnProperty(k) && obj[k] === value)
            {
                return true;
            }
        }
        return false;
    }

    static _filterOneOrMultiAndKey(v1, v2)
    {
        if(Array.isArray(v2))
        {
            for(let i = 0; i < v2.length; i++)
            {
                if(!v1.hasOwnProperty(v2[i]))
                {
                    return false;
                }
            }
            return true;
        }
        else
        {
            return v1.hasOwnProperty(v2);
        }
    }

    static _filterOneOrMultiAndArray(v1, v2)
    {
        if(Array.isArray(v2))
        {
            for(let i = 0; i < v2.length; i++)
            {
                if(!v1.includes(v2[i]))
                {
                    return false;
                }
            }
            return true;
        }
        else
        {
            return v1.includes(v2);
        }
    }

    static _filterAllParamsSame(v1, v2)
    {
        for (let k in v2) {
            if (v2.hasOwnProperty(k)) {
                if(!(v1.hasOwnProperty(k) &&
                    v2[k] === v1[k]))
                {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return true;
    }

    static _getWithOneOrMultiOr(array, input, prop, filter = Filter._filterEquals)
    {
        let res = [];
        if(Array.isArray(input))
        {
            res = Filter._getWhoHasOneOf(array,input,prop,filter);
        }
        else
        {
            res = Filter._getWhoHas(array,input,prop,filter);
        }
        return res;
    }

    static _getWhoHas(array, value, prop, filter = Filter._filterEquals)
    {
        let filterObj = [];
        for (let i = 0; i < array.length; i++) {
            if (filter(array[i][prop], value)) {
                filterObj.push(array[i]);
            }
        }
        return filterObj;
    }

    static _getWhoHasOneOf(array, values, prop, filter = Filter._filterEquals)
    {
        let filterObj = [];
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < values.length; j++) {
                if (filter(array[i][prop], values[j])) {
                    filterObj.push(array[i]);
                    break;
                }
            }
        }
        return filterObj;
    }

    // noinspection JSUnusedGlobalSymbols
    static _getWhoHasAllOf(array, values, prop, filter = Filter._filterEquals)
    {
        let filterObj = [];
        for (let i = 0; i < array.length; i++) {
            let allFound = true;
            for (let j = 0; j < values.length; j++) {
                if (!filter(array[i][prop], values[j])) {
                    allFound = false;
                    break;
                }
            }
            if (allFound) {
                filterObj.push(array[i]);
            }
        }
        return filterObj;
    }
}

//Exports
if(typeof exports==="object"&&typeof module!=="undefined")
{
    module.exports.version = '1.0.0';
    module.exports.Zation = Zation;
    module.exports.ZationHttp   = ZationHttp;
    module.exports.RequestRespond = RequestRespond;
    module.exports.ChannelRespond = ChannelRespond;
    module.exports.Result = Result;
    module.exports.Box = Box;
}

//WebApi

class ZationFile extends RequestAble
{
    constructor(file)
    {
        super();
        this._file = file;
    }

    getJson()
    {
        return new Promise((resolve, reject) =>
        {
            if(this._file instanceof File)
            {
                let fileReader = new FileReader();
                // noinspection SpellCheckingInspection
                fileReader.onloadend = () => {
                    let file =
                        {
                            name: this._file.name,
                            size: this._file.size,
                            lastModified: this._file.lastModified,
                            type: this._file.type,
                            data: fileReader.result
                        };

                    console.log(file);

                    resolve(file);
                };

                // noinspection SpellCheckingInspection
                fileReader.onerror = () => {
                    reject();
                };

                fileReader.readAsArrayBuffer(this._file);
            }
            else
            {
                reject();
            }
        })
    }
}


//SOCKET CLUSTER DATA
