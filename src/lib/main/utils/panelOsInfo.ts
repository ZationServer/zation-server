/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import OsUtils          from "./osUtils";
import {cpus,platform}  from 'os';

export default class PanelOsInfo {

    static async getGeneralInfo(): Promise<object> {
        const cpusInfo = cpus();
        return {
            cpuModel: cpusInfo[0].model,
            cpuCount: cpusInfo.length,
            platform: platform(),
            oos: (await OsUtils.getOs())
        };
    }

    static async getUpdatedInfo(): Promise<object>
    {
        let pidUsage;
        let drive;
        let cpuUsage;
        let memMb;

        let promises: Promise<any>[] = [];
        promises.push(OsUtils.getPidInfo().then((r) => pidUsage = r));
        promises.push(OsUtils.getHardDriveInfo().then((r) => drive = r));
        promises.push(OsUtils.getAverageCpuUsage().then((r) => cpuUsage = r));
        promises.push(OsUtils.getMemoryUsage().then((r) => memMb = r));
        await Promise.all(promises);

        // noinspection JSUnusedAssignment
        return {
            instance: {
                drive: drive,
                memory: {
                    totalMemMb: memMb.totalMemMb,
                    usedMemMb: memMb.usedMemMb
                },
                cpu: cpuUsage
            },
            pid: pidUsage
        }
    }
}