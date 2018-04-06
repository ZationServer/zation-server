/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const SystemBackgroundTasks     = require('../background/systemBackgroundTasks');
const Const                     = require('../constante/constWrapper');
const AbstractTokenInfoStorage  = require('./abstractTokenInfoStorage');

class TokenInfoStorage extends AbstractTokenInfoStorage
{
    constructor(abstractStorage)
    {
        super();
        this._as = abstractStorage;
    }

    async init()
    {
        await this._generateMainStructure();
    }

    async _generateMainStructure()
    {
        let canDoWithId = await this._as.send
        (
            this._as.buildCanDo(Const.Main.TOKEN_INFO_WITH_ID)
        );

        let canDoWithoutId = await this._as.send
        (
            this._as.buildCanDo(Const.Main.TOKEN_INFO_WITHOUT_ID)
        );

        if(!canDoWithId)
        {
            await this._as.send(this._as.buildSet(Const.Main.TOKEN_INFO_WITH_ID));
        }

        if(!canDoWithoutId)
        {
            await this._as.send(this._as.buildSet(Const.Main.TOKEN_INFO_WITHOUT_ID));
        }
    }

    _buildDoInWithId(req)
    {
        return this._as.buildDo(Const.Main.TOKEN_INFO_WITH_ID,req);
    }

    _buildDoInWithoutId(req)
    {
        return this._as.buildDo(Const.Main.TOKEN_INFO_WITHOUT_ID,req);
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
        await this.setTokenInfo(Const.Settings.TOKEN_INFO_EXPIRE,expire,uuid);

    }

    async _createAuthIdTokenInfo(authId,expire)
    {
        let isUserIn = await this._isAuthIdIn(authId);

        let buildDo = (req) =>
        {
            this._buildDoInAuthId(authId,req);
        };

        if(!isUserIn)
        {
            await this._createAuthId();
        }

        let uuid = await this._createTokenInfo(buildDo);
        await this.setTokenInfo(Const.Settings.TOKEN_INFO_EXPIRE,expire,uuid,authId);
        return uuid;
    }

    async _createTokenInfo(buildDo)
    {
        return await TokenInfoStorage._generateUniqueUuidIn(async(uuid) =>
        {
            return await this._as.send(buildDo(this._as.buildCanDo(uuid)));
        });
    }

    async _isTokeWithAuthIdValid(tokenId,authId)
    {
        let isThere = await this._as.send(this._buildDoInWithId(authId,this._as.buildCanDo(tokenId)));
        if(!isThere)
        {
            return false;
        }
        else
        {
            let req = this._buildDoInWithId(authId,this._as.buildDo(tokenId,this._as.buildGet()));
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
        let isBlocked = tokenInfo[Const.Settings.TOKEN_INFO_IS_BLOCKED];
        return isBlocked === undefined || (isBlocked !== undefined && !isBlocked);
    }

    static async _generateUniqueUuidIn(isThere)
    {
        return new Promise(async(resolve, reject) =>
        {
            let keyNotFound = true;
            let uuid = undefined;
            let tryCount = 0;

            while(keyNotFound)
            {
                tryCount++;
                uuid = TokenInfoStorage._generateUUID();
                let isAvailable = ! await isThere(uuid);

                if(isAvailable)
                {
                    keyNotFound = false;
                    resolve(uuid);
                }
                if(tryCount === 3)
                {
                    await SystemBackgroundTasks.checkTokenInfoStorage();
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
            if(authId === undefined)
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

    async createTokenInfo(expire,authId)
    {
        if(authId !== undefined)
        {
            return await this._createAuthIdTokenInfo(authId,expire);
        }
        else
        {
            return await  this._createWithoutAuthIdTokenInfo(expire);
        }
    }

    async setLastActivity(token)
    {
        let authId = token[Const.Settings.CLIENT_AUTH_ID];
        let tokenId = token[Const.Settings.CLIENT_TOKEN_ID];
        return await this.setTokenInfo(Const.Settings.TOKEN_LAST_ACTIVITY,Date.now(),tokenId,authId);
    }

    setTokenInfoForAuthIds(key,value,authIds,exceptTokenIds)
    {





    }

    async setTokenInfo(key,value,tokenId,authId)
    {
        if(authId !== undefined)
        {
            let isThere = await this._as.send(this._buildDoInAuthId(authId,this._as.buildCanDo(tokenId)));
            if(isThere !== undefined && !isThere)
            {
                let req = this._buildDoInAuthId(authId,this._as.buildDo(tokenId,this._as.buildSet(key,value)));
                return await this._as.send(req);
            }
            else
            {
                return false;
            }
        }
        else
        {
            let isThere = await this._as.send(this._buildDoInWithoutId(this._as.buildCanDo(tokenId)));
            if(isThere !== undefined && !isThere)
            {
                let req = this._buildDoInWithoutId(this._as.buildDo(tokenId,this._as.buildSet(key,value)));
                return await this._as.send(req);
            }
            else
            {
                return false;
            }
        }
    }
}

module.exports = TokenInfoStorage;