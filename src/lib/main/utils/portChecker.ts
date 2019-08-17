/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import PortScanner = require('portscanner');

export default class PortChecker
{
    public static async isPortAvailable(port : number | undefined) : Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            PortScanner.checkPortStatus(port, '127.0.0.1', function(error, status) {
                if(error){reject(error)}
                else{resolve(status === 'closed');}
            })
        });
    }
}