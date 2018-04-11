/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const         = require('../constante/constWrapper');
const TaskError     = require('../../api/TaskError');
const MainErrors      = require('../zationTaskErrors/mainTaskErrors');
const TokenBridge   = require('../bridges/tokenBridge');
const ChEngine      = require('../channel/channelEngine');

class TokenTools
{
    static _changeToken(data,tokenBridge,ignoreZationKeys = false,updateOnly = true)
    {
        let suc = false;

        let setToken = () =>
        {
            let token = tokenBridge.getToken();

            if((token !== undefined && token !== null) || (!updateOnly))
            {
                tokenBridge.setToken(TokenTools._bringAuthTokenTogether(token,data));

                if(tokenBridge.isSocket())
                {
                    ChEngine.checkSocketSpecialChAccess(tokenBridge.getSocket());
                }

                suc = true;
            }

        };

        if(data !== undefined)
        {
            if(ignoreZationKeys)
            {
                setToken();

                if(tokenBridge.isSocket())
                {
                    ChEngine.checkSocketZationChAccess(tokenBridge.getSocket());
                }
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT_AUTH_GROUP))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.CLIENT_AUTH_GROUP});
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT_AUTH_ID))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.CLIENT_AUTH_ID});
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT_TOKEN_ID))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.CLIENT_TOKEN_ID});
            }
            else
            {
                setToken();
            }
        }
        return suc;
    }

    static _bringAuthTokenTogether(token,newData)
    {
        if(token === null)
        {
            return newData;
        }
        else
        {
            for(let k in newData)
            {
                if(newData.hasOwnProperty(k))
                {
                    token[k] = newData[k];
                }
            }
            return token;
        }
    }

    //ClientData
    static getTokenVariable(key,tokenBridge)
    {
        if(tokenBridge.tokenIsThere())
        {
            return tokenBridge.getToken()[key];
        }
        else
        {
            return undefined;
        }
    }

    static  getSocketTokenVariable(key,socket)
    {
        // noinspection JSUnresolvedFunction
        let token = socket.getAuthToken();

        if(token !== undefined)
        {
            return token[key];
        }
        else
        {
            return undefined;
        }
    }

    static setTokenVariable(data,tokenBridge)
    {
        return TokenTools._changeToken(data,tokenBridge);
    }

    static setSocketTokenVariable(data,socket)
    {
        return TokenTools._changeToken(data,new TokenBridge(true,socket));
    }

    static setZationData(data,tokenBridge,tokenEngine)
    {
        let oldToken = tokenBridge.getToken();
        let suc = TokenTools._changeToken(data,tokenBridge,true);
        if(suc) {
            tokenEngine.changedToken(oldToken, tokenBridge.getToken());
        }
        return suc;
    }

    static createToken(data,tokenBridge,tokenEngine)
    {
        let suc = TokenTools._changeToken(data,tokenBridge,true,false);
        if(suc)
        {
            tokenEngine.registerToken(tokenBridge.getToken());
        }
        return suc;
    }

    static verifyToken(signedToken,zc)
    {

    }

    static signToken(token, key, options, callback)
    {


    }

}

module.exports = TokenTools;