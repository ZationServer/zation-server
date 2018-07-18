/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ScHash = require("sc-hasher").hash;

class BrokerKeyHasher
{
    static getHash(key : any, brokerCount : number) : number
    {
        return ScHash(key,brokerCount);
    }
}

export = BrokerKeyHasher;