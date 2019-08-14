/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import * as cluster     from "cluster";
import ZationConfig     from "../config/manager/zationConfig";
import ConfigErrorBag   from "../config/utils/configErrorBag";
const SimpleNodeLogger  = require('simple-node-logger');

export default class Logger
{
    private static zc : ZationConfig;
    private static sl;

    private static stopWatchStartTime : any = Date.now();

    static initFileLog() : void
    {
        if(Logger.zc.mainConfig.logToFile) {

            let path;
            if(cluster.isMaster){
                path = this.zc.rootPath + '/' + Logger.zc.mainConfig.logPath;
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

    static getSimpleLogger() : any {
        return Logger.sl;
    }

    static logFileInfo(...args : any[]) : void
    {
        if(Logger.sl){
            Logger.sl.info(...args);
        }
    }

    static logFileError(string : string) : void
    {
        if(Logger.sl){
            Logger.sl.error(string);
        }
    }

    static setZationConfig(zc : ZationConfig) : void {
        Logger.zc = zc;
    }

    static startStopWatch() {
        if(Logger.zc.isStartDebug()) {
            Logger.stopWatchStartTime = Date.now();
        }
    }

    static printStartDebugInfo(txt : string,time : boolean = false,isBusy : boolean = false) : void
    {
        if (Logger.zc.isStartDebug()) {
            if(time) {
                txt = `${txt} In ${Date.now() - Logger.stopWatchStartTime}ms`;
            }

            if(isBusy) {
                Logger.log('\x1b[33m%s\x1b[0m', '   [BUSY]',txt);
            }
            else {
                Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    static printStartFail(...args : any[]) : void {
        Logger.log('\x1b[31m%s\x1b[0m','   [FAIL]',...args);
    }

    static printConfigWarning(configName : string,message : string) : void {
        if (Logger.zc.isShowConfigWarning()) {
            Logger.log('\x1b[31m%s\x1b[0m','   [WARNING IN CONFIG]',`Config: ${configName} -> ${message}`);
        }
    }

    static printWarning(...args : any[]) : void {
        Logger.log('\x1b[31m%s\x1b[0m','   [WARNING]',...args);
    }

    static printInfo(...args : any[]) : void {
        Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',...args);
    }

    static printError(error : any, beforeMessage : string, endMessage ?: string) : void
    {
        if (Logger.zc.isDebug()) {
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

    static printBusy(...args : any[]) : void {
        Logger.log('\x1b[33m%s\x1b[0m','   [BUSY]',...args);
    }

    static log(...args: any[]) {
        if((Logger.zc && Logger.zc.mainConfig.zationConsoleLog) || true) {
            console.log(...args);
        }
    }

    static printDebugInfo(...args : any[]) : void {
        if (Logger.zc.isDebug()) {
           Logger.printInfo(...args);
        }
    }

    static printDebugWarning(...args : any) : void
    {
        if (Logger.zc.isDebug()) {
            Logger.printWarning(...args);
        }
    }

    static printDebugBusy(...args : any[]) : void {
        if (Logger.zc.isDebug()) {
            Logger.printBusy(...args);
        }
    }

    static printConfigErrorBag(configErrorBag : ConfigErrorBag) : void
    {
        Logger.log('\x1b[31m%s\x1b[0m','   [FAILED]');

        let configErrors = configErrorBag.getConfigErrors();
        let errorCount = configErrorBag.getConfigErrors().length;

        Logger.log('\x1b[31m%s\x1b[0m'
            ,'   [CONFIG]',
            `${errorCount} configuration error${errorCount === 0 || errorCount > 1 ? 's are' : ' is'} detected!`);


        for(let i = 0; i < configErrors.length; i++)
        {
            Logger.log('\x1b[31m%s\x1b[0m','   [ERROR]',configErrors[i].toString());
        }

        Logger.log('\x1b[34m%s\x1b[0m','   [INFO]',
            `Please fix the error${errorCount > 1 ? 's' : ''} to start Zation!`);
    }

}