/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export =
    {
        'zation/system/ping' :
            {
                fileName   : 'zationSC_Ping',
                systemController : true,
                access : 'all',
                versionAccess : 'all',
                input : {}
            },
        'zation/panel/auth' :
            {
                fileName   : 'zationSPC_Auth',
                systemController : true,
                access : 'all',
                versionAccess : 'all',
                input : {
                    userName : {
                        type : 'string'
                    },
                    hashPassword : {
                        type : 'string'
                    }
                }
            }
    };