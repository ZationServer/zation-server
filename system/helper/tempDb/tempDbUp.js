/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class TempDbUp
{
    //Main

    async init() {} //-

    //TokenInfo

    async createTokenInfo(expire,remoteAddress,authGroup,authId) {} //-

    async updateTokenInfo(token) {} //-

    async isTokenIdValid(tokenId) {} //-

    async blockTokenId(tokenId) {} //-

    async checkTokenInfoDb() {}




    async onlineUserCount(lastMs) {}

    async userOnlineTokenCount(id,lastMs) {}

    async userCount() {}

    async tokensWithIdCount() {}

    async tokensWithoutIdCount() {}

    //ErrorInfo

    async checkErrorInfoDb() {}

}

module.exports = TempDbUp;