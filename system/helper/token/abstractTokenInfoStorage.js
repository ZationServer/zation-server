/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class AbstractTokenInfoStorage
{

    async isTokenValid(token) {}

    async createTokenInfo(expire,authId) {}

    async setTokenInfo(key,value,tokenId,authId) {}

    async setLastActivity(token) {}



}

module.exports = AbstractTokenInfoStorage;