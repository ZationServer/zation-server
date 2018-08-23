/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const            = require('../constants/constWrapper');
import TaskError        = require('../../api/TaskError');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import {ChAccessEngine}   from '../channel/chAccessEngine';
import TokenBridge = require("../bridges/tokenBridge");
import ZationWorker = require("../../main/zationWorker");
import TokenEngine = require("./tokenEngine");
import ZationConfig = require("../../main/zationConfig");
const  Jwt : any         = require('jsonwebtoken');

class TokenTools
{
    private static async changeToken(data : object,tokenBridge : TokenBridge,worker : ZationWorker,ignoreZationKeys : boolean = false,updateOnly : boolean = true) : Promise<boolean>
    {
        let suc = false;

        let setToken = async () =>
        {
            let token = tokenBridge.getToken();

            if((token !== undefined && token !== null) || (!updateOnly))
            {
                await tokenBridge.setToken(TokenTools.bringAuthTokenTogether(token,data));

                if(tokenBridge.isWebSocket())
                {
                    await ChAccessEngine.checkSocketCustomChAccess(tokenBridge.getSocket(),worker);
                }

                suc = true;
            }

        };

        if(data !== undefined)
        {
            if(ignoreZationKeys &&
                (!updateOnly || (updateOnly && !data.hasOwnProperty(Const.Settings.CLIENT.TOKEN_ID))))
            {
                await setToken();

                if(tokenBridge.isWebSocket())
                {
                    ChAccessEngine.checkSocketZationChAccess(tokenBridge.getSocket());
                }
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT.AUTH_USER_GROUP))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.CLIENT.AUTH_USER_GROUP});
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT.USER_ID))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.CLIENT.USER_ID});
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT.TOKEN_ID))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.CLIENT.TOKEN_ID});
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT.PANEL_ACCESS))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.CLIENT.PANEL_ACCESS});
            }
            else if(data.hasOwnProperty(Const.Settings.CLIENT.EXPIRE))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.CLIENT.EXPIRE});
            }
            else
            {
                await setToken();
            }
        }
        return suc;
    }

    private static bringAuthTokenTogether(token : object,newData : object) : object
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
    static getTokenVariable(key : any,tokenBridge : TokenBridge) : any
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

    static getSocketTokenVariable(key : any,socket : any) : any
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

    static async setTokenVariable(data : object,tokenBridge : TokenBridge,worker : ZationWorker) : Promise<boolean>
    {
        return await TokenTools.changeToken(data,tokenBridge,worker);
    }

    static async setZationData(data : object,tokenBridge : TokenBridge,tokenEngine : TokenEngine,worker : ZationWorker) : Promise<boolean>
    {
        let suc = await TokenTools.changeToken(data,tokenBridge,worker,true);

        /*
        if(suc && worker.getZationConfig().isUseTokenInfoTempDb())
        {
            let newToken = tokenBridge.getToken();
            await tokenEngine.getWorker().getTempDbUp().updateTokenInfo(newToken);
        }
        */
        return suc;
    }

    static async createNewToken(data : object,tokenBridge : TokenBridge,worker : ZationWorker) : Promise<boolean>
    {
        return await TokenTools.changeToken(data,tokenBridge,worker,true,false);
    }

    static async verifyToken(token,zc : ZationConfig)
    {
        return new Promise((resolve, reject) =>
        {
            let algorithm = zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM);

            Jwt.verify(token,zc.getVerifyKey(),{algorithm : algorithm},(err,decoded) =>
            {
                if(err)
                {
                    if(err.name === 'TokenExpiredError')
                    {
                        reject(new TaskError(MainErrors.tokenExpiredError,{expiredAt : err.expiredAt}));
                    }
                    else if(err.name === 'JsonWebTokenError')
                    {
                        reject(new TaskError(MainErrors.jsonWebTokenError,err));
                    }
                    else
                    {
                        reject(new TaskError(MainErrors.unknownTokenVerifyError,err));
                    }
                }
                else
                {
                    resolve(decoded);
                }
            });
        });
    }

    static async signToken(data : object,zc : ZationConfig)
    {
        return new Promise((resolve, reject) =>
        {
            let options = {};
            options['algorithm'] = zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM);

            if(data['exp'] === undefined)
            {
                options['expiresIn'] = zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY);
            }

            Jwt.verify(data,zc.getSignKey(),options,(err,signedToken) =>
            {
                if(err)
                {
                    reject(new TaskError(MainErrors.unknownTokenSignError,err));
                }
                else
                {
                    resolve(signedToken);
                }
            });
        });
    }

}

export = TokenTools;