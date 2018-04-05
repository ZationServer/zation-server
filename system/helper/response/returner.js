/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Result          = require('../../api/Result');
const TaskError       = require('../../api/TaskError');
const TaskErrorBag    = require('../../api/TaskErrorBag');
const Const           = require('../constante/constWrapper');
const SyErrors        = require('../zationTaskErrors/systemTaskErrors');

class Returner
{

    constructor(data)
    {
        this._isSocket = data['isSocket'];
        this._respond  = data['respond'];
        this._res      = data['res'];
        this._req      = data['req'];
        this._zc       = data['zc'];
        this._reqId    = data['reqId'];

        this.sendErrorDesc = this._zc.getMain(Const.Main.SEND_ERRORS_DESC);
    }

    getResultAndReact(data)
    {
        if(data !== undefined)
        {
            this._sendBack(Returner._createResult(data.result,data.authData));
        }
    }

    _sendBack(resObj)
    {
        if(this._isSocket)
        {
            this._zc.printDebugInfo(`ZATION RETURN SOCKET REQUEST RESULT: ${this._reqId} ->`,resObj);

            this._respond(null,resObj);
        }
        else
        {
            this._zc.printDebugInfo(`ZATION RETURN HTTP REQUEST RESULT: ${this._reqId} ->`,resObj);

            this._res.write(JSON.stringify(resObj));
            this._res.end();
        }
    }

    static _createResult(res,authData,errors = [])
    {
        let obj = {};
        if(res instanceof Result)
        {
            obj['r'] = res._getJsonObj();
        }
        else
        {
            obj['r'] = {};
        }

        obj['e'] = errors;

        if(authData !== undefined) {
            let authObj = {};
            if(authData['newAuthId'] !== undefined)
            {
                authObj['newAuthId'] = authData['newAuthId'];
            }
            if(authData['newAuthGroup'] !== undefined)
            {
                authObj['newAuthGroup'] = authData['newAuthGroup'];
            }
            obj['a'] = authObj;
        }

        obj['s'] = errors.length === 0;

        return obj;
    }

    reactOnError(err,authData)
    {
        let errors;

        if(err instanceof TaskError)
        {
            errors = [err._getJsonObj(this.sendErrorDesc || this._zc.isDebug())];
        }
        else if(err instanceof TaskErrorBag)
        {
            errors = err._getJsonObj(this.sendErrorDesc || this._zc.isDebug());
        }
        else
        {
            let info = {};

            if(this._zc.isDebug())
            {
                info['info'] = err.toString();
            }

            let error = new TaskError(SyErrors.unknownSystemError,info);

            errors = [error._getJsonObj()];
        }

        this._sendBack(Returner._createResult('',authData,errors));
    }


}

module.exports = Returner;