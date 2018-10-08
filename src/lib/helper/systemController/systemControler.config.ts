/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export =
    {
        'zation/system/ping' :
            {
                name   : 'zationSC_Ping',
                systemController : true,
                access : 'all',
                input : {}
            },
        'zation/panel/auth' :
            {
                name   : 'zationSPC_Auth',
                systemController : true,
                access : 'all',
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