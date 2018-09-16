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
import {Socket} from "../socket/socket";
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
                (!updateOnly || (updateOnly && !data.hasOwnProperty(Const.Settings.TOKEN.TOKEN_ID))))
            {
                await setToken();

                if(tokenBridge.isWebSocket())
                {
                    ChAccessEngine.checkSocketZationChAccess(tokenBridge.getSocket());
                }
            }
            else if(data.hasOwnProperty(Const.Settings.TOKEN.AUTH_USER_GROUP))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.TOKEN.AUTH_USER_GROUP});
            }
            else if(data.hasOwnProperty(Const.Settings.TOKEN.USER_ID))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.TOKEN.USER_ID});
            }
            else if(data.hasOwnProperty(Const.Settings.TOKEN.TOKEN_ID))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.TOKEN.TOKEN_ID});
            }
            else if(data.hasOwnProperty(Const.Settings.TOKEN.PANEL_ACCESS))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.TOKEN.PANEL_ACCESS});
            }
            else if(data.hasOwnProperty(Const.Settings.TOKEN.EXPIRE))
            {
                throw new TaskError(MainErrors.zationKeyConflict, {key: Const.Settings.TOKEN.EXPIRE});
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

    static getSocketTokenVariable(key : any,socket : Socket) : any
    {
        // noinspection JSUnresolvedFunction
        let token = socket.getAuthToken();

        if(!!token) {
            return token[key];
        }
        else {
            return undefined;
        }
    }

    static async createNewToken(data : object,tokenBridge : TokenBridge,worker : ZationWorker) : Promise<boolean>
    {
        return await TokenTools.changeToken(data,tokenBridge,worker,true,false);
    }


    //Part Http Token

    static async verifyToken(token,zc : ZationConfig)
    {
        return new Promise((resolve, reject) =>
        {
            let algorithm = zc.getMain(Const.Main.KEYS.AUTH_ALGORITHM);

            Jwt.verify(token,zc.getVerifyKey(),{algorithm : algorithm},(err,decoded) => {
                if(err) {
                    if(err.name === 'TokenExpiredError') {
                        reject(new TaskError(MainErrors.tokenExpiredError,{expiredAt : err.expiredAt}));
                    }
                    else if(err.name === 'JsonWebTokenError') {
                        reject(new TaskError(MainErrors.jsonWebTokenError,err));
                    }
                    else {
                        reject(new TaskError(MainErrors.unknownTokenVerifyError,err));
                    }
                }
                else {
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

            if(data['exp'] === undefined) {
                options['expiresIn'] = zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY);
            }

            Jwt.sign(data,zc.getSignKey(),options,(err,signedToken) => {
                if(err) {
                    reject(new TaskError(MainErrors.unknownTokenSignError,err));
                }
                else {
                    resolve(signedToken);
                }
            });
        });
    }

}

export = TokenTools;