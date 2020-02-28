/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ExpressCore       = require("express-serve-static-core");
import {FileLogOptions}    from '../config/definitions/main/mainConfig';
import {DeepRequired}      from 'utility-types';
import {logFileFileName}   from './logWriter';

/**
 * Create closure for download the log file.
 * @param logFileOptions
 */
export default function createLogFileDownloader(logFileOptions: DeepRequired<FileLogOptions>): (req: ExpressCore.Request, res: ExpressCore.Response) => void {
    if(logFileOptions.active) {
        if(logFileOptions.download.active) {
            const accessKey = logFileOptions.download.accessKey;
            const logFile = logFileOptions.filePath + logFileFileName;

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