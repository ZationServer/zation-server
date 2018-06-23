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

    async createTokenInfo(expire,remoteAddress,authUserGroup,userId) {} //-

    async updateTokenInfo(token) {} //-

    async isTokenUnblocked(tokenId) {} //-

    async blockTokenId(tokenId) {} //-

    async checkTokenInfoDb() {} //-

    async tokenConnected(tokenId) {}

    async tokenDisconnected(tokenId) {}


    async connectedUserCount() {}

    async connectedTokenCount(id) {}

    async userCount() {}

    async tokensWithIdCount() {}

    async tokensWithoutIdCount() {}

    //ErrorInfo

    async checkErrorInfoDb() {}

}

module.exports = TempDbUp;