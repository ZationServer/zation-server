/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import PortScanner = require('portscanner');

export default class PortChecker
{
    public static async isPortAvailable(port: number,host: string = '127.0.0.1'): Promise<boolean> {
        return (await PortScanner.checkPortStatus(port,host)) === 'closed';
    }

    public static findAPortNotInUse: (ports: number[],host: string) => Promise<number> = PortScanner.findAPortNotInUse;
    public static findAPortInUse: (ports: number[],host: string) => Promise<number> = PortScanner.findAPortInUse;
}