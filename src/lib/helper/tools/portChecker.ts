/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Net = require("net");

class PortChecker
{
    public static async isPortAvailable(port : number | undefined) : Promise<boolean>
    {
        return new Promise<boolean>(((resolve, reject) => {
            const tester = Net.createServer()
                .once('error', err => (err['code'] == 'EADDRINUSE' ? resolve(false) : reject(err)))
                .once('listening', () => tester.once('close', () => resolve(true)).close())
                .listen(port)
        }));
    }
}

export = PortChecker;