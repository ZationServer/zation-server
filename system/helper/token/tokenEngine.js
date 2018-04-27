/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TokenTools     = require('./tokenTools');
const Const          = require('../constante/constWrapper');
const ChAccessEngine = require('./../channel/chAccessEngine');

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
        let defaultExp = this._zc.getMain(Const.Main.AUTH_DEFAULT_EXPIRY);
        return Math.floor(Date.now() / 1000) +  defaultExp;
    }

    //to create a new Token
    async createToken(data)
    {
        if(this._zc.isExtraSecureAuth())
        {
            let expiry = this._generateExpiry();
            let tokenId = await this._worker.getTokenInfoStorage().createTokenInfo(expiry,data[Const.Settings.CLIENT_AUTH_ID]);
            data['exp'] = expiry;
            data[Const.Settings.CLIENT_TOKEN_ID] = tokenId;
        }

        return TokenTools.createNewToken(data,this._shBridge.getTokenBridge(),this._zc);
    }

    //For update the token
    async setTokenVariable(data,zationAllow = false)
    {
        if(zationAllow)
        {
            return await TokenTools.setZationData(data,this._shBridge.getTokenBridge(),this,this._zc);
        }
        else
        {
            return await TokenTools.setTokenVariable(data,this._shBridge.getTokenBridge(),this._zc);
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
            let tokenId = token[Const.Settings.CLIENT_TOKEN_ID];
            let authId  = token[Const.Settings.CLIENT_AUTH_ID];
            await this._worker.getTokenInfoStorage().blockToken(tokenId,authId);
        }
        this._shBridge.deauthenticate();

        if(this._shBridge.isSocket())
        {
            ChAccessEngine.checkSocketSpecialChAccess(this._shBridge.getSocket(),this._zc);
            ChAccessEngine.checkSocketZationChAccess(this._shBridge.getSocket(),this._zc);
        }
    }

    getWorker()
    {
        return this._worker;
    }
}

module.exports = TokenEngine;