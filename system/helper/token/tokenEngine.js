/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TokenTools    = require('./tokenTools');
const Const         = require('../constante/constWrapper');

class TokenEngine
{
    constructor(hsBridge,zc)
    {
        this._hsBridge = hsBridge;
        this._zc = zc;
    }

    //to create a new Token
    createToken()
    {

    }

    //For update the token
    setTokenVariable(data,zationAllow = false)
    {
        TokenTools.setTokenVariable(data,this._hsBridge.getTokenBridge());
    }

    //getATokenVariable
    getTokenVariable(key)
    {
        TokenTools.getTokenVariable(key,this._hsBridge.getTokenBridge());
    }

    //
    static getSocketTokenVariable(key,socket)
    {

    }


}

module.exports = TokenEngine;