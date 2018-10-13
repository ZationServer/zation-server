/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const                 = require('../constants/constWrapper');
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
import ZationToken           = require("../infoObjects/zationToken");
import JsonConverter         = require("../tools/jsonConverter");

const helper   = __dirname + '/../';
const views    = helper + 'views/';

class HttpProcessor
{
    //HTTP Extra Layer
    static async runHttpProcess(req,res,zc : ZationConfig,worker : ZationWorker)
    {
        if (req.method === 'POST' && !!req.body[zc.getMain(Const.Main.KEYS.POST_KEY)]) {
            HttpProcessor.setHeader(res);
            const zationData = await JsonConverter.parse(req.body[zc.getMain(Const.Main.KEYS.POST_KEY)]);
            return await HttpProcessor.mainProcess(req,res,zc,worker,zationData);
        }
        else if(req.method === 'GET' && !(Object.keys(req.query).length === 0))
        {
            const query = req.query;
            if(ZationReqTools.isValidGetReq(query)) {
                HttpProcessor.setHeader(res);
                const zationData = await ZationReqTools.convertGetRequest(query);
                return await HttpProcessor.mainProcess(req,res,zc,worker,zationData);
            }
            else {
                throw new TaskError(MainErrors.wrongInputDataStructure);
            }
        }
        else {
            HttpProcessor.printDefaultHtmlSite(res);
        }
    }

    private static async mainProcess(req,res,zc : ZationConfig,worker : ZationWorker,zationData : object)
    {
        //check for validationCheckRequest
        if(ZationReqTools.isValidationCheckReq(zationData)) {
            //validation Check req
            return await ValidChProcessor.process(zationData,zc,worker);
        }
        else
        {
            //normal Req
            if(!!zationData[Const.Settings.REQUEST_INPUT.TOKEN]) {
                req.zationToken = await TokenTools.verifyToken(zationData[Const.Settings.REQUEST_INPUT.TOKEN],zc);
                const token = req.zationToken;

                const next = (err) => {
                    if(err) {
                        throw new TaskError(MainErrors.authenticateMiddlewareBlock,{err : err});
                    }
                };
                await zc.checkAuthenticationMiddlewareEvent
                (Const.Event.MIDDLEWARE_AUTHENTICATE,next,worker.getPreparedSmallBag(),new ZationToken(token));
            }

            let shBridge = new SHBridge(
                {
                    isWebSocket : false,
                    httpRes : res,
                    httpReq : req,
                    httpData : zationData
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