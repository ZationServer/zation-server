/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig   = require("./zationConfig");
import TaskError       = require('../api/TaskError');
import TaskErrorBag    = require('../api/TaskErrorBag');
import Const           = require('../helper/constants/constWrapper');
import Logger          = require('../helper/logger/logger');
import HttpProcessor   = require('../helper/processor/httpProcessor');
import SocketProcessor = require('../helper/processor/socketProcessor');
import Returner        = require('../helper/response/returner');
import IdCounter       = require('../helper/tools/idCounter');
import ZationWorker    = require("./zationWorker");

class Zation
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;
    private reqIdCounter : IdCounter;
    
    constructor(worker)
    {
        this.zc = worker.getZationConfig();
        this.worker = worker;
        this.reqIdCounter = new IdCounter();
    }

    async run(data)
    {
        data.worker = this.worker;
        data.zc = this.zc;

        this.reqIdCounter.increase();
        let reqId = this.reqIdCounter.getId();

        let fullReqId = `${this.worker.getFullWorkerId()}-${reqId}`;

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

            if(this.zc.isDebug() || this.zc.isUsePanel())
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

            let promises : Promise<void>[] = [];

            promises.push(this.zc.emitEvent
            (Const.Event.ZATION_BEFORE_ERROR, this.worker.getPreparedSmallBag(),e));

            if(e instanceof  TaskError)
            {
                promises.push(this.zc.emitEvent
                (Const.Event.ZATION_BEFORE_TASK_ERROR,this.worker.getPreparedSmallBag(),e));
            }
            else { // noinspection SuspiciousInstanceOfGuard
                if(e instanceof TaskErrorBag)
                {
                    promises.push(this.zc.emitEvent
                    (Const.Event.ZATION_BEFORE_TASK_ERROR_BAG,this.worker.getPreparedSmallBag(),e));
                }
                else
                {
                    Logger.printDebugWarning('EXCEPTION ON SERVER ->',e);
                }
            }

            await Promise.all(promises);
            await returner.reactOnError(e,data['tb']);
        }
    }


}

export = Zation;