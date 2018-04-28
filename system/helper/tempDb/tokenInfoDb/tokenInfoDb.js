/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class TokenInfoDb
{

    async isTokenValid(token) {}

    async createTokenInfo(expire,authId) {}

    async updateTokenInfo(oldToken,newToken) {}

    async blockToken(tokenId,authId) {}

    async checkTokenInfoStorage() {}

    async onlineUserCount(lastMs) {}

    async userOnlineTokenCount(id,lastMs) {}

    async userCount() {}

    async tokensWithIdCount() {}

    async tokensWithoutIdCount() {}

}

module.exports = TokenInfoDb;