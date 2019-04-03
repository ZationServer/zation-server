/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig    = require("./zationConfig");
import TaskError       = require('../api/TaskError');
import TaskErrorBag    = require('../api/TaskErrorBag');
import Logger          = require('../helper/logger/logger');
import HttpProcessor   = require('../helper/processor/httpProcessor');
import SocketProcessor = require('../helper/processor/socketProcessor');
import Returner        = require('../helper/response/returner');
import IdCounter       = require('../helper/tools/idCounter');
import ZationWorker    = require("./zationWorker");
import CodeError       = require("../helper/error/codeError");
import MainProcessor   = require("../helper/processor/mainProcessor");

class Zation
{
    private readonly zc : ZationConfig;
    private readonly worker : ZationWorker;
    private reqIdCounter : IdCounter;
    private readonly reqIdPreFix : string;
    private readonly mainProcessor : MainProcessor;
    
    constructor(worker)
    {
        this.zc = worker.getZationConfig();
        this.worker = worker;
        this.reqIdCounter = new IdCounter();
        this.mainProcessor = this.worker.getMainProcessor();
        this.reqIdPreFix = `${this.worker.options.instanceId}-${this.worker.getFullWorkerId()}-`;
    }

    async run(data)
    {
        this.reqIdCounter.increase();

        // scalable unique id for every req based on instanceId-workerId-time/count
        data.reqId = this.reqIdPreFix + this.reqIdCounter.getId();

        const returner = new Returner(data,this.zc);

        let shBridge;

        try {
            if(data.isWebSocket) {
                //checks request and returns shBridge
                shBridge = await SocketProcessor.runSocketProcess(data.socket,data.input,data.respond,this.zc,this.worker,data.reqId);
                await returner.reactOnResult((await this.mainProcessor.process(shBridge)));
            }
            else {
                //checks request and returns shBridge
                shBridge = await HttpProcessor.runHttpProcess(data.req,data.res,this.zc,this.worker,data.reqId);
                await returner.reactOnResult((await this.mainProcessor.process(shBridge)));
            }
        }
        catch(e)
        {
            const promises : Promise<void>[] = [];

            promises.push(this.zc.emitEvent
            (this.zc.eventConfig.beforeError, this.worker.getPreparedSmallBag(),e));

            if(e instanceof  TaskError)
            {
                if(e instanceof CodeError) {
                    Logger.printDebugWarning(`Code error -> ${e.toString()}/n stack-> ${e.stack}`);
                    promises.push(this.zc.emitEvent
                    (this.zc.eventConfig.beforeCodeError,this.worker.getPreparedSmallBag(),e));
                    if(this.zc.mainConfig.logCodeErrors){
                        Logger.logFileError(`Code error -> ${e.toString()}/n stack-> ${e.stack}`);
                    }
                }

                promises.push(this.zc.emitEvent
                (this.zc.eventConfig.beforeTaskError,this.worker.getPreparedSmallBag(),e));
            }
            else { // noinspection SuspiciousInstanceOfGuard
                if(e instanceof TaskErrorBag) {
                    promises.push(this.zc.emitEvent
                    (this.zc.eventConfig.beforeTaskErrorBag,this.worker.getPreparedSmallBag(),e));
                }
                else {
                    Logger.printDebugWarning('EXCEPTION ON SERVER ->',e);
                    if(this.zc.mainConfig.logServerErrors){
                        Logger.logFileError(`Exception on server -> ${e.stack}`);
                    }
                }
            }

            await Promise.all(promises);
            await returner.reactOnError(e,shBridge);
        }
    }


}

export = Zation;