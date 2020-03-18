/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ExpressCore        = require("express-serve-static-core");
import {FileLogOptions}     from '../config/definitions/main/mainConfig';
import {DeepRequired}       from 'utility-types';
import {processFileLogPath} from './logWriter';

/**
 * Create closure for download the log file.
 * @param logFileOptions
 * @param rootPath
 */
export default function createLogFileDownloader(logFileOptions: DeepRequired<FileLogOptions>,rootPath: string): (req: ExpressCore.Request, res: ExpressCore.Response) => void {
    if(logFileOptions.active) {
        if(logFileOptions.download.active) {
            const accessKey = logFileOptions.download.accessKey;
            const logFile = processFileLogPath(logFileOptions,rootPath);

            return (req, res) => {
                const key = req.params.key !== undefined ? req.params.key: '';
                if(key === accessKey) {
                    res.download(logFile);
                }
                else {
                    res.status(401).send('Wrong access key');
                }
            }
        }
        else {
            return (req, res) => {
                res.status(404).send('LogFile download is disabled');
            };
        }
    }
    else {
        return (req, res) => {
            res.status(404).send('Log to file is disabled');
        };
    }
}