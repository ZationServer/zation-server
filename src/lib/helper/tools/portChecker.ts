/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import PortScanner = require('portscanner');


class PortChecker
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

export = PortChecker;