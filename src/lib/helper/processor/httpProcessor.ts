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

const helper   = __dirname + '/../';
const views    = helper + 'views/';

class HttpProcessor
{
    //HTTP Extra Layer
    static async runHttpProcess({worker, res, req, zc})
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
            if(ZationReqTools.isValidationCheckReq(zationData))
            {
                //validation Check req
                return await ValidChProcessor.process(zationData,zc,worker);
            }
            else
            {
                //normal Req
                req.zationToken = await TokenTools.verifyToken(zationData[Const.Settings.REQUEST_INPUT.TOKEN],zc);

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