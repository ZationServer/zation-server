/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker              = require("../../main/zationWorker");
import ZationConfig              = require("../../main/zationConfig");
import TSWClient                 = require("./tswClient");

//TempStorageWorkerClient
class TSWCMongoDown extends TSWClient
{
    private readonly worker: ZationWorker;
    private readonly zc: ZationConfig;

    constructor(worker : ZationWorker, zc : ZationConfig)
    {
        super();
        this.worker = worker;
        this.zc = zc;
    }

    async blockTokenId(tokenId: any): Promise<any> {
        return undefined;
    }

    async init(): Promise<void> {
        return undefined;
    }

    async isTokenUnblocked(tokenId: any): Promise<boolean> {
        return undefined;
    }

    async saveTokenInfo(expire, remoteAddress, authUserGroup, userId): Promise<string> {
        return undefined;
    }

    async updateTokenInfo(token: object): Promise<any> {
        return undefined;
    }
}

export = TSWCMongoDown;