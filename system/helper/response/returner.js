const Result          = require('../../api/Result');
const TaskError       = require('../../api/TaskError');
const TaskErrorBag    = require('../../api/TaskErrorBag');
const CA              = require('../constante/settings');
const SyErrors        = require('../cationTaskErrors/systemTaskErrors');

class Returner
{

    constructor(data)
    {
        this.isSocket = data['isSocket'];
        this.respond  = data['respond'];
        this.res      = data['res'];
        this.req      = data['req'];
        this.userConfig = data['userConfig'];
        this.debug    = data['debug'];

        this.sendErrorDesc = this.userConfig[CA.START_CONFIG_SEND_ERRORS_DESC];

    }

    getResultAndReact({result,authData})
    {
        this.sendBack(Returner.createResult(result,authData));
    }

    sendBack(resObj)
    {
        if(this.debug)
        {
            console.log('\x1b[36m%s\x1b[0m', `CATION RETURN RESULT:\n ${JSON.stringify(resObj)}`);
        }

        if(this.isSocket)
        {
            this.respond(null,resObj);
        }
        else
        {
            this.res.write(JSON.stringify(resObj));
            this.res.end();
        }
    }

    static createResult(res,authData,errors = [])
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
            errors = [err._getJsonObj(this.sendErrorDesc || this.debug)];
        }
        else if(err instanceof TaskErrorBag)
        {
            errors = err._getJsonObj(this.sendErrorDesc || this.debug);
        }
        else
        {
            let info = {};

            if(this.debug)
            {
                info['info'] = err.toString();
            }

            let error = new TaskError(SyErrors.unknownSystemError,info);

            errors = [error._getJsonObj()];
        }

        this.sendBack(Returner.createResult('',authData,errors));
    }


}

module.exports = Returner;