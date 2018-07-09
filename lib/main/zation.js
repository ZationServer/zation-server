/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TaskError       = require('./../api/TaskError');
const TaskErrorBag    = require('./../api/TaskErrorBag');
const Const           = require('../helper/constants/constWrapper');
const Logger          = require('./../helper/logger/logger');
const HttpProcessor   = require('./../helper/processor/httpProcessor');
const SocketProcessor = require('./../helper/processor/socketProcessor');
const Returner        = require('./../helper/response/returner');
const IdCounter       = require('./../helper/tools/idCounter');

class Zation
{
    constructor(worker)
    {
        this._zc = worker.getZationConfig();
        this._worker = worker;
        this._reqIdCounter = new IdCounter();
    }

    async run(data)
    {
        data.worker = this._worker;
        data.zc = this._zc;

        this._reqIdCounter.increase();
        let reqId = this._reqIdCounter.getId();

        let fullReqId = `${this._worker._getFullWorkerId()}-${reqId}`;

        if(data.isWebSocket)
        {
            Logger.printDebugInfo(`Socket Request id: ${fullReqId} -> `
                ,data.input,true);

            data.reqId = fullReqId;
        }
        else
        {
            let reqContent = data.req.body[Const.Main.KEYS.POST_KEY_WORD] !== undefined ?
                data.req.body[Const.Main.KEYS.POST_KEY_WORD] : 'Nothing in post key!';

            Logger.printDebugInfo(`Http Request id: ${fullReqId} -> `,
                reqContent,true);

            if(this._zc.isDebug() || this._zc.isUsePanel())
            {
                data.reqId = fullReqId;
            }
        }

        let returner = new Returner(data);

        try
        {
            if(data.isWebSocket)
            {
                await returner.reactOnResult(await SocketProcessor.runSocketProcess(data));
            }
            else
            {
                await returner.reactOnResult(await HttpProcessor.runHttpProcess(data));
            }
        }
        catch(data)
        {
            let e = data;

            if(data['tb'] !== undefined)
            {
                e = data['e'];
            }

            this._zc.emitEvent(Const.Event.ZATION_BEFORE_ERROR,
                (f) => {f(this._worker._preapreSmallBag,e)});

            if(e instanceof  TaskError)
            {
                this._zc.emitEvent(Const.Event.ZATION_BEFORE_TASK_ERROR,
                    (f) => {f(this._worker._preapreSmallBag,e)});
            }
            else if(e instanceof TaskErrorBag)
            {
                this._zc.emitEvent(Const.Event.ZATION_BEFORE_TASK_ERROR_BAG,
                    (f) => {f(this._worker._preapreSmallBag,e)});
            }
            else
            {
                Logger.printDebugWarning('EXCEPTION ON SERVER ->',e);
            }


            await returner.reactOnError(e,data['tb']);
        }
    }


}

module.exports = Zation;