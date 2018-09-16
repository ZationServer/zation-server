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

const helper   = __dirname + '/../';
const views    = helper + 'views/';

class HttpProcessor
{
    //HTTP Extra Layer
    static async runHttpProcess(req,res,zc : ZationConfig,worker : ZationWorker)
    {
        let zationJsonData = req.body[zc.getMain(Const.Main.KEYS.POST_KEY_WORD)];

        if (req.method === 'POST' &&
            zationJsonData !== undefined) {
            //SetHeader
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');
            res.setHeader('Access-Control-Allow-Credentials', true);

            let zationData = await JSON.parse(req.body[zc.getMain(Const.Main.KEYS.POST_KEY_WORD)]);

            //check for validationCheckRequest
            if(ZationReqTools.isValidationCheckReq(zationData)) {
                //validation Check req
                return await ValidChProcessor.process(zationData,zc,worker);
            }
            else
            {
                //normal Req
                if(!!zationData[Const.Settings.REQUEST_INPUT.TOKEN])
                {
                    req.zationToken = await TokenTools.verifyToken(zationData[Const.Settings.REQUEST_INPUT.TOKEN],zc);
                    const token = req.zationToken;
                    const valid = await worker.getTSWClient().isTokenUnblocked(token[Const.Settings.TOKEN.TOKEN_ID]);

                    const next = (err) => {
                        if(err) {
                            throw new TaskError(MainErrors.authenticateMiddlewareBlock,{err : err});
                        }
                    };

                    await zc.checkAuthenticationMiddlewareEvent
                        (Const.Event.MIDDLEWARE_AUTHENTICATE,next,worker.getPreparedSmallBag(),new ZationToken(token));

                    if(!valid) {
                        throw new TaskError(MainErrors.tokenIsBlocked,{token : token});
                    }
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
        else
        {
            HtmlTools.writeHtml(res, views + 'zationServer.html');
        }
    }

}

export = HttpProcessor;