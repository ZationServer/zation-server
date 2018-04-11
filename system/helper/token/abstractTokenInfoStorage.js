/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class AbstractTokenInfoStorage
{

    async isTokenValid(token) {}

    async createTokenInfo(expire,authId) {}

    async setLastActivity(token) {}

    async getLastActivity(token) {}

    async setTokenInfo(key,value,tokenId,authId) {}

    async getTokenInfo(key,tokenId,authId) {}

    async checkTokenInfoStorage() {}


    async onlineUserCount(lastMs) {}

    async userOnlineTokenCount(id,lastMs) {}

    async userCount() {}

    async tokensWithIdCount() {}

    async tokensWithoutIdCount() {}

}

module.exports = AbstractTokenInfoStorage;