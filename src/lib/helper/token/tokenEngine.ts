/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TokenTools     = require('./tokenTools');
import Const          = require('../constants/constWrapper');
import ChAccessEngine = require('../channel/chAccessEngine');
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
        let defaultExp = this.zc.getMain(Const.Main.KEYS.AUTH_DEFAULT_EXPIRY);
        return Math.floor(Date.now() / 1000) +  defaultExp;
    }

    //to create a new Token
    async createToken(data : object) : Promise<boolean>
    {
        /*
        if(this.zc.isUseTokenInfoTempDb())
        {
            let expiry = this.generateExpiry();
            let remoteAddress = this.shBridge.getPublicRemoteAddress();
            let tempDbUp = this.worker.getTempDbUp();

            let userId = data[Const.Settings.CLIENT.USER_ID];
            let authUserGroup = data[Const.Settings.CLIENT.AUTH_USER_GROUP];

            let tokenId = await tempDbUp.createTokenInfo(expiry,remoteAddress,authUserGroup,userId);

            data[Const.Settings.CLIENT.EXPIRE] = expiry;
            data[Const.Settings.CLIENT.TOKEN_ID] = tokenId;
        }
        */

        return TokenTools.createNewToken(data,this.shBridge.getTokenBridge(),this.worker);
    }

    //For update the token
    async setTokenVariable(data : object,zationAllow : boolean = false) : Promise<boolean>
    {
        if(zationAllow)
        {
            return await TokenTools.setZationData(data,this.shBridge.getTokenBridge(),this,this.worker);
        }
        else
        {
            return await TokenTools.setTokenVariable(data,this.shBridge.getTokenBridge(),this.worker);
        }
    }

    //getATokenVariable
    getTokenVariable(key : any) : any
    {
        return TokenTools.getTokenVariable(key,this.shBridge.getTokenBridge());
    }

    async deauthenticate(token : object) : Promise<void>
    {
        //blockToken
        if(this.zc.isExtraSecureAuth())
        {
            let tokenId = token[Const.Settings.CLIENT.TOKEN_ID];
            await this.worker.getTempDbUp().blockTokenId(tokenId);
        }

        //disconnect all sockets with tokenId
        if(!!token && !!token[Const.Settings.CLIENT.TOKEN_ID])
        {
            this.worker
                .getPreparedSmallBag()
                .disconnectToken(token[Const.Settings.CLIENT.TOKEN_ID]);
        }
    }

    getWorker() : ZationWorker
    {
        return this.worker;
    }
}

export = TokenEngine;