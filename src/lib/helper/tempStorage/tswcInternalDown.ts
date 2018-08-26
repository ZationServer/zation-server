/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker              = require("../../main/zationWorker");
import ZationConfig              = require("../../main/zationConfig");
import TSWClient                 = require("./tswClient");
import BrokerKeyHasher = require("./brokerKeyHasher");

//TempStorageWorkerClient
class TSWCInternalDown extends TSWClient
{
    private readonly worker: ZationWorker;
    private readonly zc: ZationConfig;

    constructor(worker : ZationWorker, zc : ZationConfig)
    {
        super();
        this.worker = worker;
        this.zc = zc;
    }

    async init(): Promise<void>
    {

    }

    async blockTokenId(tokenId: any): Promise<void>
    {

    }

    async isTokenUnblocked(tokenId: any): Promise<boolean>
    {
        BrokerKeyHasher.getBrokerId(tokenId,)


        return true;
    }

    async saveTokenInfo(expire, remoteAddress, authUserGroup, userId): Promise<string>
    {

    }

    async updateTokenInfo(token: object): Promise<any>
    {

    }
}

export = TSWCInternalDown;