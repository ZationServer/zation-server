/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker              = require("../../main/zationWorker");
import ZationConfig              = require("../../main/zationConfig");

//TempStorageWorkerClient
abstract class TSWClient
{
    abstract readonly worker : ZationWorker;
    abstract readonly zc : ZationConfig;

    async abstract init() : Promise<void>;
    async abstract saveTokenInfo(expire,remoteAddress,authUserGroup,userId) : Promise<string>;
    async abstract updateTokenInfo(token : object) : Promise<any>;
    async abstract isTokenUnblocked(tokenId : any) : Promise<boolean>;
    async abstract blockTokenId(tokenId : any) : Promise<any>;
}

export = TSWClient;