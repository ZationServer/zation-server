/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                     = require('../constants/constWrapper');
import TempDbUp                  = require('./tempDbUp');
import MemoryMasterBridge        = require('../bridges/memoryMasterBridge');
import ZationWorker              = require("../../main/zationWorker");
import ZationConfig              = require("../../main/zationConfig");

const TOKEN_INFO_DB              = Const.Settings.TEMP_DB.TOKEN_INFO_NAME;
//const ERROR_INFO_DB              = Const.Settings.TEMP_DB.ERROR_INFO_NAME;

class TempDbMemoryDown implements TempDbUp
{
    private readonly worker : ZationWorker;
    private readonly zc : ZationConfig;
    private db : MemoryMasterBridge;

    constructor(worker,zc)
    {
        this.worker = worker;
        this.zc = zc;
    }

    async init() : Promise<void>
    {
        this.db = new MemoryMasterBridge(this.worker);
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

        let res = await this.db.insert(TOKEN_INFO_DB,tokenInfo);
        return res._id;
    }

    async updateTokenInfo(token : object) : Promise<any>
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

            await this.db.update(TOKEN_INFO_DB,{_id : tokenId},{$set : updateObj},{multi : false});
        }
    }

    async isTokenUnblocked(tokenId : any) : Promise<boolean>
    {
        if(tokenId !== undefined)
        {
            let tokenInfo = await this.db.findOne(TOKEN_INFO_DB,{_id : tokenId});
            return tokenInfo !== null && !tokenInfo[Const.Settings.TOKEN_INFO.IS_BLOCKED];
        }
        else
        {
            return false;
        }
    }

    async blockTokenId(tokenId : any) : Promise<any>
    {
        let updateObj = {};
        updateObj[Const.Settings.TOKEN_INFO.IS_BLOCKED] = true;
        await this.db.update(TOKEN_INFO_DB,{_id : tokenId},{$set : updateObj},{multi : false});
    }

    async checkTokenInfoDb() : Promise<any>
    {
        let timeStamp = Math.floor(Date.now() / 1000);
        //check with AuthId

        let query = {};
        query[Const.Settings.TOKEN_INFO.EXPIRE] = { $lte : timeStamp};

        // noinspection JSUnresolvedFunction
        return await this.db.remove(TOKEN_INFO_DB,query,{multi : true});
    }

    async checkErrorInfoDb() : Promise<number>
    {
        //TODO NOT IMPLEMENTED YET
        return 0;
    }

    async connectedTokenCount(id?: any): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async connectedUserCount(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async tokenConnected(tokenId: any): Promise<void> {
        //TODO NOT IMPLEMENTED YET
    }

    async tokenDisconnected(tokenId: any): Promise<void> {
        //TODO NOT IMPLEMENTED YET
    }

    async tokensWithIdCount(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async tokensWithoutIdCount(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

    async userCount(): Promise<number> {
        //TODO NOT IMPLEMENTED YET
        return 1;
    }

}

export = TempDbMemoryDown;