/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Result          = require('../../api/Result');
const TaskError       = require('../../api/TaskError');
const TaskErrorBag    = require('../../api/TaskErrorBag');
const Const           = require('../constants/constWrapper');
const Logger          = require('./../logger/logger');
const MainErrors      = require('../zationTaskErrors/mainTaskErrors');

class Returner
{

    constructor(data)
    {
        this._isSocket = data['isSocket'];
        this._respond  = data['respond'];
        this._res      = data['res'];
        this._zc       = data['zc'];
        this._reqId    = data['reqId'];

        this._sendErrorDesc = this._zc.getMain(Const.Main.KEYS.SEND_ERRORS_DESC);
    }

    async reactOnResult(data)
    {
        if(data !== undefined)
        {
            this._sendBack(await this._createResult(data.result,data.tb));
        }
        else
        {
            this._endRequest();
        }
    }

    async reactOnError(err,tb)
    {
        let errors;

        if(err instanceof TaskError)
        {
            errors = [err.getJsonObj(this._sendErrorDesc || this._zc.isDebug())];
        }
        else if(err instanceof TaskErrorBag)
        {
            errors = err.getJsonObj(this._sendErrorDesc || this._zc.isDebug());
        }
        else
        {
            let error = new TaskError(MainErrors.unknownSystemError);
            errors = [error.getJsonObj()];
        }

        this._sendBack(await this._createResult('',tb,errors));
    }


    //End the request
    _endRequest()
    {
        if(this._isSocket)
        {
            this._respond();
        }
    }

    //Log and send back Json
    _sendBack(resObj)
    {
        if(this._isSocket)
        {
            Logger.printDebugInfo(`Socket Result id: ${this._reqId} ->`,resObj,true);

            this._respond(null,resObj);
        }
        else
        {
            Logger.printDebugInfo(`Http Result id: ${this._reqId} ->`,resObj,true);

            this._res.write(JSON.stringify(resObj));
            this._res.end();
        }
    }

    async _createResult(res,tb,errors = [])
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
        if(tb !== undefined && !this._isSocket && tb.hasNewToken())
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

module.exports = Returner;