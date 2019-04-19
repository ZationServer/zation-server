/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TokenTools            = require('../token/tokenTools');
import ZationReqTools        = require('../tools/zationReqTools');
import MainErrors            = require('../zationTaskErrors/mainTaskErrors');
import ZationWorker          = require("../../main/zationWorker");
import ZationConfig          = require("../../main/zationConfig");
import JsonConverter         = require("../tools/jsonConverter");
import Logger                = require("../logger/logger");
import {ZationRequest, ZationToken} from "../constants/internal";
import {SHBridgeHttp}               from "../bridges/shBridgeHttp";
import ZationTokenInfo              from "../infoObjects/zationTokenInfo";
import AEPreparedPart               from "../auth/aePreparedPart";
import BackError                    from "../../api/BackError";

export default class HttpProcessor
{
    private readonly zc : ZationConfig;
    private readonly debug : boolean;
    private readonly worker : ZationWorker;
    private readonly aePreparedPart : AEPreparedPart;

    constructor(zc : ZationConfig,worker : ZationWorker) {
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

            if(ZationReqTools.isValidGetReq(query)) {
                HttpProcessor.setHeader(res);
                const zationData = await ZationReqTools.convertGetRequest(query);
                return await this.mainProcess(req,res,zationData,reqId);
            }
            else if(ZationReqTools.isValidValidationGetReq(query))
            {
                HttpProcessor.setHeader(res);
                const zationData = await ZationReqTools.convertValidationGetRequest(query);
                return await this.mainProcess(req,res,zationData,reqId);
            }
            else {
                throw new BackError(MainErrors.wrongInputDataStructure,
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
        if(ZationReqTools.isValidationCheckReq(zationData)) {
            return new SHBridgeHttp(res,req,reqId,zationData,true);
        }
        else
        {
            //normal Req
            if(!!zationData.to) {
                // @ts-ignore
                const token : ZationToken = await TokenTools.verifyToken(zationData.to,this.zc);
                req.zationToken = token;

                //throws task error if token is not valid.
                TokenTools.checkToken(token,this.aePreparedPart);

                const next = (err) => {
                    if(err) {
                        throw new BackError(MainErrors.authenticateMiddlewareBlock,{err : err});
                    }
                };
                await this.zc.checkAuthenticationMiddlewareEvent
                (this.zc.eventConfig.middlewareAuthenticate,next,this.worker.getPreparedSmallBag(),new ZationTokenInfo(token));
            }
            return new SHBridgeHttp(res,req,reqId,zationData,false);
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

