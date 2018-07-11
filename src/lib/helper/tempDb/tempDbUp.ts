/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

//Class Description
//Main usage is for extra secure token check and to storage information for the zation panel.
interface TempDbUp
{
    //Main
    init() : Promise<void>;

    //TokenInfo
    createTokenInfo(expire : number,remoteAddress : string,authUserGroup : string,userId : any) : Promise<void>;
    updateTokenInfo(token : object) : Promise<boolean>;
    isTokenUnblocked(tokenId : any) : Promise<boolean>;
    blockTokenId(tokenId : any) : Promise<boolean>;
    checkTokenInfoDb() : Promise<any>;

    tokenConnected(tokenId : any) : Promise<void>;
    tokenDisconnected(tokenId : any) : Promise<void>;

    connectedUserCount() : Promise<number>;
    connectedTokenCount(id ?:any) : Promise<number>;
    userCount() : Promise<number>;
    tokensWithIdCount() : Promise<number>;
    tokensWithoutIdCount() : Promise<number>;

    //ErrorInfo
    checkErrorInfoDb() : Promise<number>;
}

export = TempDbUp;