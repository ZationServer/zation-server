/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TokenTools    = require('./tokenTools');
const Const         = require('../constante/constWrapper');

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
        let expiry = this._generateExpiry();
        let tokenId = await this._worker.getTokenInfoStorage().createTokenInfo(expiry,data[Const.Settings.CLIENT_AUTH_ID]);
        data['exp'] = expiry;
        data[Const.Settings.CLIENT_TOKEN_ID] = tokenId;
        this._shBridge.getTokenBridge().setToken(data);
    }

    //For update the token
    async setTokenVariable(data,zationAllow = false)
    {
        if(zationAllow)
        {
            TokenTools.setZationData(data,this._shBridge,this);
        }
        await TokenTools.setTokenVariable(data,this._shBridge.getTokenBridge());
    }

    //getATokenVariable
    getTokenVariable(key)
    {
        TokenTools.getTokenVariable(key,this._shBridge.getTokenBridge());
    }

    //
    static getSocketTokenVariable(key,socket)
    {

    }


}

module.exports = TokenEngine;