const Const             = require('../helper/constante/constWrapper');

class ZationConfig
{
    constructor(starterConfig,debug)
    {
        this._debug = debug;
        this._eventConfig   = {};
        this._appConfig     = {};
        this._channelConfig = {};
        this._errorConfig   = {};
        this._mainConfig    = {};

        //Create Defaults
        this._mainConfig[Const.Main.PORT] = process.env.PORT || 3000;
        this._mainConfig[Const.Main.POST_KEY_WORD] = 'zation';
        this._mainConfig[Const.Main.USE_AUTH] = true;
        this._mainConfig[Const.Main.APP_NAME] = 'AppWithoutName';
        this._mainConfig[Const.Main.SECURE] = false;
        this._mainConfig[Const.Main.USE_SOCKET_SERVER] = true;
        this._mainConfig[Const.Main.USE_HTTP_SERVER] = true;
        this._mainConfig[Const.Main.USE_PROTOCOL_CHECK] = true;
        this._mainConfig[Const.Main.SEND_ERRORS_DESC] = false;
        this._mainConfig[Const.Main.AUTH_KEY] = crypto.randomBytes(32).toString('hex');
    }

    isDebug()
    {
        return this._debug;
    }

    addToMainConf(addConf)
    {
        
    }


}

module.exports = ZationConfig;