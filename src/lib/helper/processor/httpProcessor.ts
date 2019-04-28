/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker          = require("../../main/zationWorker");
import {ZationRequest, ZationToken} from "../constants/internal";
import SHBridgeHttp                 from "../bridges/shBridgeHttp";
import ZationTokenInfo              from "../infoObjects/zationTokenInfo";
import AEPreparedPart               from "../auth/aePreparedPart";
import BackError                    from "../../api/BackError";
import Logger                       from "../logger/logger";
import ZationReqUtils               from "../utils/zationReqUtils";
import {MainBackErrors}             from "../zationBackErrors/mainBackErrors";
import TokenUtils                   from "../token/tokenUtils";
import JsonConverter                from "../utils/jsonConverter";
import ZationConfigFull             from "../configManager/zationConfigFull";
import MiddlewareUtils              from "../utils/middlewareUtils";

export default class HttpProcessor
{
    private readonly zc : ZationConfigFull;
    private readonly debug : boolean;
    private readonly worker : ZationWorker;
    private readonly aePreparedPart : AEPreparedPart;

    constructor(zc : ZationConfigFull, worker : ZationWorker) {
        this.zc = zc;
        this.debug = zc.isDebug();
        this.worker = worker;
        this.aePreparedPart = worker.getAEPreparedPart();
    }

    //HTTP Extra Layer
    async prepareReq(req,res,reqId : string)
    {
        // @ts-ignore
        if (req.method === 'POST' && !!req.body[zc.mainConfig.postKey]) {
            if(this.debug){
                Logger.printDebugInfo(`Http Post Request id: ${reqId} -> `,req.body[this.zc.mainConfig.postKey]);
            }
            if(this.zc.mainConfig.logRequests){
                Logger.logFileInfo(`Http Post Request id: ${reqId} -> `,req.body[this.zc.mainConfig.postKey]);
            }

            HttpProcessor.setHeader(res);
            // @ts-ignore
            const zationData = await JsonConverter.parse(req.body[zc.mainConfig.postKey]);
            return await this.mainProcess(req,res,zationData,reqId);
        }
        else if(req.method === 'GET' && !(Object.keys(req.query).length === 0))
        {
            const query = req.query;

            if(this.debug){
                Logger.printDebugInfo(`Http Get Request id: ${reqId} -> `,query,true);
            }
            if(this.zc.mainConfig.logRequests){
                Logger.logFileInfo(`Http Get Request id: ${reqId} -> `,query,true);
            }

            if(ZationReqUtils.isValidGetReq(query)) {
                HttpProcessor.setHeader(res);
                const zationData = await ZationReqUtils.convertGetRequest(query);
                return await this.mainProcess(req,res,zationData,reqId);
            }
            else if(ZationReqUtils.isValidValidationGetReq(query))
            {
                HttpProcessor.setHeader(res);
                const zationData = await ZationReqUtils.convertValidationGetRequest(query);
                return await this.mainProcess(req,res,zationData,reqId);
            }
            else {
                throw new BackError(MainBackErrors.wrongInputDataStructure,
                    {
                        type : 'http',
                        reqMethod :req.method,
                        input : {head : req.headers, body : req.body}
                    });
            }
        }
        else {
            Logger.printDebugInfo(`Http Request id: ${reqId} -> No zation data found`);
            HttpProcessor.printDefaultHtmlSite(res,this.worker);
        }
    }

    private async mainProcess(req,res,zationData : ZationRequest,reqId : string)
    {
        //check for validationCheckRequest
        if(ZationReqUtils.isValidationCheckReq(zationData)) {
            return new SHBridgeHttp(res,req,reqId,zationData,true,this.worker);
        }
        else
        {
            //normal Req
            if(!!zationData.to) {
                // @ts-ignore
                const token : ZationToken = await TokenUtils.verifyToken(zationData.to,this.zc);
                req.zationToken = token;

                //throws task error if token is not valid.
                TokenUtils.checkToken(token,this.aePreparedPart);

                //will throw if auth is blocked
                await MiddlewareUtils.checkMiddleware
                (this.zc.eventConfig.middlewareAuthenticate,HttpProcessor.middlewareAuthNext,this.worker.getPreparedSmallBag(),new ZationTokenInfo(token));
            }
            return new SHBridgeHttp(res,req,reqId,zationData,false,this.worker);
        }
    }

    private static middlewareAuthNext(err) {
        if(err) {
            throw new BackError(MainBackErrors.authenticateMiddlewareBlock,{err : err});
        }
    }

    private static printDefaultHtmlSite(resp, worker : ZationWorker) : void {
        resp.setHeader('content-type', 'text/html');
        resp.write(worker.getViewEngine().getZationDefaultView());
        resp.end();
    }

    private static setHeader(resp) : void {
        resp.setHeader('Content-Type', 'application/json');
    }

}

