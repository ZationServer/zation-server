/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig = require("../../main/zationConfig");
import ConfigErrorBag = require("../config/configErrorBag");

class Logger
{
    private static zc : ZationConfig;

    static setZationConfig(zc : ZationConfig) : void
    {
        Logger.zc = zc;
    }

    static printStartDebugInfo(txt : string,isBusy : boolean = false) : void
    {
        if (Logger.zc.isStartDebug())
        {
            if(isBusy)
            {
                console.log('\x1b[33m%s\x1b[0m', '   [BUSY]',txt);
            }
            else
            {
                console.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
   static printDebugWarning(txt : string,obj ?: object) : void
    {
        if (Logger.zc.isDebug())
        {
            console.log('\x1b[31m%s\x1b[0m','   [WARNING]',txt);

            if(obj !== undefined)
            {
                console.log(obj);
            }
        }
    }

    static printConfigWarning(configName : string,message : string) : void
    {
        if (Logger.zc.isShowConfigWarning())
        {
            console.log('\x1b[31m%s\x1b[0m','   [WARNING IN CONFIG]',`Config: ${configName} -> ${message}`);
        }
    }

    static printDebugInfo(txt : string,obj ?: object,jsonStringify : boolean = false) : void
    {
        if (Logger.zc.isDebug())
        {
            if(jsonStringify)
            {
                console.log('\x1b[34m%s\x1b[0m','   [INFO]',txt + JSON.stringify(obj));
            }
            else
            {
                console.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);
                if(obj !== undefined)
                {
                    console.log(obj);
                }
            }
        }
    }

    static printConfigErrorBag(configErrorBag : ConfigErrorBag) : void
    {
        console.log('\x1b[31m%s\x1b[0m','   [FAILED]');

        let configErrors = configErrorBag.getConfigErrors();
        let errorCount = configErrorBag.getConfigErrors().length;

        console.log('\x1b[31m%s\x1b[0m'
            ,'   [CONFIG]',
            `${errorCount} configuration error${errorCount > 1 ? 's' : ''} are detected!`);


        for(let i = 0; i < configErrors.length; i++)
        {
            console.log('\x1b[31m%s\x1b[0m','   [ERROR]',configErrors[i].toString());
        }

        console.log('\x1b[34m%s\x1b[0m','   [INFO]',
            `Please fix the ${errorCount} error${errorCount > 1 ? 's' : ''} to start Zation!`);
    }

}

export = Logger;