/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ExpressCore                   = require("express-serve-static-core");
import ZationConfig                    from "../config/manager/zationConfig";

export type LogFileDownloader = (req :  ExpressCore.Request,res :  ExpressCore.Response) => void

export default class ExpressUtils
{
    /**
     * Create closure for download the log file.
     * @param zc
     */
    static createLogFileDownloader(zc : ZationConfig) : LogFileDownloader {
        if(zc.mainConfig.logToFile) {
            if(zc.mainConfig.logDownloadable)
            {
                const accessKey = zc.mainConfig.logAccessKey;
                const logFile = zc.mainConfig.logPath + 'ZATION_LOG_FILE.log';

                return (req, res) => {
                    const key = req.params.key !== undefined ? req.params.key : '';
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
}

