/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constante/constWrapper');
const TaskError        = require('../../api/TaskError');
const MainErrors       = require('../zationTaskErrors/mainTaskErrors');
const TokenBridge      = require('../bridges/tokenBridge');
const ChAccessEngine   = require('../channel/chAccessEngine');
const Jwt              = require('jsonwebtoken');
const TokenInfoStorage = require('./tokenInfoStorage');

class TokenTools
{
    static async _changeToken(data,tokenBridge,ignoreZationKeys = false,updateOnly = true)
    {
        let suc = false;

        let setToken = async () =>
        {
            let token = tokenBridge.getToken();

            if((token !== undefined && token !== null) || (!updateOnly))
            {
                await tokenBridge.setToken(TokenTools._bringAuthTokenTogether(token,data));

                if(tokenBridge.isSocket())
                {
                    ChAccessEngine.checkSocketSpecialChAccess(tokenBridge.getSocket());
                }

                suc = true;
            }

        };

        if(data !== undefined)
        {
            if(ignoreZationKeys)
            {
                await setToken();

                if(tokenBridge.isSocket())
                {
                    ChAccessEngine.checkSocketZationChAccess(tokenBridge.getSocket());
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
                await setToken();
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

    static getSocketTokenVariable(key,socket)
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

    static async setTokenVariable(data,tokenBridge)
    {
        return await TokenTools._changeToken(data,tokenBridge);
    }

    static async setZationData(data,tokenBridge,tokenEngine)
    {
        let oldToken = tokenBridge.getToken();
        let suc = await TokenTools._changeToken(data,tokenBridge,true);
        if(suc)
        {
            TokenInfoStorage.

        }
        return suc;
    }

    static async verifyToken(token,zc)
    {
        return new Promise((resolve, reject) =>
        {
            let algorithm = zc.getMain(Const.Settings.AUTH_ALGORITHM);

            Jwt.verify(token,zc.getVerifyKey(),{algorithm : algorithm},(err,decoded) =>
            {
                if(err)
                {
                    if(err.name === 'TokenExpiredError')
                    {
                        reject(new TaskError(MainErrors.tokenExpiredError,{expiredAt : err.expiredAt}))
                    }
                    else if(err.name === 'JsonWebTokenError')
                    {
                        reject(new TaskError(MainErrors.jsonWebTokenError,err))
                    }
                    else
                    {
                        reject(new TaskError(MainErrors.unknownTokenVerifyError,err))
                    }
                }
                else
                {
                    resolve(decoded);
                }
            });
        });
    }

}

module.exports = TokenTools;