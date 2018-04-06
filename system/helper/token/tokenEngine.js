/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Jwt           = require('jsonwebtoken');
const Const         = require('../constante/constWrapper');
const TaskError     = require('../../api/TaskError');
const SyErrors      = require('../zationTaskErrors/systemTaskErrors');

class TokenEngine
{
    constructor()
    {

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
                        reject(new TaskError(SyErrors.tokenExpiredError,{expiredAt : err.expiredAt}))
                    }
                    else if(err.name === 'JsonWebTokenError')
                    {
                        reject(new TaskError(SyErrors.jsonWebTokenError,err))
                    }
                    else
                    {
                        reject(new TaskError(SyErrors.unknownTokenVerifyError,err))
                    }
                }
                else
                {
                    resolve(decoded);
                }
            });
        });
    }

    createToken()
    {




    }

    setTokenVariable(key,value,zationAllow = false)
    {

    }

    getTokenVariable(key)
    {

    }


}

module.exports = TokenEngine;