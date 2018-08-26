/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

//TempStorageWorkerClient
abstract class TSWClient
{
    async abstract init() : Promise<void>;
    async abstract saveTokenInfo(expire : number,remoteAddress : string,authUserGroup : string,userId : number | string | undefined) : Promise<string>;
    async abstract updateTokenInfo(token : object) : Promise<any>;
    async abstract isTokenUnblocked(tokenId : any) : Promise<boolean>;
    async abstract blockTokenId(tokenId : any) : Promise<void>;
}

export = TSWClient;