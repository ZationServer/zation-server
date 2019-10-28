/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import * as os from 'os';
import * as fs from "fs";
import co from 'co';
const cp = require('child_process');

const DISK_PATTERN = /^(\S+)\n?\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\n/mg;

export default class OsUtils {

    static async getDriveUsed(): Promise<{ totalGb: number, usedGb: number, usedPercentage: number }> {
        try {
            return await OsUtils.processDriveInfo()
                .then((res) => {
                    return Promise.resolve({
                        totalGb: res.totalGb,
                        usedGb: res.usedGb,
                        usedPercentage: res.usedPercentage
                    });
                })
        } catch (e) {
            return {totalGb: 0, usedGb: 0, usedPercentage: 0};
        }
    }

    static getAverageCpuUsage(): Promise<number> {
        return new Promise(function (resolve) {
            const startMeasure = OsUtils.cpuProcessAverage();
            setTimeout(() => {
                const endMeasure = OsUtils.cpuProcessAverage();
                const idleDifference = endMeasure.avgIdle - startMeasure.avgIdle;
                const totalDifference = endMeasure.avgTotal - startMeasure.avgTotal;
                const cpuPercentage = (10000 - Math.round(10000 * idleDifference / totalDifference)) / 100;
                return resolve(cpuPercentage)
            }, 1000);
        })
    }

    static getMemoryUsage(): Promise<{totalMemMb : number,usedMemMb : number}> {
        return OsUtils.processMemoryInfo().then( (res : any) => {
            return Promise.resolve({
                totalMemMb: res.totalMemMb,
                usedMemMb: res.usedMemMb
            })
        })
    }

    private static processMemoryInfo()
    {
        return new Promise(function (resolve) {
            let totalMem : any = null;
            let freeMem : any = null;
            cp.exec('cat /proc/meminfo | head -5', co.wrap(function* (err, out) {
                if (err || !out) {
                    totalMem = os.totalmem() / 1024;
                    freeMem = os.freemem() / 1024;
                    if (os.platform() === 'darwin') {
                        let mem = yield darwinMem.memory();

                        totalMem = mem.total;
                        freeMem = mem.total - mem.used
                    }
                } else {
                    let resultMemory = (out.match(/\d+/g));
                    totalMem = parseInt(resultMemory[0], 10) * 1024;
                    freeMem = parseInt(resultMemory[1], 10) + (parseInt(resultMemory[3], 10) + parseInt(resultMemory[4], 10)) * 1024
                }
                return resolve({
                    totalMemMb: parseFloat((totalMem / 1024 / 1024).toFixed(2)),
                    usedMemMb: parseFloat(((totalMem - freeMem) / 1024 / 1024).toFixed(2)),
                })
            }))
        })
    }

    private static cpuProcessAverage() {
        let totalIdle = 0;
        let totalTick = 0;
        const cpus = os.cpus();
        for (let i = 0, len = cpus.length; i < len; i++) {
            const cpu = cpus[i];
            for (let type in cpu.times) {
                totalTick += cpu.times[type]
            }
            totalIdle += cpu.times.idle
        }
        return {
            totalIdle: totalIdle,
            totalTick: totalTick,
            avgIdle: (totalIdle / cpus.length),
            avgTotal: (totalTick / cpus.length)
        }
    }

    static exec(command) {
        return function () {
            return new Promise(function (resolve) {
                cp.exec(command, {shell: true}, function (err, stdout) {
                    if (err || !stdout) {
                        return resolve('Unknown');
                    }
                    return resolve(stdout);
                })
            })
        }
    }

    private static parseDfStdout(stdout) {
        let dfInfo: any = [];
        let headline : any[] = [];

        stdout.replace(DISK_PATTERN, function () {
            let args = Array.prototype.slice.call(arguments, 1, 7);
            if (arguments[7] === 0) {
                headline = args;
                return;
            }
            dfInfo.push(OsUtils.createDiskInfo(headline, args))
        });
        return dfInfo
    }

    private static createDiskInfo(headlineArgs, args) {
        const info = {};
        headlineArgs.forEach((h, i) => {
            info[h] = args[i]
        });
        return info
    }

    private static processDriveInfo(): Promise<any> {
        const diskName = '/';
        return OsUtils.exec('df -kP')().then((out) => {
            let diskInfo: any = null;
            let main = null;
            let lines = OsUtils.parseDfStdout(out);
            for (let i = 0; i < lines.length; i++) {
                if (lines[i]['Mounted on'] === diskName) {
                    diskInfo = lines[i];
                    continue;
                }
                if (lines[i]['Mounted on'] === '/') {
                    main = lines[i];
                }
            }
            if (diskInfo === null) {
                if (main === null) {
                    throw new Error('disk name invalid and / not found');
                }
                diskInfo = main;
            }
            const total = Math.ceil(((diskInfo['1K-blocks'] || diskInfo['1024-blocks']) * 1024) / Math.pow(1024, 2));
            const used = Math.ceil(diskInfo.Used * 1024 / Math.pow(1024, 2));

            const totalGb: any = (total / 1024).toFixed(1);
            const usedGb: any = (used / 1024).toFixed(1);

            const usedPercentage = (100 * usedGb / totalGb).toFixed(1);

            return Promise.resolve({
                totalGb: totalGb,
                usedGb: usedGb,
                usedPercentage: usedPercentage,
            })
        })
    }

    static getOs(): Promise<string> {
        const platform = os.platform();
        if (platform === 'linux') {
            return OsUtils.getOsLinux()
        }
        else if (platform === 'darwin') {
            return OsUtils.getOsDarwin();
        }
        else if(platform === 'win32') {
            return OsUtils.getOsWin();
        }
        return OsUtils.getOsLast();
    }

    private static getOsLast(): Promise<string> {
        return new Promise(function (resolve) {
            cp.exec('uname -sr', {shell: true}, function (err, out) {
                if (err && !out) {
                    return resolve('Unknown');
                }
                return resolve(out)
            })
        })
    }

    private static getOsWin(): Promise<string> {
        return new Promise(function (resolve) {
            cp.exec('wmic os get Caption /value', {shell: true}, function (err, out) {
                if (err && !out) {
                    return OsUtils.getOsLast();
                }
                resolve(out.match(/[\n\r].*Caption=\s*([^\n\r]*)/)[1]);
            })
        })
    }

    private static getOsDarwin(): Promise<string> {
        return new Promise(function (resolve) {
            cp.exec('sw_vers', {shell: true}, function (err, out) {
                if (err && !out) {
                    return OsUtils.getOsLast();
                }
                const version = out.match(/[\n\r].*ProductVersion:\s*([^\n\r]*)/)[1];
                const distribution = out.match(/.*ProductName:\s*([^\n\r]*)/)[1];
                return resolve(distribution + ' ' + version);
            })
        })
    }

    private static getOsLinux(): Promise<string> {
        return new Promise<string>((resolve) => {
            fs.readFile('/etc/issue', function (err, out: any) {
                if (err) {
                    return OsUtils.getOsLast();
                }
                out = out.toString();
                let version = out.match(/[\d]+(\.[\d][\d]?)?/);

                if (version !== null) {
                    version = version[0]
                }
                const distribution = out.match(/[\w]*/)[0];
                if (version !== null && distribution !== null) {
                    let resultOs = distribution + ' ' + version;
                    return resolve(resultOs)
                } else if (distribution !== null && distribution !== '') {
                    return resolve(distribution)
                } else if (version === null) {
                    fs.readFile('/etc/redhat-release', (err, out: any) => {
                        if (err) {
                            return OsUtils.getOsLast();
                        }
                        out = out.toString();
                        version = out.match(/[\d]+(\.[\d][\d]?)?/);

                        if (version !== null) {
                            version = version[0]
                        }
                        return resolve('Red Hat ' + version);
                    })
                }
            })
        })
    }
}

const darwinMem = {
    PAGE_SIZE: 4096,
    physicalMemory: co.wrap(function * () {
        let res = yield (OsUtils.exec('sysctl hw.memsize')());
        res = res.trim().split(' ')[1];
        return parseInt(res)
    }),
    vmStats: co.wrap(function * () {
        const mappings = {
            'Anonymous pages': 'app',
            'Pages wired down': 'wired',
            'Pages active': 'active',
            'Pages inactive': 'inactive',
            'Pages occupied by compressor': 'compressed'
        };

        let ret = {};
        let res = yield (OsUtils.exec('vm_stat')());
        let lines = res.split('\n');

        lines = lines.filter(x => x !== '');

        lines.forEach(x => {
            const parts = x.split(':');
            const key = parts[0];
            const val = parts[1].replace('.', '').trim();

            if (mappings[key]) {
                const k = mappings[key];

                ret[k] = val * darwinMem.PAGE_SIZE
            }
        });
        return ret
    }),
    memory: co.wrap(function * () {
        const total = yield darwinMem.physicalMemory();
        const stats = yield darwinMem.vmStats();
        const used = (stats.wired + stats.active + stats.inactive);
        return { used: used, total: total }
    })
};

