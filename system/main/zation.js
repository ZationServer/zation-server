/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TaskError       = require('./../api/TaskError');
const TaskErrorBag    = require('./../api/TaskErrorBag');
const Const           = require('../helper/constante/constWrapper');
const HttpProcessor   = require('./../helper/processor/httpProcessor');
const SocketProcessor = require('./../helper/processor/socketProcessor');
const Returner        = require('./../helper/response/returner');
const SmallBag        = require('./../api/SmallBag');

class Zation
{
    constructor(worker)
    {
        this._zc = worker.getZationConfig();
        this._worker = worker;
        this._httpReqCount = 0;
        this._socketReqCount = 0;
    }

    async run(data)
    {
        data.worker = this._worker;
        data.zc = this._zc;

        if(data.isSocket)
        {
            this._zc.printDebugInfo(`Socket request with id: ${this._worker.id}-${this._socketReqCount} ->`
                ,data.input);

            if(this._zc.isDebug() || this._zc.isUsePanel())
            {
                data.reqId = `${this._worker.id}-${this._socketReqCount}`;
                this._socketReqCount++;

                if(this._socketReqCount >= Number.MAX_SAFE_INTEGER)
                {
                    this._socketReqCount = 0;
                }
            }
        }
        else
        {
            this._zc.printDebugInfo(`Http request with id: ${this._worker.id}-${this._httpReqCount} ->`,
                data.req.body[Const.Main.POST_KEY_WORD]);

            if(this._zc.isDebug() || this._zc.isUsePanel())
            {
                data.reqId = `${this._worker.id}-${this._httpReqCount}`;
                this._httpReqCount++;

                if(this._httpReqCount >= Number.MAX_SAFE_INTEGER)
                {
                    this._httpReqCount = 0;
                }
            }
        }

        let returner = new Returner(data);

        try
        {
            if(data.isSocket)
            {
                returner.getResultAndReact(await SocketProcessor.runSocketProcess(data));
            }
            else
            {
                returner.getResultAndReact(await HttpProcessor.runHttpProcess(data));
            }
        }
        catch(data)
        {
            let e = data;

            if(data['authData'] !== undefined)
            {
                e = data['e'];
            }

            this._zc.emitEvent(Const.Event.ZATION_BEFORE_ERROR,
                (f) => {f(SmallBag.getSmallBagFromWorker(this._worker),e)});

            if(e instanceof  TaskError)
            {
                this._zc.emitEvent(Const.Event.ZATION_BEFORE_TASK_ERROR,
                    (f) => {f(SmallBag.getSmallBagFromWorker(this._worker),e)});
            }
            else if(e instanceof TaskErrorBag)
            {
                this._zc.emitEvent(Const.Event.ZATION_BEFORE_TASK_ERROR_BAG,
                    (f) => {f(SmallBag.getSmallBagFromWorker(this._worker),e)});
            }

            this._zc.printDebugWarning('EXCEPTION ON SERVER ->',e);

            returner.reactOnError(e,data['authData']);
        }
    }


}

module.exports = Zation;