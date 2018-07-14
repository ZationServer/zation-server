/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig   = require("../../main/zationConfig");
import ConfigErrorBag = require("../config/configErrorBag");
import Const          = require("../constants/constWrapper");

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
                Logger.log('\x1b[33m%s\x1b[0m', '   [BUSY]',txt);
            }
            else
            {
                Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
   static printDebugWarning(txt : string,obj ?: object) : void
    {
        if (Logger.zc.isDebug())
        {
            Logger.log('\x1b[31m%s\x1b[0m','   [WARNING]',txt);

            if(obj !== undefined)
            {
                Logger.log(obj);
            }
        }
    }

    static printConfigWarning(configName : string,message : string) : void
    {
        if (Logger.zc.isShowConfigWarning())
        {
            Logger.log('\x1b[31m%s\x1b[0m','   [WARNING IN CONFIG]',`Config: ${configName} -> ${message}`);
        }
    }

    static printWarning(message : string) : void
    {
        Logger.log('\x1b[31m%s\x1b[0m','   [WARNING]',message);
    }

    static printBusy(message : string) : void
    {
        Logger.log('\x1b[33m%s\x1b[0m','   [BUSY]',message);
    }

    static log(message?: any, ...optionalParams: any[])
    {
        if(Logger.zc.getMain(Const.Main.KEYS.ZATION_CONSOLE_LOG))
        {
            console.log(message,...optionalParams);
        }
    }

    static printDebugInfo(txt : string,obj ?: object,jsonStringify : boolean = false) : void
    {
        if (Logger.zc.isDebug())
        {
            if(jsonStringify)
            {
                Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',txt + JSON.stringify(obj));
            }
            else
            {
                Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);
                if(obj !== undefined)
                {
                    Logger.log(obj);
                }
            }
        }
    }

    static printConfigErrorBag(configErrorBag : ConfigErrorBag) : void
    {
        Logger.log('\x1b[31m%s\x1b[0m','   [FAILED]');

        let configErrors = configErrorBag.getConfigErrors();
        let errorCount = configErrorBag.getConfigErrors().length;

        Logger.log('\x1b[31m%s\x1b[0m'
            ,'   [CONFIG]',
            `${errorCount} configuration error${errorCount > 1 ? 's' : ''} are detected!`);


        for(let i = 0; i < configErrors.length; i++)
        {
            Logger.log('\x1b[31m%s\x1b[0m','   [ERROR]',configErrors[i].toString());
        }

        Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',
            `Please fix the ${errorCount} error${errorCount > 1 ? 's' : ''} to start Zation!`);
    }

}

export = Logger;