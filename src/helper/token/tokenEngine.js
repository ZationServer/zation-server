/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TokenTools     = require('./tokenTools');
const Const          = require('../constants/constWrapper');
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
        if(this._zc.isUseErrorInfoTempDb())
        {
            let expiry = this._generateExpiry();
            let remoteAddress = this._shBridge.getPublicRemoteAddress();
            let tempDbUp = this._worker.getTempDbUp();

            let authId = data[Const.Settings.CLIENT_AUTH_ID];
            let authGroup = data[Const.Settings.CLIENT_AUTH_GROUP];

            let tokenId = await tempDbUp.createTokenInfo(expiry,remoteAddress,authGroup,authId);

            data[Const.Settings.CLIENT_EXPIRE] = expiry;
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
            await this._worker.getTempDbUp().blockTokenId(tokenId);
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