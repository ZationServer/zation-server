/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TokenTools     = require('./tokenTools');
const Const          = require('../constants/constWrapper');
const ChAccessEngine = require('../channel/chAccessEngine');

class TokenEngine
{
    constructor(shBridge,worker,zc)
    {
        this._shBridge = shBridge;
        this._worker = worker;
        this._zc = zc;
    }

    _generateExpiry()
    {
        let defaultExp = this._zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY);
        return Math.floor(Date.now() / 1000) +  defaultExp;
    }

    //to create a new Token
    async createToken(data)
    {
        if(this._zc.isUseTokenInfoTempDb())
        {
            let expiry = this._generateExpiry();
            let remoteAddress = this._shBridge.getPublicRemoteAddress();
            let tempDbUp = this._worker.getTempDbUp();

            let userId = data[Const.Settings.CLIENT.USER_ID];
            let authUserGroup = data[Const.Settings.CLIENT.AUTH_USER_GROUP];

            let tokenId = await tempDbUp.createTokenInfo(expiry,remoteAddress,authUserGroup,userId);

            data[Const.Settings.CLIENT.EXPIRE] = expiry;
            data[Const.Settings.CLIENT.TOKEN_ID] = tokenId;
        }

        return TokenTools.createNewToken(data,this._shBridge.getTokenBridge(),this._worker);
    }

    //For update the token
    async setTokenVariable(data,zationAllow = false)
    {
        if(zationAllow)
        {
            return await TokenTools.setZationData(data,this._shBridge.getTokenBridge(),this,this._worker);
        }
        else
        {
            return await TokenTools.setTokenVariable(data,this._shBridge.getTokenBridge(),this._worker);
        }
    }

    //getATokenVariable
    getTokenVariable(key)
    {
        return TokenTools.getTokenVariable(key,this._shBridge.getTokenBridge());
    }

    async deauthenticate(token)
    {
        if(this._zc.isExtraSecureAuth())
        {
            let tokenId = token[Const.Settings.CLIENT.TOKEN_ID];
            await this._worker.getTempDbUp().blockTokenId(tokenId);
        }
        this._shBridge.deauthenticate();

        if(this._shBridge.isWebSocket())
        {
            ChAccessEngine.checkSocketCustomChAccess(this._shBridge.getSocket(),this._worker);
            ChAccessEngine.checkSocketZationChAccess(this._shBridge.getSocket(),this._worker);
        }
    }

    getWorker()
    {
        return this._worker;
    }
}

module.exports = TokenEngine;