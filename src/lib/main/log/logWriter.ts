/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {LogCategory}    from './logCategories';
import {FileLogOptions} from '../config/definitions/main/mainConfig';
import * as path        from 'path';
import * as fs          from 'fs';
import moment         = require('moment');

export interface LogWriter {
    write(msg: string[],category: LogCategory): void;
}

export function createConsoleLogWriter(logLevel): LogWriter {
    return {
        write: (msg, {level,color,name}) => {
            if(logLevel >= level) console.log(`\x1b[3${color}m   [${name}]\x1b[0m`,msg.join('\n'));
        }
    }
}

export const logFileFileName = 'ZATION_LOG_FILE.log';
export function processFileLogPath(fileLogOptions: Required<FileLogOptions>,rootPath: string): string {
    let filePath = rootPath + '/' + fileLogOptions.filePath;
    if(!filePath.endsWith('/')){filePath+='/'}
    return path.normalize(filePath + logFileFileName);
}

export function createFileLogWriter(fileLogOptions: Required<FileLogOptions>,rootPath: string): LogWriter {
    const writer = fs.createWriteStream(processFileLogPath(fileLogOptions,rootPath), {
        flags:'a',
        encoding:'utf8'
    });

    const logLevel = fileLogOptions.logLevel;
    return {
        write: (msg,{level,name}) => {
            if(logLevel >= level) {
                const timestamp = Date.now();
                process.nextTick(() =>
                    writer.write(`${moment(timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')} [${name}] ${msg.join(' ')}\n`))
            }
        }
    }
}