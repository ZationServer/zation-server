/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const SystemBackgroundTasks = require('./../background/systemBackgroundTasks');
const Const                 = require('./../constante/constWrapper');

class TokenInfoStorage
{
    async constructor(abstractStorage)
    {
        this._as = abstractStorage;
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

    _buildDoInUserId(id,req)
    {
        return this._buildDoInWithId(this._as.buildDo(id,req));
    }

    async _isUserIdIn(id)
    {
        return await this._as.send(this._buildDoInWithId(this._as.buildCanDo(id)));
    }

    async _createUserId(id)
    {
        return await this._as.send(this._buildDoInWithId(this._as.buildSet(id)));
    }

    async _createUserTokenInfo(userId,expire)
    {
        let isUserIn = await this._isUserIdIn(userId);

        let buildDo = (req) =>
        {
            this._buildDoInUserId(userId,req);

        };

        if(isUserIn)
        {
            await this._createTokenInfo(buildDo,expire);
        }
        else
        {
            await this._createUserId();
            await this._createTokenInfo(buildDo,expire);
        }
    }

    async _createTokenInfo(buildDo,expire)
    {
        let uuid = await TokenInfoStorage._generateUniqueUuidIn(async(uuid) =>
        {
            return await this._as.send(buildDo(this._as.buildCanDo(uuid)));
        });

        await this._as.send(buildDo(this._as.buildDo(uuid,this._as.buildSet())))



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

    async setUserTokenInfo(userId,tokenId,overwrite = true)
    {

    }

    async setTokenInfo(tokenId,overwrite = true)
    {


    }



}

module.exports = TokenInfoStorage;