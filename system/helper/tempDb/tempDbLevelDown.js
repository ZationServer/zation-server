/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                     = require('../constante/constWrapper');
const TaskError                 = require('../../api/TaskError');
const MainErrors                = require('../zationTaskErrors/mainTaskErrors');
const TempDbUp                  = require('./tempDbUp');
const UUID                      = require('./../tools/uuid');

const level                     = require('level');
const subLevel                  = require('level-sublevel');
const levelObj                  = require('level-object');

const tempFolder                = __dirname + '/../../temp';

class TempDbLevelDown extends TempDbUp
{
    constructor(zc)
    {
        super();
        this._zc = zc;
    }

    async init()
    {
        const dbName = this._zc.getMain(Const.Main.TEMP_DB_Name);
        this._db = subLevel(level(`${tempFolder}/${dbName}`,{valueEncoding : 'json'}));

        this._tokenInfoDb =  levelObj(this._db.sublevel(Const.Settings.TEMP_DB_TOKEN_INFO_NAME));
        this._errorInfoDb =  levelObj(this._db.sublevel(Const.Settings.TEMP_DB_ERROR_INFO_NAME));
    }

    async createTokenInfo(expire,remoteAddress,authGroup,authId)
    {
        let uuid = await this._generateUniqueUuidIn((uuid) =>
        {
            return this._get(this._tokenInfoDb,uuid) !== null;
        });

        let promises = [];

        promises.push(this._setTokenInfo(uuid,Const.Settings.TOKEN_INFO_EXPIRE,expire,true));

        promises.push(this._setTokenInfo(uuid,Const.Settings.TOKEN_INFO_CREATED_REMOTE_ADDRESS,remoteAddress,true));

        promises.push(this._setTokenInfo(uuid,Const.Settings.TOKEN_INFO_CONNECTION_STATE,
            Const.Settings.TOKEN_INFO_CONNECTION_STATE_CON,true));

        promises.push(this._setTokenInfo(uuid,Const.Settings.TOKEN_INFO_IS_BLOCKED,false,true));

        promises.push(this._setTokenInfo(uuid,Const.Settings.TOKEN_INFO_AUTH_GROUP,authGroup,true));

        if(authId !== undefined)
        {
            promises.push(this._setTokenInfo(uuid,Const.Settings.TOKEN_INFO_AUTH_ID,authId,true));
        }

        await Promise.all(promises);
    }

    async updateTokenInfo(token)
    {
        let tokenId = token[Const.Settings.CLIENT_TOKEN_ID];
        if(tokenId !== undefined)
        {
            let promises = [];

            for(let k in token)
            {
                if(token.hasOwnProperty(k))
                {
                    if (k === Const.Settings.CLIENT_EXPIRE)
                    {
                        promises.push
                        (this._set(this._setTokenInfo(),tokenId,Const.Settings.TOKEN_INFO_EXPIRE,token[k]));
                    }

                    if(k === Const.Settings.CLIENT_AUTH_ID)
                    {
                        promises.push
                        (this._set(this._setTokenInfo(),tokenId,Const.Settings.TOKEN_INFO_AUTH_ID,token[k]));
                    }

                    if(k === Const.Settings.CLIENT_AUTH_GROUP)
                    {
                        promises.push
                        (this._set(this._setTokenInfo(),tokenId,Const.Settings.TOKEN_INFO_AUTH_GROUP,token[k]));
                    }
                }
            }

            await Promise.all(promises);
        }
    }

    async isTokenIdValid(tokenId)
    {
        if(tokenId !== undefined)
        {
            let tokenInfo = this._get(this._tokenInfoDb,tokenId);
            return !tokenInfo[Const.Settings.TOKEN_INFO_IS_BLOCKED];
        }
        else
        {
            return false;
        }
    }

    async blockTokenId(tokenId)
    {
        await this._set(this._setTokenInfo(),tokenId,Const.Settings.TOKEN_INFO_IS_BLOCKED,true);
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

                    if(TempDbMongoDown._isExpireInfoToken(token,timeStamp))
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

                if(TempDbMongoDown._isExpireInfoToken(token,timeStamp))
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

    async _setTokenInfo(tokenId,key,value,ignoreZationData = false)
    {
        if
        (    ignoreZationData ||
            (
                key !== Const.Settings.TOKEN_INFO_AUTH_ID &&
                key !== Const.Settings.TOKEN_INFO_EXPIRE &&
                key !== Const.Settings.TOKEN_INFO_IS_BLOCKED &&
                key !== Const.Settings.TOKEN_INFO_CONNECTION_STATE &&
                key !== Const.Settings.TOKEN_INFO_CREATED_REMOTE_ADDRESS
            )
        )
        {
            await this._set(this._tokenInfoDb,tokenId,key,value);
        }
        else
        {
            throw new TaskError(MainErrors.zationKeyConflict,{key : key});
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
                uuid = UUID.generateUUID();

                let isAvailable = ! (await isThere(uuid));

                if(isAvailable)
                {
                    keyNotFound = false;
                    resolve(uuid);
                }
                if(tryCount === 3)
                {
                    await this.checkTokenInfoDb();
                }

                if(tryCount > 10)
                {
                    reject('To many tries to generate unique uuid!');
                }
            }
        })
    }

    _set(db,name,key,value)
    {
        return new Promise((resolve, reject) =>
        {
            db.set(name,key,value,(err) =>
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            });
        });
    }

    _get(db,name)
    {
        return new Promise((resolve, reject) =>
        {
            db.toJSON(name, function (err, value)
            {
                if(err) {
                    if (err['notFound']) {
                        resolve(null);
                    }
                    else {
                        reject(err);
                    }
                }
                else {
                    resolve(value);
                }
            });
        });
    }

}

module.exports = TempDbLevelDown;