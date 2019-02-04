/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig   = require("../../main/zationConfig");
import ConfigErrorBag = require("../config/configErrorBag");
import * as cluster     from "cluster";
const SimpleNodeLogger  = require('simple-node-logger');

class Logger
{
    private static zc : ZationConfig;
    private static sl;

    private static stopWatchStartTime : any = Date.now();

    static initFileLog() : void
    {
        if(Logger.zc.mainConfig.logToFile) {

            let path;
            if(cluster.isMaster){
                path = ZationConfig._getRootPath() + '/' + Logger.zc.mainConfig.logPath;
                if(!path.endsWith('/')){path+='/'}
                Logger.zc.mainConfig.logPath = path;
            }
            else {
                path = Logger.zc.mainConfig.logPath;
            }

            Logger.sl = SimpleNodeLogger.createSimpleFileLogger({
                logFilePath: path + 'ZATION_LOG_FILE.log',
                timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
            });
        }
    }

    static logFileInfo(txt : string,obj ?: object,jsonStringify : boolean = false) : void
    {
        if(Logger.sl){
            if(jsonStringify) {
                Logger.sl.info(txt + JSON.stringify(obj));
            }
            else {
                Logger.sl.info(txt);
                if(obj !== undefined) {
                    Logger.sl.info(obj);
                }
            }
        }
    }

    static logFileError(string : string) : void
    {
        if(Logger.sl){
            Logger.sl.error(string);
        }
    }

    static setZationConfig(zc : ZationConfig) : void
    {
        Logger.zc = zc;
    }

    static startStopWatch()
    {
        if(Logger.zc.isStartDebug())
        {
            Logger.stopWatchStartTime = Date.now();
        }
    }

    static printStartDebugInfo(txt : string,time : boolean = false,isBusy : boolean = false) : void
    {
        if (Logger.zc.isStartDebug())
        {
            if(time)
            {
                txt = `${txt} In ${Date.now() - Logger.stopWatchStartTime}ms`;
            }

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

    // noinspection JSUnusedGlobalSymbols
    static printStartFail(txt : string,obj ?: object) : void
    {
        Logger.log('\x1b[31m%s\x1b[0m','   [FAIL]',txt);
        if(obj !== undefined)
        {
            Logger.log(obj);
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

    static printError(error : any, beforeMessage : string, endMessage ?: string) : void
    {
        if (Logger.zc.isDebug())
        {
            Logger.log
            (
                '\x1b[31m%s\x1b[0m',
                '   [ERROR]',
                beforeMessage,
                error.stack,
                !!endMessage ? `\n    ${endMessage}` : ''
            );
        }
    }

    static printBusy(message : string) : void
    {
        Logger.log('\x1b[33m%s\x1b[0m','   [BUSY]',message);
    }

    static log(message?: any, ...optionalParams: any[])
    {
        if((Logger.zc && Logger.zc.mainConfig.zationConsoleLog) || true)
        {
            console.log(message,...optionalParams);
        }
    }

    static printDebugInfo(txt : string,obj ?: object,jsonStringify : boolean = false) : void
    {
        if (Logger.zc.isDebug())
        {
            if(jsonStringify) {
                Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',txt + JSON.stringify(obj));
            }
            else {
                Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);
                if(obj !== undefined) {
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