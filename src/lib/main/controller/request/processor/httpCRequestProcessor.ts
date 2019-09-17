/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker          = require("../../../../core/zationWorker");
import {ZationToken}                from "../../../constants/internal";
import SHBridgeHttp                 from "../../../bridges/shBridgeHttp";
import ZationTokenWrapper           from "../../../internalApi/zationTokenWrapper";
import AEPreparedPart               from "../../../auth/aePreparedPart";
import BackError                    from "../../../../api/BackError";
import Logger                       from "../../../logger/logger";
import ControllerReqUtils           from "../controllerReqUtils";
import {MainBackErrors}             from "../../../zationBackErrors/mainBackErrors";
import TokenUtils, {TokenClusterKeyCheckFunction} from "../../../token/tokenUtils";
import JsonConverter                from "../../../utils/jsonConverter";
import ZationConfigFull             from "../../../config/manager/zationConfigFull";
import MiddlewareUtils              from "../../../utils/middlewareUtils";
import StringifyUtils               from "../../../utils/stringifyUtils";
import {ZationRequest}              from "../controllerDefinitions";
import SHBridge                     from "../../../bridges/shBridge";

export default class HttpCRequestProcessor
{
    private readonly zc : ZationConfigFull;
    private readonly debug : boolean;
    private readonly worker : ZationWorker;
    private readonly tokenClusterKeyCheck : TokenClusterKeyCheckFunction;
    private readonly aePreparedPart : AEPreparedPart;
    private readonly defaultApiLevel : number;
    private readonly postKey : string;

    constructor(zc : ZationConfigFull, worker : ZationWorker,tokenClusterKeyCheck : TokenClusterKeyCheckFunction) {
        this.zc = zc;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
        this.debug = zc.isDebug();
        this.worker = worker;
        this.tokenClusterKeyCheck = tokenClusterKeyCheck;
        this.aePreparedPart = worker.getAEPreparedPart();
        this.postKey = this.zc.mainConfig.postKey;
    }

    //HTTP Extra Layer
    async prepareReq(req,res,reqId : string) : Promise<SHBridge | undefined>
    {
        if (req.method === 'POST' && req.body[this.postKey]) {
            if(this.debug){
                Logger.printDebugInfo(`Http Post Request id: ${reqId}`);
            }
            HttpCRequestProcessor.setHeader(res);
            const zationData = await JsonConverter.parse(req.body[this.postKey]);

            if(this.debug){
                Logger.printDebugInfo(`Http Post Controller Request id: ${reqId} -> `,StringifyUtils.object(zationData));
            }
            if(this.zc.mainConfig.logFileControllerRequests){
                Logger.logFileInfo(`Http Post Controller Request id: ${reqId} -> `,zationData);
            }
            return this.mainProcess(req,res,zationData,reqId);
        }
        else if(req.method === 'GET' && !(Object.keys(req.query).length === 0))
        {
            if(this.debug){
                Logger.printDebugInfo(`Http Get Controller Request id: ${reqId}`);
            }
            if(this.zc.mainConfig.logFileControllerRequests){
                Logger.logFileInfo(`Http Get Controller Request id: ${reqId}`);
            }
            const query = req.query;

            if(ControllerReqUtils.isValidGetReq(query)) {
                HttpCRequestProcessor.setHeader(res);
                const zationData = await ControllerReqUtils.convertGetRequest(query);
                this.logGetRequest(reqId,zationData);
                return this.mainProcess(req,res,zationData,reqId);
            }
            else if(ControllerReqUtils.isValidValidationGetReq(query))
            {
                HttpCRequestProcessor.setHeader(res);
                const zationData = await ControllerReqUtils.convertValidationGetRequest(query);
                this.logGetRequest(reqId,zationData);
                return this.mainProcess(req,res,zationData,reqId);
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
            Logger.printDebugInfo(`Http Request id: ${reqId} -> Empty request`);
            HttpCRequestProcessor.printDefaultHtmlSite(res,this.worker);
        }
    }

    private logGetRequest(reqId : string, zationData : any) {
        if(this.debug){
            Logger.printDebugInfo(`Http Get Request id: ${reqId} -> `,StringifyUtils.object(zationData));
        }
        if(this.zc.mainConfig.logFileControllerRequests){
            Logger.logFileInfo(`Http Get Request id: ${reqId} -> `,zationData);
        }
    }

    private async mainProcess(req,res,zationData : ZationRequest,reqId : string) : Promise<SHBridge>
    {
        //check for validationCheckRequest
        if(ControllerReqUtils.isValidationCheckReq(zationData)) {
            return new SHBridgeHttp(res,req,reqId,zationData,true,this.defaultApiLevel,this.worker);
        }
        else
        {
            //normal Req
            if(!!zationData.to) {

                const token : ZationToken = (await TokenUtils.verifyToken(zationData.to,this.zc) as ZationToken);
                req.zationToken = token;

                //throws back error if token is not valid.
                TokenUtils.checkToken(token,this.aePreparedPart);

                try{
                    this.tokenClusterKeyCheck(token);
                }
                catch (err) {
                    HttpCRequestProcessor.middlewareAuthNext(err);
                }

                //will throw if auth is blocked
                await MiddlewareUtils.checkMiddleware
                (this.zc.eventConfig.middlewareAuthenticate,HttpCRequestProcessor.middlewareAuthNext,this.worker.getPreparedBag(),new ZationTokenWrapper(token));
            }
            return new SHBridgeHttp(res,req,reqId,zationData,false,this.defaultApiLevel,this.worker);
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