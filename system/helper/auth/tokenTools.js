/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Jwt           = require('jsonwebtoken');
const Const         = require('../constante/constWrapper');
const TaskError     = require('../../api/TaskError');
const SyErrors      = require('../zationTaskErrors/systemTaskErrors');

class TokenTools
{
    static _changeToken(data,tokenBridge,chController,ignoreZationKeys = false,updateOnly = true)
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
                    chController.checkSocketChannelAccess();
                }

                suc = true;
            }

        };

        if(data !== undefined)
        {
            if(ignoreZationKeys)
            {
                setToken();
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT_AUTH_GROUP))
            {
                throw new TaskError(SyErrors.zationKeyConflict, {key: Const.Settings.CLIENT_AUTH_GROUP});
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT_AUTH_ID))
            {
                throw new TaskError(SyErrors.zationKeyConflict, {key: Const.Settings.CLIENT_AUTH_ID});
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT_TOKEN_ID))
            {
                throw new TaskError(SyErrors.zationKeyConflict, {key: Const.Settings.CLIENT_TOKEN_ID});
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

    static setTokenVariable(data,tokenBridge,chController)
    {
        return TokenTools._changeToken(data,tokenBridge,chController);
    }

    static setZationData(data,tokenBridge,tokenEngine,chController)
    {
        let oldToken = tokenBridge.getToken();
        let suc = TokenTools._changeToken(data,tokenBridge,chController,true);
        if(suc) {
            tokenEngine.changedToken(oldToken, tokenBridge.getToken());
        }
        return suc;
    }

    static createToken(data,tokenBridge,tokenEngine,chController)
    {
        let suc = TokenTools._changeToken(data,tokenBridge,chController,true,false);
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