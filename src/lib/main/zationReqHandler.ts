/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker        = require("./zationWorker");
import Returner              from "../helper/response/returner";
import MainRequestProcessor  from "../helper/processor/mainRequestProcessor";
import SocketRequestProcessor       from "../helper/processor/socketRequestProcessor";
import HttpRequestProcessor         from "../helper/processor/httpRequestProcessor";
import ValidCheckProcessor   from "../helper/processor/validCheckProcessor";
import UpSocket                from "../helper/sc/socket";
import BackError             from "../api/BackError";
import BackErrorBag          from "../api/BackErrorBag";
import IdCounter             from "../helper/utils/idCounter";
import Logger                from "../helper/logger/logger";
import CodeError             from "../helper/error/codeError";
import FuncUtils             from "../helper/utils/funcUtils";
import ZationConfigFull    from "../helper/configManager/zationConfigFull";

export default class ZationReqHandler
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private reqIdCounter : IdCounter;

    private readonly reqIdPreFix : string;

    private readonly mainRequestProcessor : MainRequestProcessor;
    private readonly socketProcessor : SocketRequestProcessor;
    private readonly httpProcessor : HttpRequestProcessor;
    private readonly returner : Returner;


    constructor(worker)
    {
        this.zc = worker.getZationConfig();
        this.worker = worker;
        this.reqIdCounter = new IdCounter();

        const validCheckProcessor = new ValidCheckProcessor(this.zc,worker);
        this.mainRequestProcessor = new MainRequestProcessor(this.zc,worker,validCheckProcessor);
        this.socketProcessor = new SocketRequestProcessor(this.zc);
        this.httpProcessor = new HttpRequestProcessor(this.zc,worker);

        this.returner = new Returner(this.zc);

        this.reqIdPreFix = `${this.worker.options.instanceId}-${this.worker.getFullWorkerId()}-`;
    }

    async processSocketReq(input : any, socket : UpSocket, respond)
    {
        const reqId = this.createReqId();
        let shBridge;
        try {
            shBridge = await this.socketProcessor.prepareReq(socket,input,respond,reqId);
            await this.returner.respSuccessWs((await this.mainRequestProcessor.process(shBridge)),respond,reqId);
        }
        catch (err) {
            await this.returner.respErrorWs(err,respond,reqId);
            await this.handleReqError(err);
        }
    }

    async processHttpReq(req,res)
    {
        const reqId = this.createReqId();
        let shBridge;
        try {
            shBridge = await this.httpProcessor.prepareReq(req,res,reqId);
            await this.returner.respSuccessHttp((await this.mainRequestProcessor.process(shBridge)),res,reqId,shBridge);
        }
        catch (err) {
            await this.returner.respErrorHttp(err,res,reqId,shBridge);
            await this.handleReqError(err);
        }
    }

    private createReqId() {
        this.reqIdCounter.increase();
        // scalable unique id for every req based on instanceId-workerId-time/count
        return this.reqIdPreFix + this.reqIdCounter.getId();
    }

    private async handleReqError(err)
    {
        const promises : Promise<void>[] = [];
        promises.push(FuncUtils.emitEvent
        (this.zc.eventConfig.beforeError, this.worker.getPreparedSmallBag(),err));
        if(err instanceof  BackError)
        {
            if(err instanceof CodeError) {
                Logger.printDebugWarning(`Code error -> ${err.toString()}/n stack-> ${err.stack}`);
                promises.push(FuncUtils.emitEvent
                (this.zc.eventConfig.beforeCodeError,this.worker.getPreparedSmallBag(),err));
                if(this.zc.mainConfig.logCodeErrors){
                    Logger.logFileError(`Code error -> ${err.toString()}/n stack-> ${err.stack}`);
                }
            }
            promises.push(FuncUtils.emitEvent
            (this.zc.eventConfig.beforeBackError,this.worker.getPreparedSmallBag(),err));
        }
        else { // noinspection SuspiciousInstanceOfGuard
            if(err instanceof BackErrorBag) {
                promises.push(FuncUtils.emitEvent
                (this.zc.eventConfig.beforeBackErrorBag,this.worker.getPreparedSmallBag(),err));
            }
            else {
                Logger.printDebugWarning('UNKNOWN ERROR ON SERVER ->',err);
                if(this.zc.mainConfig.logServerErrors){
                    Logger.logFileError(`Unknown error on server -> ${err.stack}`);
                }
            }
        }
        await Promise.all(promises);
    }
}

