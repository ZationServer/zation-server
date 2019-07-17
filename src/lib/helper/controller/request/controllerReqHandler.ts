/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker                = require("../../../main/zationWorker");
import ControllerRequestResponder             from "./controllerRequestResponder";
import MainCRequestProcessor         from "./processor/mainCRequestProcessor";
import SocketCRequestProcessor       from "./processor/socketCRequestProcessor";
import HttpCRequestProcessor         from "./processor/httpCRequestProcessor";
import ValidCheckCRequestProcessor   from "./processor/validCheckCRequestProcessor";
import UpSocket, {RespondFunction}   from "../../sc/socket";
import BackError                     from "../../../api/BackError";
import BackErrorBag                  from "../../../api/BackErrorBag";
import IdCounter                     from "../../utils/idCounter";
import Logger                        from "../../logger/logger";
import CodeError                     from "../../error/codeError";
import ZationConfigFull              from "../../config/manager/zationConfigFull";
import {Request,Response}            from "express";

export default class ControllerReqHandler
{
    private readonly zc : ZationConfigFull;
    private readonly worker : ZationWorker;
    private reqIdCounter : IdCounter;

    private readonly reqIdPreFix : string;

    private readonly mainRequestProcessor : MainCRequestProcessor;
    private readonly socketProcessor : SocketCRequestProcessor;
    private readonly httpProcessor : HttpCRequestProcessor;
    private readonly requestResponder : ControllerRequestResponder;


    constructor(worker)
    {
        this.zc = worker.getZationConfig();
        this.worker = worker;
        this.reqIdCounter = new IdCounter();

        const validCheckProcessor = new ValidCheckCRequestProcessor(this.zc,worker);
        this.mainRequestProcessor = new MainCRequestProcessor(this.zc,worker,validCheckProcessor);
        this.socketProcessor = new SocketCRequestProcessor(this.zc);
        this.httpProcessor = new HttpCRequestProcessor(this.zc,worker,worker.getTokenClusterKeyCheck());

        this.requestResponder = new ControllerRequestResponder(this.zc);

        this.reqIdPreFix = `${this.worker.options.instanceId}-${this.worker.getFullWorkerId()}-`;
    }

    async processSocketReq(input : any, socket : UpSocket, respond : RespondFunction)
    {
        const reqId = this.createReqId();
        let shBridge;
        try {
            shBridge = await this.socketProcessor.prepareReq(socket,input,respond,reqId);
            await this.requestResponder.respSuccessWs((await this.mainRequestProcessor.process(shBridge)),respond,reqId);
        }
        catch (err) {
            await this.requestResponder.respErrorWs(err,respond,reqId);
            await this.handleReqError(err);
        }
    }

    async processHttpReq(req : Request,res : Response)
    {
        const reqId = this.createReqId();
        let shBridge;
        try {
            shBridge = await this.httpProcessor.prepareReq(req,res,reqId);
            await this.requestResponder.respSuccessHttp((await this.mainRequestProcessor.process(shBridge)),res,reqId,shBridge);
        }
        catch (err) {
            await this.requestResponder.respErrorHttp(err,res,reqId,shBridge);
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
        const promises : (Promise<void> | void)[] = [];
        promises.push(this.zc.eventConfig.beforeError(this.worker.getPreparedSmallBag(),err));
        if(err instanceof BackError)
        {
            if(err instanceof CodeError) {
                Logger.printDebugWarning(`Code error -> ${err.toString()}/n stack-> ${err.stack}`);
                promises.push(this.zc.eventConfig.beforeCodeError(this.worker.getPreparedSmallBag(),err));
                if(this.zc.mainConfig.logCodeErrors){
                    Logger.logFileError(`Code error -> ${err.toString()}/n stack-> ${err.stack}`);
                }
            }
            promises.push(this.zc.eventConfig.beforeBackError(this.worker.getPreparedSmallBag(),err));
        }
        else { // noinspection SuspiciousInstanceOfGuard
            if(err instanceof BackErrorBag) {
                promises.push(this.zc.eventConfig.beforeBackErrorBag(this.worker.getPreparedSmallBag(),err));
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