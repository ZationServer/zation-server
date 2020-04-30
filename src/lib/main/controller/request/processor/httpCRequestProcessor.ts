/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker               = require("../../../../core/zationWorker");
import {ZationToken}                from "../../../constants/internal";
import SHBridgeHttp                 from "../bridges/shBridgeHttp";
import ZationTokenWrapper           from "../../../internalApi/zationTokenWrapper";
import AEPreparedPart               from "../../../auth/aePreparedPart";
import BackError                    from "../../../../api/BackError";
import Logger                       from "../../../log/logger";
import ControllerReqUtils           from "../controllerReqUtils";
import {MainBackErrors}             from "../../../zationBackErrors/mainBackErrors";
import TokenUtils, {TokenClusterKeyCheckFunction} from "../../../token/tokenUtils";
import {jsonParse}                  from "../../../utils/jsonConverter";
import ZationConfigFull             from "../../../config/manager/zationConfigFull";
import MiddlewareUtils              from "../../../utils/middlewareUtils";
import {ControllerRequest}              from "../controllerDefinitions";
import SHBridge                     from "../bridges/shBridge";

export default class HttpCRequestProcessor
{
    private readonly zc: ZationConfigFull;
    private readonly worker: ZationWorker;
    private readonly tokenClusterKeyCheck: TokenClusterKeyCheckFunction;
    private readonly aePreparedPart: AEPreparedPart;
    private readonly defaultApiLevel: number;
    private readonly postKey: string;

    constructor(zc: ZationConfigFull, worker: ZationWorker,tokenClusterKeyCheck: TokenClusterKeyCheckFunction) {
        this.zc = zc;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
        this.worker = worker;
        this.tokenClusterKeyCheck = tokenClusterKeyCheck;
        this.aePreparedPart = worker.getAEPreparedPart();
        this.postKey = this.zc.mainConfig.postKey;
    }

    //HTTP Extra Layer
    async prepareReq(req,res,reqId: string): Promise<SHBridge | undefined>
    {
        if (req.method === 'POST' && req.body[this.postKey]) {
            Logger.log.debug(`Http Post Request id: ${reqId}`);
            HttpCRequestProcessor.setHeader(res);
            const controllerRequest = jsonParse(req.body[this.postKey]);

            Logger.log.debug(`Http Post Controller Request id: ${reqId} -> `,controllerRequest);
            return this.mainProcess(req,res,controllerRequest,reqId);
        }
        else if(req.method === 'GET' && !(Object.keys(req.query).length === 0))
        {
            Logger.log.debug(`Http Get Controller Request id: ${reqId}`);
            const query = req.query;

            HttpCRequestProcessor.setHeader(res);
            const controllerRequest = ControllerReqUtils.convertGetRequest(query);
            Logger.log.debug(`Http Get Request id: ${reqId} -> `,controllerRequest);
            return this.mainProcess(req,res,controllerRequest,reqId);
        }
        else {
            Logger.log.debug(`Http Request id: ${reqId} -> Empty request`);
            HttpCRequestProcessor.printDefaultHtmlSite(res,this.worker);
        }
    }

    private async mainProcess(req, res, zationData: ControllerRequest, reqId: string): Promise<SHBridge>
    {
        //check for validationCheckRequest
        if(ControllerReqUtils.isValidationCheckReq(zationData)) {
            return new SHBridgeHttp(res,req,reqId,zationData,true,this.defaultApiLevel,this.worker);
        }
        else
        {
            //normal Req
            if(!!zationData.to) {
                const token: ZationToken = (await TokenUtils.verifyToken(zationData.to,this.zc) as ZationToken);
                req.zationToken = token;

                //throws back error if token is not valid.
                TokenUtils.checkToken(token,this.aePreparedPart);

                try{
                    this.tokenClusterKeyCheck(token);
                }
                catch (err) {
                    throw new BackError(MainBackErrors.tokenClusterKeyIsInvalid);
                }

                const authMiddlewareRes = await MiddlewareUtils.checkMiddleware
                (this.zc.middleware.middlewareAuthenticate,true,new ZationTokenWrapper(token));
                if(authMiddlewareRes !== true){
                    throw new BackError(MainBackErrors.authenticateMiddlewareBlock,
                        typeof authMiddlewareRes === 'object' ? {err: authMiddlewareRes}: {});
                }
            }
            return new SHBridgeHttp(res,req,reqId,zationData,false,this.defaultApiLevel,this.worker);
        }
    }

    private static printDefaultHtmlSite(resp, worker: ZationWorker): void {
        resp.setHeader('content-type', 'text/html');
        resp.write(worker.getViewEngine().getZationDefaultView());
        resp.end();
    }

    private static setHeader(resp): void {
        resp.setHeader('Content-Type', 'application/json');
    }
}