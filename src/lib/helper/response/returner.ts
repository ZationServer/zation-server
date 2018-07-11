/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Result          = require('../../api/Result');
import TaskError       = require('../../api/TaskError');
import TaskErrorBag    = require('../../api/TaskErrorBag');
import Const           = require('../constants/constWrapper');
import Logger          = require('../logger/logger');
import MainErrors      = require('../zationTaskErrors/mainTaskErrors');
import ZationConfig    = require("../../main/zationConfig");
import TokenBridge     = require("../bridges/tokenBridge");

class Returner
{

    private readonly webSocket : boolean;
    private readonly respond  : any;
    private readonly res      : any;
    private readonly zc       : ZationConfig;
    private readonly reqId    : string;
    private readonly sendErrorDesc : boolean;
    
    constructor(data)
    {
        this.webSocket  = data['isWebSocket'];
        this.respond    = data['respond'];
        this.res        = data['res'];
        this.zc         = data['zc'];
        this.reqId      = data['reqId'];

        this.sendErrorDesc = this.zc.getMain(Const.Main.KEYS.SEND_ERRORS_DESC);
    }

    async reactOnResult(data : any) : Promise<void>
    {
        if(data !== undefined)
        {
            this.sendBack(await this.createResult(data.result,data.tb));
        }
        else
        {
            this.endRequest();
        }
    }

    async reactOnError(err : any,tb : TokenBridge) : Promise<void>
    {
        let errors;

        if(err instanceof TaskError)
        {
            errors = [err.getJsonObj(this.sendErrorDesc || this.zc.isDebug())];
        }
        else {
            // noinspection SuspiciousInstanceOfGuard
            if(err instanceof TaskErrorBag)
                    {
                        errors = err.getJsonObj(this.sendErrorDesc || this.zc.isDebug());
                    }
                    else
                    {
                        let error = new TaskError(MainErrors.unknownSystemError);
                        errors = [error.getJsonObj()];
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

    //Log and send back Json
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
        let obj = {};

        //result
        if (res instanceof Result) {
            obj['r'] = res._getJsonObj();
        }
        else {
            obj['r'] = {};
        }

        //token
        if(tb !== undefined && !this.webSocket && tb.isNewToken())
        {
            let tokenInfo = {};
            tokenInfo['st'] = await tb.getSignedToken();
            tokenInfo['pt'] = tb.getPlainToken();
            obj['t'] = tokenInfo;
        }

        //error
        obj['e'] = errors;
        obj['s'] = errors.length === 0;

        return obj;
    }

}

export = Returner;