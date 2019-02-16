/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const osu : any    = require('node-os-utils');
const pidUsage     = require('pidusage');

class SystemInfo {

    static async getGeneralInfo() : Promise<object> {
        const oos = await osu.os.oos();
        return {
            cpuModel : osu.cpu.model(),
            cpuCount : osu.cpu.count(),
            platform : osu.os.platform(),
            oos : oos
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
        const pidUsage = await SystemInfo.getPidUsage();

        return {
            instance : {
                drive : (await osu.drive.used()),
                memory : (await osu.mem.used()),
                net : (await osu.netstat.inOut()).total,
                cpu : (await osu.cpu.usage())
            },
            pid : {
                cpu : pidUsage.cpu,
                memory : pidUsage.memory / 1048576
            }
        }
    }

    static async getPidInfo() : Promise<object>
    {
        const pidUsage = await SystemInfo.getPidUsage();
        return {
            cpu : pidUsage.cpu,
            memory : pidUsage.memory / 1048576
        }
    }

}

export = SystemInfo;