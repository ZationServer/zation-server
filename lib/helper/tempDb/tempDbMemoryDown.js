/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                     = require('../constants/constWrapper');
const TempDbUp                  = require('./tempDbUp');
const MemoryMasterBridge        = require('./../bridges/memoryMasterBridge');

const TOKEN_INFO_DB             = Const.Settings.TEMP_DB.TOKEN_INFO_NAME;
const ERROR_INFO_DB             = Const.Settings.TEMP_DB.ERROR_INFO_NAME;

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

    async createTokenInfo(expire,remoteAddress,authUserGroup,userId)
    {
        let tokenInfo = {};
        tokenInfo[Const.Settings.TOKEN_INFO.EXPIRE] = expire;
        tokenInfo[Const.Settings.TOKEN_INFO.CREATED_REMOTE_ADDRESS] = remoteAddress;
        tokenInfo[Const.Settings.TOKEN_INFO.CONNECTION_STATE] = Const.Settings.TOKEN_INFO.CONNECTION_STATE_VALUES.CON;
        tokenInfo[Const.Settings.TOKEN_INFO.IS_BLOCKED] = false;
        tokenInfo[Const.Settings.TOKEN_INFO.AUTH_USER_GROUP] = authUserGroup;

        if(userId !== undefined)
        {
            tokenInfo[Const.Settings.TOKEN_INFO.USER_ID] = userId;
        }

        let res = await this._db.insert(TOKEN_INFO_DB,tokenInfo);
        return res._id;
    }

    async updateTokenInfo(token)
    {
        let tokenId = token[Const.Settings.CLIENT.TOKEN_ID];
        if(tokenId !== undefined)
        {
            let updateObj = {};

            for(let k in token)
            {
                if(token.hasOwnProperty(k))
                {
                    if (k === Const.Settings.CLIENT.EXPIRE)
                    {
                        updateObj[Const.Settings.TOKEN_INFO.EXPIRE] = tokenId[k];
                    }

                    if(k === Const.Settings.CLIENT.USER_ID)
                    {
                        updateObj[Const.Settings.TOKEN_INFO.USER_ID] = tokenId[k];
                    }

                    if(k === Const.Settings.CLIENT.AUTH_USER_GROUP)
                    {
                        updateObj[Const.Settings.TOKEN_INFO.AUTH_USER_GROUP] = tokenId[k];
                    }
                }
            }

            await this._db.update(TOKEN_INFO_DB,{_id : tokenId},{$set : updateObj},{multi : false});
        }
    }

    async isTokenUnblocked(tokenId)
    {
        if(tokenId !== undefined)
        {
            let tokenInfo = await this._db.findOne(TOKEN_INFO_DB,{_id : tokenId});
            return tokenInfo !== null && !tokenInfo[Const.Settings.TOKEN_INFO.IS_BLOCKED];
        }
        else
        {
            return false;
        }
    }

    async blockTokenId(tokenId)
    {
        let updateObj = {};
        updateObj[Const.Settings.TOKEN_INFO.IS_BLOCKED] = true;
        await this._db.update(TOKEN_INFO_DB,{_id : tokenId},{$set : updateObj},{multi : false});
    }

    async checkTokenInfoDb()
    {
        let timeStamp = Math.floor(Date.now() / 1000);
        //check with AuthId

        let query = {};
        query[Const.Settings.TOKEN_INFO.EXPIRE] = { $lte : timeStamp};

        // noinspection JSUnresolvedFunction
        return await this._db.remove(TOKEN_INFO_DB,query,{multi : true});
    }

    async checkErrorInfoDb()
    {
        //todo
        return 0;
    }

}

module.exports = TempDbMemoryDown;