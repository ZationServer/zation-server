/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constants/constWrapper');
const HtmlTools             = require('../tools/htmlTools');
const MainProcessor         = require('./mainProcessor');
const SHBridge              = require('../bridges/shBridge');
const TokenTools            = require('../token/tokenTools');

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

            req.zationToken = await TokenTools.verifyToken(zationData[Const.Settings.REQUEST_INPUT.TOKEN],zc);

            let shBridge = new SHBridge(
                {
                    isSocket : false,
                    httpRes : res,
                    httpReq : req,
                    httpData : zationData
            },zc);

            return await MainProcessor.process(shBridge,zc,worker)
        }
        else
        {
            HtmlTools.writeHtml(res, views + 'zationServer.html');
        }
    }

}

module.exports = HttpProcessor;