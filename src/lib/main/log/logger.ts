/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfig     from "../config/manager/zationConfig";
import ErrorBag         from '../error/errorBag';
import SimpleLogger, {createSimpleLogger, EmptySimpleLogger} from './simpleLogger';
import {createConsoleLogWriter, createFileLogWriter, LogWriter} from './logWriter';

export default class Logger
{
    private static _simpleLogger: SimpleLogger = EmptySimpleLogger;
    private static _initialized = false;
    private static _showConfigWarnings = true;

    static init(zc: ZationConfig): void {
        Logger._showConfigWarnings = zc.isShowConfigWarning();

        const writer: LogWriter[] = [];

        const logOptions = zc.mainConfig.log;
        const consoleLogOptions = logOptions.console;
        const fileLogOptions = logOptions.file;


        if(consoleLogOptions.active && consoleLogOptions.logLevel > 0) {
            writer.push(createConsoleLogWriter(consoleLogOptions.logLevel));
        }
        if(fileLogOptions.active && fileLogOptions.logLevel > 0){
            writer.push(createFileLogWriter(fileLogOptions,zc.rootPath));
        }

        this._simpleLogger = createSimpleLogger(writer,zc.mainConfig.startDebug,zc.mainConfig.debug);

        this._initialized = true;
    }

    static get log(): SimpleLogger {
        return Logger._simpleLogger;
    }

    static logStartFail(msg: string) {
        if(this._initialized) {
            Logger._simpleLogger.failed(msg);
        }
        else {
            console.log('\x1b[31m%s\x1b[0m','   [FAILED]',msg)
        }
    }

    static consoleLogConfigWarning(configName: string | string[], message: string): void {
        if (Logger._showConfigWarnings) {
            if(typeof configName === 'string') configName = [configName];
            Logger._simpleLogger.warn(`Config${configName.length > 1 ? 's' : ''}: ${configName.join(', ')} -> ${message}`);
        }
    }

    static consoleLogErrorBag(errorBag: ErrorBag<any>, errorType: string = 'configuration'): void {
        const errors = errorBag.getErrors();
        const errorCount = errorBag.getErrors().length;

        Logger._simpleLogger.failed(`${errorCount} ${errorType} error${errorCount === 0 || errorCount > 1 ? 's': ''}:`);

        for(let i = 0; i < errors.length; i++) {
            Logger._simpleLogger.error(errors[i].toString());
        }

        Logger._simpleLogger.info(`Please fix the error${errorCount > 1 ? 's': ''} to start Zation`);
    }

}