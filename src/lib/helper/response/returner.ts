/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Result          = require('../../api/Result');
import TaskError       = require('../../api/TaskError');
import TaskErrorBag    = require('../../api/TaskErrorBag');
import Logger          = require('../logger/logger');
import MainErrors      = require('../zationTaskErrors/mainTaskErrors');
import ZationConfig    = require("../../main/zationConfig");
import TokenBridge     = require("../bridges/tokenBridge");
import {ZationResponse} from "../constants/internal";

class Returner
{

    private readonly webSocket : boolean;
    private readonly respond  : any;
    private readonly res      : any;
    private readonly zc       : ZationConfig;
    private readonly reqId    : string;
    private readonly sendErrorDesc : boolean;
    
    constructor({isWebSocket,respond,res,reqId},zc : ZationConfig) {
        this.webSocket  = isWebSocket;
        this.respond    = respond;
        this.res        = res;
        this.zc         = zc;
        this.reqId      = reqId;
        this.sendErrorDesc = !!this.zc.mainConfig.sendErrorDescription;
    }

    async reactOnResult(data : any) : Promise<void>
    {
        if(data !== undefined) {
            this.sendBack(await this.createResult(data.result,data.tb));
        }
        else {
            this.endRequest();
        }
    }

    async reactOnError(err : any,tb : TokenBridge) : Promise<void>
    {
        let errors;

        if(err instanceof TaskError)
        {
            errors = [err._getJsonObj(this.sendErrorDesc || this.zc.isDebug())];
        }
        else {
            // noinspection SuspiciousInstanceOfGuard
            if(err instanceof TaskErrorBag) {
                errors = err._getJsonObj(this.sendErrorDesc || this.zc.isDebug());
            }
            else {
                let error = new TaskError(MainErrors.unknownError);
                errors = [error._getJsonObj()];
            }
        }

        this.sendBack(await this.createResult('',tb,errors));
    }


    //End the request
    private endRequest() : void
    {
        if(this.webSocket)
        {
            this.respond();
        }
    }

    //Log and send back JsonConverter
    private sendBack(resObj : any) : void
    {
        if(this.webSocket)
        {
            Logger.printDebugInfo(`Socket Result id: ${this.reqId} ->`,resObj,true);

            this.respond(null,resObj);
        }
        else
        {
            Logger.printDebugInfo(`Http Result id: ${this.reqId} ->`,resObj,true);

            this.res.write(JSON.stringify(resObj));
            this.res.end();
        }
    }

    private async createResult(res : any,tb : TokenBridge,errors : any[] = []) : Promise<object>
    {
        const obj : ZationResponse = {
            r : res instanceof Result ? res._getJsonObj() : {},
            e : errors,
            s : errors.length === 0,
        };

        //token
        if(tb !== undefined && !this.webSocket && tb.isNewToken()) {
            obj.t = {
                st : await tb.getSignedToken(),
                pt : tb.getPlainToken()
            } ;
        }

        //info for http
        if(!this.webSocket && Array.isArray(this.res['zationInfo']) && this.res['zationInfo'].length > 0) {
            obj.zhi = this.res['zationInfo'];
        }

        return obj;
    }

}

export = Returner;