/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                     = require('../constants/constWrapper');
const TempDbUp                  = require('./tempDbUp');
const MemoryMasterBridge        = require('./../bridges/memoryMasterBridge');

const TOKEN_INFO_DB             = Const.Settings.TEMP_DB_TOKEN_INFO_NAME;
const ERROR_INFO_DB             = Const.Settings.TEMP_DB_ERROR_INFO_NAME;

class TempDbMemoryDown extends TempDbUp
{
    constructor(worker,zc)
    {
        super();
        this._worker = worker;
        this._zc = zc;
    }

    async init()
    {
        this._db = new MemoryMasterBridge(this._worker);
    }

    async createTokenInfo(expire,remoteAddress,authGroup,authId)
    {
        let tokenInfo = {};
        tokenInfo[Const.Settings.TOKEN_INFO_EXPIRE] = expire;
        tokenInfo[Const.Settings.TOKEN_INFO_CREATED_REMOTE_ADDRESS] = remoteAddress;
        tokenInfo[Const.Settings.TOKEN_INFO_CONNECTION_STATE] = Const.Settings.TOKEN_INFO_CONNECTION_STATE_CON;
        tokenInfo[Const.Settings.TOKEN_INFO_IS_BLOCKED] = false;
        tokenInfo[Const.Settings.TOKEN_INFO_AUTH_GROUP] = authGroup;

        if(authId !== undefined)
        {
            tokenInfo[Const.Settings.TOKEN_INFO_AUTH_ID] = authId;
        }

        let res = await this._db.insert(TOKEN_INFO_DB,tokenInfo);
        return res._id;
    }

    async updateTokenInfo(token)
    {
        let tokenId = token[Const.Settings.CLIENT_TOKEN_ID];
        if(tokenId !== undefined)
        {
            let updateObj = {};

            for(let k in token)
            {
                if(token.hasOwnProperty(k))
                {
                    if (k === Const.Settings.CLIENT_EXPIRE)
                    {
                        updateObj[Const.Settings.TOKEN_INFO_EXPIRE] = tokenId[k];
                    }

                    if(k === Const.Settings.CLIENT_AUTH_ID)
                    {
                        updateObj[Const.Settings.TOKEN_INFO_AUTH_ID] = tokenId[k];
                    }

                    if(k === Const.Settings.CLIENT_AUTH_GROUP)
                    {
                        updateObj[Const.Settings.TOKEN_INFO_AUTH_GROUP] = tokenId[k];
                    }
                }
            }

            await this._db.update(TOKEN_INFO_DB,{_id : tokenId},{$set : updateObj},{multi : false});
        }
    }

    async isTokenIdValid(tokenId)
    {
        if(tokenId !== undefined)
        {
            let tokenInfo = await this._db.findOne(TOKEN_INFO_DB,{_id : tokenId});
            return tokenInfo !== null && !tokenInfo[Const.Settings.TOKEN_INFO_IS_BLOCKED];
        }
        else
        {
            return false;
        }
    }

    async blockTokenId(tokenId)
    {
        let updateObj = {};
        updateObj[Const.Settings.TOKEN_INFO_IS_BLOCKED] = true;
        await this._db.update(TOKEN_INFO_DB,{_id : tokenId},{$set : updateObj},{multi : false});
    }

    async checkTokenInfoDb()
    {
        let timeStamp = Math.floor(Date.now() / 1000);
        //check with AuthId

        let query = {};
        query[Const.Settings.TOKEN_INFO_EXPIRE] = { $lte : timeStamp};

        // noinspection JSUnresolvedFunction
        return await this._db.remove(TOKEN_INFO_DB,query,{multi : true});
    }

}

module.exports = TempDbMemoryDown;