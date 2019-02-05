/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectTools = require("./objectTools");
const osu : any    = require('node-os-utils');
const pidUsage     = require('pidusage');

class SystemInfo {

    static async getInfo() : Promise<object> {
        const oos = await osu.os.oos();
        const main = {
            general : {
                cpuModel : osu.cpu.model(),
                cpuCount : osu.cpu.count(),
                platform : osu.os.platform(),
                oos : oos
            }
        };
        ObjectTools.addObToOb(main,(await SystemInfo.getUpdatedInfo()));
        return main;
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

        const memoryInfo = await osu.mem.used();
        // in mb
        memoryInfo.pidMemory = pidUsage.memory / 1048576;

        //todo cpu usage not really makes sense

        return {
            driveInfo : (await osu.drive.used()),
            memoryInfo : memoryInfo,
            netInfo : (await osu.netstat.inOut()).total,
            cpuInfo : {
                totalUsage : (await osu.cpu.usage()),
                pidUsage : pidUsage.cpu
            }
        }
    }


}

export = SystemInfo;