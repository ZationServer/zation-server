/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TokenTools     = require('./tokenTools');
import Const          = require('../constants/constWrapper');
import SHBridge       = require("../bridges/shBridge");
import ZationWorker   = require("../../main/zationWorker");
import ZationConfig   = require("../../main/zationConfig");

class TokenEngine
{
    private readonly shBridge : SHBridge;
    private readonly worker : ZationWorker;
    private readonly zc : ZationConfig;
    
    constructor(shBridge,worker,zc)
    {
        this.shBridge = shBridge;
        this.worker = worker;
        this.zc = zc;
    }

    private generateExpiry() : number
    {
        const defaultExp = this.zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY);
        return Math.floor(Date.now() / 1000) +  defaultExp;
    }

    //to create a new Token
    async createToken(data : object) : Promise<boolean>
    {
        const tswClient = this.worker.getTSWClient();

        const expiry = this.generateExpiry();
        const remoteAddress = this.shBridge.getPublicRemoteAddress();
        const userId = data[Const.Settings.CLIENT.USER_ID];
        const authUserGroup = data[Const.Settings.CLIENT.AUTH_USER_GROUP];

        const tokenId = await tswClient.saveTokenInfo(expiry,remoteAddress,authUserGroup,userId);

        data[Const.Settings.CLIENT.EXPIRE] = expiry;
        data[Const.Settings.CLIENT.TOKEN_ID] = tokenId;

        return TokenTools.createNewToken(data,this.shBridge.getTokenBridge(),this.worker);
    }

    async removeToken(token : object) : Promise<void>
    {
        if(!!token && !!token[Const.Settings.CLIENT.TOKEN_ID])
        {
            const tokenId = token[Const.Settings.CLIENT.TOKEN_ID];

            //block oldToken in tempStorage
            if(this.zc.isExtraSecureAuth()) {
                await this.worker
                    .getTSWClient()
                    .blockTokenId(tokenId);
            }

            //disconnect all sockets with tokenId
            await this.worker
                .getPreparedSmallBag()
                .disconnectToken(tokenId);
        }
    }

    async updateTokenVariable(data : object) : Promise<boolean>
    {
        return true;
    }

    //getATokenVariable
    getTokenVariable(key : any) : any {
        return TokenTools.getTokenVariable(key,this.shBridge.getTokenBridge());
    }

    getCustomTokenVar() : object {
        return this.getTokenVariable(Const.Settings.CLIENT.CUSTOM_VARIABLES);
    }

    async setCustomTokenVar(data : object) : Promise<void>
    {

    }
}

export = TokenEngine;