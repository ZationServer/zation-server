/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                     = require('../constants/constWrapper');
const TempDbUp                  = require('./tempDbUp');

const LinvoDb                   = require('linvodb3');

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
        LinvoDb.dbPath = `${tempFolder}/${dbName}`;

        this._tokenInfoDb = new LinvoDb(Const.Settings.TEMP_DB_TOKEN_INFO_NAME,{});
        this._errorInfoDb = new LinvoDb(Const.Settings.TEMP_DB_ERROR_INFO_NAME,{});
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

        return await new Promise((resolve, reject) =>
        {
            // noinspection JSUnresolvedFunction
            this._tokenInfoDb.instert(tokenInfo,(err,t) =>
            {
                if(err) {reject(err);}
                else
                {
                    resolve(t._id);
                }
            });
        });
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

            // noinspection JSUnresolvedFunction
            await this._tokenInfoDb.update({_id : tokenId},{$set : updateObj},{multi : false}).exeAsync();
        }
    }

    async isTokenIdValid(tokenId)
    {
        if(tokenId !== undefined)
        {
            // noinspection JSUnresolvedFunction
            let tokenInfo = this._tokenInfoDb.findOne({_id : tokenId}).exeAsync();
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

        // noinspection JSUnresolvedFunction
        await this._tokenInfoDb.update({_id : tokenId},{$set : updateObj},{multi : false}).exeAsync();
    }

    async checkTokenInfoStorage()
    {
        let promises = [];
        let timeStamp = Math.floor(Date.now() / 1000);
        //check with AuthId

        let query = {};
        query[Const.Settings.TOKEN_INFO_EXPIRE] = { $lte : timeStamp};

        // noinspection JSUnresolvedFunction
        return await this._tokenInfoDb.remove(query,{multi : true}).exeAsync();
    }




}

module.exports = TempDbLevelDown;