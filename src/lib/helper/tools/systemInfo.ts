/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import OsUtils from "./osUtils";

const pidUsage     = require('pidusage');
import {cpus,platform}        from 'os';

class SystemInfo {

    static async getGeneralInfo() : Promise<object> {
        const cpusInfo = cpus();
        return {
            cpuModel : cpusInfo[0].model,
            cpuCount : cpusInfo.length,
            platform : platform(),
            oos : (await OsUtils.getOs())
        };
    }

    static async getPidUsage() : Promise<any>
    {
        return new Promise<object>((resolve, reject) => {
            pidUsage(process.pid, (err, stats) => {
                if(err){reject(err);}
                resolve(stats);
            });
        });
    }

    static async getUpdatedInfo() : Promise<object>
    {
        let pidUsage;
        let drive;
        let cpuUsage;
        let memMb;

        let promises : Promise<any>[] = [];
        promises.push(SystemInfo.getPidUsage().then((r) => pidUsage = r));
        promises.push(OsUtils.getDriveUsed().then((r) => drive = r));
        promises.push(OsUtils.getCpuUsage().then((r) => cpuUsage = r));
        promises.push(OsUtils.getMemoryUsage().then((r) => memMb = r));
        await Promise.all(promises);

        // noinspection JSUnusedAssignment
        return {
            instance : {
                drive : drive,
                memory : {
                    totalMemMb : memMb.totalMemMb,
                    usedMemMb : memMb.usedMemMb
                },
                cpu : cpuUsage
            },
            pid : {
                cpu : pidUsage.cpu,
                memory : pidUsage.memory / 1e+6
            }
        }
    }

    static async getPidInfo() : Promise<object>
    {
        const pidUsage = await SystemInfo.getPidUsage();
        return {
            cpu : pidUsage.cpu,
            memory : pidUsage.memory / 1e+6
        }
    }

}

export = SystemInfo;