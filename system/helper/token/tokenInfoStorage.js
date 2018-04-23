/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                     = require('../constante/constWrapper');
const AbstractTokenInfoStorage  = require('./abstractTokenInfoStorage');
const TaskError                 = require('./../../api/TaskError');
const MainErrors                = require('./../zationTaskErrors/mainTaskErrors');

class TokenInfoStorage extends AbstractTokenInfoStorage
{
    constructor(abstractStorage)
    {
        super();
        this._as = abstractStorage;
    }

    async init()
    {
        await this._as.init();
        await this._generateMainStructure();
    }

    async _generateMainStructure()
    {
        let canDoWithId = await this._as.send
        (
            this._as.buildCanDo(Const.Settings.TOKEN_INFO_WITH_ID)
        );

        let canDoWithoutId = await this._as.send
        (
            this._as.buildCanDo(Const.Settings.TOKEN_INFO_WITHOUT_ID)
        );

        if(!canDoWithId)
        {
            await this._as.send(this._as.buildSet(Const.Settings.TOKEN_INFO_WITH_ID));
        }

        if(!canDoWithoutId)
        {
            await this._as.send(this._as.buildSet(Const.Settings.TOKEN_INFO_WITHOUT_ID));
        }
    }

    _buildDoInWithId(req)
    {
        return this._as.buildDo(Const.Settings.TOKEN_INFO_WITH_ID,req);
    }

    _buildDoInWithoutId(req)
    {
        return this._as.buildDo(Const.Settings.TOKEN_INFO_WITHOUT_ID,req);
    }

    _buildDoInAuthId(id,req)
    {
        return this._buildDoInWithId(this._as.buildDo(id,req));
    }

    async _isAuthIdIn(id)
    {
        return await this._as.send(this._buildDoInWithId(this._as.buildCanDo(id)));
    }

    async _createAuthId(id)
    {
        return await this._as.send(this._buildDoInWithId(this._as.buildSet(id)));
    }

    async _createWithoutAuthIdTokenInfo(expire)
    {
        let uuid = await this._createTokenInfo((req) =>
        {
            this._buildDoInWithoutId(req);
        });
        await this._setTokenInfo(Const.Settings.TOKEN_INFO_EXPIRE,expire,uuid,true);

    }

    async _createAuthIdTokenInfo(authId,expire)
    {
        let isUserIn = await this._isAuthIdIn(authId);

        let buildDo = (req) =>
        {
            return this._buildDoInAuthId(authId,req);
        };

        if(!isUserIn)
        {
            await this._createAuthId(authId);
        }

        let uuid = await this._createTokenInfo(buildDo);
        await this._setTokenInfo(Const.Settings.TOKEN_INFO_EXPIRE,expire,uuid,authId,true);
        return uuid;
    }

    async _createTokenInfo(buildDo)
    {
        let uuid = await this._generateUniqueUuidIn(async(uuid) =>
        {
            return await this._as.send(buildDo(this._as.buildCanDo(uuid)));
        });

        await this._as.send(buildDo(this._as.buildSet(uuid)));

        return uuid;
    }

    async _isTokeWithAuthIdValid(tokenId,authId)
    {
        let isThere = await this._as.send(this._buildDoInAuthId(authId,this._as.buildCanDo(tokenId)));
        if(!isThere)
        {
            return false;
        }
        else
        {
            let req = this._buildDoInAuthId(authId,this._as.buildDo(tokenId,this._as.buildGet()));
            let tokenInfo = await this._as.send(req);
            return this._checkTokenInfo(tokenInfo);
        }
    }

    async _isTokenWithoutAuthIdValid(tokenId)
    {
        let isThere = await this._as.send(this._buildDoInWithoutId(this._as.buildCanDo(tokenId)));
        if(!isThere)
        {
            return false;
        }
        else
        {
            let req = this._buildDoInWithoutId(this._as.buildDo(tokenId,this._as.buildGet()));
            let tokenInfo = await this._as.send(req);
            return this._checkTokenInfo(tokenInfo);
        }
    }

    // noinspection JSMethodCanBeStatic
    _checkTokenInfo(tokenInfo)
    {
        if(tokenInfo !== undefined && tokenInfo !== false)
        {
            let isBlocked = tokenInfo[Const.Settings.TOKEN_INFO_IS_BLOCKED];
            return isBlocked === undefined || (isBlocked !== undefined && !isBlocked);
        }
        else
        {
            return false;
        }
    }

    async _generateUniqueUuidIn(isThere)
    {
        return new Promise(async(resolve, reject) =>
        {
            let keyNotFound = true;
            let uuid = undefined;
            let tryCount = 0;

            while(keyNotFound)
            {
                uuid = TokenInfoStorage._generateUUID();
                let isAvailable = ! (await isThere(uuid));

                if(isAvailable)
                {
                    keyNotFound = false;
                    resolve(uuid);
                }
                if(tryCount === 3)
                {
                    await this.checkTokenInfoStorage();
                }

                if(tryCount > 10)
                {
                    reject('To many tries to generate unique uuid!');
                }
            }
        })
    }

    static _generateUUID()
    {
        let d = new Date().getTime();

        if (typeof performance !== 'undefined' && typeof performance.now === 'function')
        {
            d += performance.now();
        }
        // noinspection SpellCheckingInspection
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,(c) =>
        {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    async isTokenValid(token)
    {
        let authId = token[Const.Settings.CLIENT_AUTH_ID];
        let tokenId = token[Const.Settings.CLIENT_TOKEN_ID];

        if(tokenId !== undefined)
        {
            if(authId !== undefined)
            {
                return await this._isTokeWithAuthIdValid(tokenId,authId);
            }
            else
            {
                return await this._isTokenWithoutAuthIdValid(tokenId)
            }
        }
        else
        {
            return false;
        }
    }

    async createTokenInfo(expiry,authId)
    {

        if(authId !== undefined)
        {
            return await this._createAuthIdTokenInfo(authId,expiry);
        }
        else
        {
            return await  this._createWithoutAuthIdTokenInfo(expiry);
        }
    }

    async updateTokenInfo(oldToken,newToken)
    {
        if(oldToken[Const.Settings.CLIENT_AUTH_ID] !== newToken[Const.Settings.CLIENT_AUTH_ID])
        {
            let oldAuthId = oldToken[Const.Settings.CLIENT_AUTH_ID];
            let oldTokenId = oldToken[Const.Settings.CLIENT_TOKEN_ID];
            await this.blockToken(oldTokenId,oldAuthId);
            let newAuthId = newToken[Const.Settings.CLIENT_AUTH_ID];
            newToken[Const.Settings.CLIENT_TOKEN_ID] = await this.createTokenInfo(newToken['exp'],newAuthId);
        }

        return newToken;
    }

    async blockToken(tokenId,authId)
    {
        return await this._setTokenInfo(Const.Settings.TOKEN_INFO_IS_BLOCKED,true,tokenId,authId,true);
    }

    async setLastActivity(token)
    {
        let authId = token[Const.Settings.CLIENT_AUTH_ID];
        let tokenId = token[Const.Settings.CLIENT_TOKEN_ID];
        return await this._setTokenInfo(Const.Settings.TOKEN_INFO_LAST_ACTIVITY,Date.now(),tokenId,authId,true);
    }

    async getLastActivity(token)
    {
        let authId = token[Const.Settings.CLIENT_AUTH_ID];
        let tokenId = token[Const.Settings.CLIENT_TOKEN_ID];
        return await this.getTokenInfo(Const.Settings.TOKEN_INFO_LAST_ACTIVITY,tokenId,authId);
    }

    async setTokenInfo(key,value,tokenId,authId)
    {
        return await this._setTokenInfo(key,value,tokenId,authId,false);
    }

    async _setTokenInfo(key,value,tokenId,authId,ignoreZationData = false)
    {
        if(ignoreZationData ||
            (key !== Const.Settings.TOKEN_INFO_LAST_ACTIVITY && key !== Const.Settings.TOKEN_INFO_EXPIRE &&
            key !== Const.Settings.TOKEN_INFO_IS_BLOCKED))
        {
            if(authId !== undefined)
            {
                let req = this._buildDoInAuthId(authId,this._as.buildDo(tokenId,this._as.buildSet(key,value)));
                return await this._as.send(req);
            }
            else
            {
                let req = this._buildDoInWithoutId(this._as.buildDo(tokenId,this._as.buildSet(key,value)));
                return await this._as.send(req);
            }
        }
        else
        {
            throw new TaskError(MainErrors.zationKeyConflict,{key : key});
        }
    }

    async getTokenInfo(key,tokenId,authId)
    {
        if(authId !== undefined)
        {
            let isThere = await this._as.send(this._buildDoInAuthId(authId,this._as.buildCanDo(tokenId)));
            if(isThere !== undefined && !isThere)
            {
                let req = this._buildDoInAuthId(authId,this._as.buildDo(tokenId,this._as.buildGet(key)));
                return await this._as.send(req);
            }
            else
            {
                return undefined;
            }
        }
        else
        {
            let isThere = await this._as.send(this._buildDoInWithoutId(this._as.buildCanDo(tokenId)));
            if(isThere !== undefined && !isThere)
            {
                let req = this._buildDoInWithoutId(this._as.buildDo(tokenId,this._as.buildGet(key)));
                return await this._as.send(req);
            }
            else
            {
                return undefined;
            }
        }
    }

    async _forEachUser(func)
    {
        let users = await this._as.send(this._buildDoInWithId(this._as.buildGet()));
        for(let userId in users)
        {
            if(users.hasOwnProperty(userId))
            {
                await func(userId);
            }
        }
    }

    async checkTokenInfoStorage()
    {
        let promises = [];
        let timeStamp = Math.floor(Date.now() / 1000);
        //check with AuthId
        await this._forEachUser(async(id) =>
        {
            let userTokens = await this._as.send(this._buildDoInAuthId(id,this._as.buildGet()));
            for(let tokenId in userTokens)
            {
                if(userTokens.hasOwnProperty(tokenId))
                {
                    let req = this._buildDoInAuthId(id,this._as.buildDo(tokenId,this._as.buildGet()));
                    let token = await this._as.send(req);

                    if(TokenInfoStorage._isExpireInfoToken(token,timeStamp))
                    {
                        promises.push(this._as.send(this._buildDoInAuthId(id,this._as.buildRemove(tokenId))));
                    }
                }
            }
        });

        //check without AuthId
        let tokensWithOutId = await this._as.send(this._buildDoInWithoutId(this._as.buildGet()));
        for(let tokenId in tokensWithOutId)
        {
            if(tokensWithOutId.hasOwnProperty(tokenId))
            {
                let req = this._buildDoInWithoutId(this._as.buildDo(tokenId,this._as.buildGet()));
                let token = await this._as.send(req);

                if(TokenInfoStorage._isExpireInfoToken(token,timeStamp))
                {
                    promises.push(this._as.send(this._buildDoInWithoutId(this._as.buildRemove(tokenId))));
                }
            }
        }
        await Promise.all(promises);
        return promises.length;
    }

    static _isExpireInfoToken(token,timeStamp)
    {
        let tokenExp = token[Const.Settings.TOKEN_INFO_EXPIRE];
        return timeStamp >= tokenExp;
    }

    static _isBlocked(token)
    {
        return token[Const.Settings.TOKEN_INFO_IS_BLOCKED];
    }

    static _isInTime(token,checkValue)
    {
        let lastActivity = token[Const.Settings.TOKEN_INFO_LAST_ACTIVITY];
        return lastActivity >= checkValue;
    }

    static _isActive(token,timeStamp)
    {
        return !TokenInfoStorage._isBlocked(token) && !TokenInfoStorage._isExpireInfoToken(timeStamp);
    }

    static _isOnline(token,checkValue,timeStamp)
    {
        return TokenInfoStorage._isActive(token,timeStamp) && TokenInfoStorage._isInTime(token,checkValue);
    }

    async onlineUserCount(lastMs = 600000)
    {
        let count = 0;
        let checkValue = Date.now() - lastMs;
        let timeStamp = Math.floor(Date.now() / 1000);

        await this._forEachUser(async (id) =>
        {
            let userTokens = await this._as.send(this._buildDoInAuthId(id,this._as.buildGet()));
            for(let tokenId in userTokens)
            {
                if(userTokens.hasOwnProperty(tokenId))
                {
                    let req = this._buildDoInAuthId(id,this._as.buildDo(tokenId,this._as.buildGet()));
                    let token = await this._as.send(req);

                    if(TokenInfoStorage._isOnline(token,checkValue,timeStamp))
                    {
                        count++;
                        break;
                    }
                }
            }
        });
        return count;
    }

    async userOnlineTokenCount(id,lastMs = 600000)
    {
        let count = 0;
        let checkValue = Date.now() - lastMs;
        let timeStamp = Math.floor(Date.now() / 1000);

        let req = this._buildDoInAuthId(id,this._as.buildGet());
        let tokens = await this._as.send(req);
        for(let tokenId in tokens)
        {
            if(tokens.hasOwnProperty(tokenId))
            {
                let req = this._buildDoInAuthId(id,this._as.buildDo(tokenId,this._as.buildGet()));
                let token = await this._as.send(req);

                if(TokenInfoStorage._isOnline(token,checkValue,timeStamp))
                {
                    count++;
                }
            }
        }
        return count;
    }

    async tokensWithIdCount()
    {
        let count = 0;
        await this._forEachUser(async(id) =>
        {
            let userTokens = await this._as.send(this._buildDoInAuthId(id,this._as.buildGet()));
            for(let tokenId in userTokens)
            {
                if(userTokens.hasOwnProperty(tokenId))
                {
                    count++;
                }
            }
        });
        return count;
    }

    async tokensWithoutIdCount()
    {
        let count = 0;
        let tokensWithOutId = await this._as.send(this._buildDoInWithoutId(this._as.buildGet()));
        for(let tokenId in tokensWithOutId)
        {
            if(tokensWithOutId.hasOwnProperty(tokenId))
            {
               count++;
            }
        }
        return count;
    }

    async userCount()
    {
        let count = 0;
        await this._forEachUser(() =>
        {
            count++;
        });
        return count;
    }

}

module.exports = TokenInfoStorage;