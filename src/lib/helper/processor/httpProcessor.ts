/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import HtmlTools             = require('../tools/htmlTools');
import MainProcessor         = require('./mainProcessor');
import SHBridge              = require('../bridges/shBridge');
import TokenTools            = require('../token/tokenTools');
import ValidChProcessor      = require('./validChProcessor');
import ZationReqTools        = require('../tools/zationReqTools');
import TaskError             = require("../../api/TaskError");
import MainErrors            = require('../zationTaskErrors/mainTaskErrors');
import ZationWorker          = require("../../main/zationWorker");
import ZationConfig          = require("../../main/zationConfig");
import ZationToken           = require("../infoObjects/zationTokenInfo");
import JsonConverter         = require("../tools/jsonConverter");
import Logger                = require("../logger/logger");
import {ZationRequest}         from "../constants/internal";

const helper   = __dirname + '/../';
const views    = helper + 'views/';

class HttpProcessor
{
    //HTTP Extra Layer
    static async runHttpProcess(req,res,zc : ZationConfig,worker : ZationWorker,reqId : string)
    {
        // @ts-ignore
        if (req.method === 'POST' && !!req.body[zc.mainConfig.postKey]) {
            Logger.printDebugInfo(`Http Post Request id: ${reqId} -> `,req.body[zc.mainConfig.postKey]);
            HttpProcessor.setHeader(res);
            // @ts-ignore
            const zationData = await JsonConverter.parse(req.body[zc.mainConfig.postKey]);
            return await HttpProcessor.mainProcess(req,res,zc,worker,zationData,reqId);
        }
        else if(req.method === 'GET' && !(Object.keys(req.query).length === 0))
        {
            const query = req.query;
            Logger.printDebugInfo(`Http Get Request id: ${reqId} -> `,query,true);
            if(ZationReqTools.isValidGetReq(query)) {
                HttpProcessor.setHeader(res);
                const zationData = await ZationReqTools.convertGetRequest(query);
                return await HttpProcessor.mainProcess(req,res,zc,worker,zationData,reqId);
            }
            else if(ZationReqTools.isValidValidationGetReq(query))
            {
                HttpProcessor.setHeader(res);
                const zationData = await ZationReqTools.convertValidationGetRequest(query);
                return await HttpProcessor.mainProcess(req,res,zc,worker,zationData,reqId);
            }
            else {
                throw new TaskError(MainErrors.wrongInputDataStructure,
                    {
                        type : 'http',
                        reqMethod :req.method,
                        input : {head : req.headers, body : req.body}
                    });
            }
        }
        else {
            Logger.printDebugInfo(`Http Request id: ${reqId} -> No zation data found`);
            HttpProcessor.printDefaultHtmlSite(res);
        }
    }

    private static async mainProcess(req,res,zc : ZationConfig,worker : ZationWorker,zationData : ZationRequest,reqId : string)
    {
        //check for validationCheckRequest
        if(ZationReqTools.isValidationCheckReq(zationData)) {
            //validation Check req
            return await ValidChProcessor.process(zationData,zc,worker);
        }
        else
        {
            //normal Req
            if(!!zationData.to) {
                req.zationToken = await TokenTools.verifyToken(zationData.to,zc);
                const token = req.zationToken;

                const next = (err) => {
                    if(err) {
                        throw new TaskError(MainErrors.authenticateMiddlewareBlock,{err : err});
                    }
                };
                await zc.checkAuthenticationMiddlewareEvent
                (zc.eventConfig.middlewareAuthenticate,next,worker.getPreparedSmallBag(),new ZationToken(token));
            }

            let shBridge = new SHBridge(
                {
                    isWebSocket : false,
                    httpRes : res,
                    httpReq : req,
                    httpData : zationData,
                    reqId : reqId
                },zc);

            return await MainProcessor.process(shBridge,zc,worker)
        }
    }

    private static printDefaultHtmlSite(resp) : void {
        HtmlTools.writeHtml(resp, views + 'zationServer.html');
    }

    private static setHeader(resp) : void {
        resp.setHeader('Content-Type', 'application/json');
        resp.setHeader('Access-Control-Allow-Origin', '*');
        resp.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        resp.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');
        resp.setHeader('Access-Control-Allow-Credentials', true);
    }

}

export = HttpProcessor;