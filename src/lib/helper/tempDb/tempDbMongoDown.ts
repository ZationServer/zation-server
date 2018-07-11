/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import TempDbUp                  = require('./tempDbUp');
import ZationConfig              = require("../../main/zationConfig");

class TempDbMongoDown implements TempDbUp
{
    private readonly zc : ZationConfig;

    constructor(zc)
    {
        this.zc = zc;
    }

    async blockTokenId(tokenId: any): Promise<boolean> {
        //TODO NOT IMPLEMENTED YET
        return true;
    }

    async checkErrorInfoDb(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async checkTokenInfoDb(): Promise<any> {
        //TODO NOT IMPLEMENTED YET
        return undefined;
    }

    async connectedTokenCount(id?: any): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async connectedUserCount(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async createTokenInfo(expire: number, remoteAddress: string, authUserGroup: string, userId: any): Promise<void> {
        //TODO NOT IMPLEMENTED YET
    }

    async init(): Promise<void> {
        //TODO NOT IMPLEMENTED YET
    }

    async isTokenUnblocked(tokenId: any): Promise<boolean> {
        //TODO NOT IMPLEMENTED YET
        return true;
    }

    async tokenConnected(tokenId: any): Promise<void> {
        //TODO NOT IMPLEMENTED YET
    }

    async tokenDisconnected(tokenId: any): Promise<void> {
        //TODO NOT IMPLEMENTED YET
    }

    async tokensWithIdCount(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async tokensWithoutIdCount(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async updateTokenInfo(token: object): Promise<boolean> {
        //TODO NOT IMPLEMENTED YET
        return false;
    }

    async userCount(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

}

export = TempDbMongoDown;