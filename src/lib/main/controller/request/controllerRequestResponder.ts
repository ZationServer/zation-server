/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
import {ZationToken}     from "../../constants/internal";
import SHBridge          from "../../bridges/shBridge";
import stringify         from "fast-stringify";
import ZationConfig      from "../../config/manager/zationConfig";
import TokenUtils        from "../../token/tokenUtils";
import Logger            from "../../logger/logger";
import SHBridgeHttp      from "../../bridges/shBridgeHttp";
import StringifyUtils    from "../../utils/stringifyUtils";
import {Response}        from "express";
import {RespondFunction} from "../../sc/socket";
import ErrorUtils        from "../../utils/errorUtils";
import {ResponseResult, ZationResponse} from "./controllerDefinitions";

export default class ControllerRequestResponder
{
    private readonly zc : ZationConfig;
    private readonly sendErrorDesc : boolean;
    private readonly debugMode : boolean;

    constructor(zc : ZationConfig) {
        this.zc = zc;
        this.sendErrorDesc = this.zc.mainConfig.sendErrorDescription || this.zc.isDebug();
        this.debugMode = this.zc.isDebug();
    }

    respSuccessWs(data : any, respond : RespondFunction, reqId : string) : void
    {
        if(data !== undefined) {
            const resp = this.createWsResp(data,undefined);
            respond(null,resp);
            this.printWsResp(resp,reqId);
        }
        else {
            respond();
        }
    }

    async respSuccessHttp(data : any,response : Response,reqId : string,shBridge : SHBridge | undefined) : Promise<void>
    {
        const resp = await this.createHttpResp
        (data,undefined,shBridge,response['zationInfo']);
        response.write(stringify(resp));
        response.end();
        this.printHttpResp(resp,reqId);
    }

    respErrorWs(err : any, respond : RespondFunction, reqId : string) : void {
        const resp = this.createWsResp
        (
            undefined,
            ErrorUtils.convertErrorToResponseErrors(err,this.sendErrorDesc)
        );

        respond(null,resp);
        this.printWsResp(resp,reqId);
    }

    async respErrorHttp(err : any,response : Response,reqId : string,shBridge : SHBridge | undefined) : Promise<void> {
        const resp = await this.createHttpResp
        (
            undefined,
            ErrorUtils.convertErrorToResponseErrors(err,this.sendErrorDesc),
            shBridge,response['zationInfo']
        );

        response.write(JSON.stringify(resp));
        response.end();
        this.printHttpResp(resp,reqId);
    }

    private printWsResp(resp : ResponseResult,reqId : string) {
        if(this.debugMode){
            Logger.printDebugInfo(`Socket Controller Response id: ${reqId} ->`,StringifyUtils.object(resp));
        }
        if(this.zc.mainConfig.logControllerRequests){
            Logger.logFileInfo(`Socket Controller Response id: ${reqId} ->`,resp);
        }
    }

    private printHttpResp(resp : ResponseResult,reqId : string) {
        if(this.debugMode){
            Logger.printDebugInfo(`Http Controller Response id: ${reqId} ->`,StringifyUtils.object(resp));
        }
        if(this.zc.mainConfig.logControllerRequests){
            Logger.logFileInfo(`Http Controller Response id: ${reqId} ->`,resp);
        }
    }

    // noinspection JSMethodCanBeStatic
    private createWsResp(res : ResponseResult | undefined,errors : any[] | undefined) : ZationResponse {
        return {
            r : res ? res : {},
            e : errors ? errors : []
        }
    }

    private async createHttpResp(res : ResponseResult | undefined,errors : any[] | undefined,shBridge : SHBridge | undefined,info) : Promise<ZationResponse> {
        const obj : ZationResponse = {
            r : res ? res : {},
            e : errors ? errors : []
        };

        //token
        if(shBridge !== undefined && shBridge.isNewToken()) {
            const token : ZationToken | null = shBridge.getToken();
            //can be null! if http deauthenticated
            if(token !== null){
                obj.t = {
                    st : (await TokenUtils.signToken
                    (token,this.zc,shBridge instanceof SHBridgeHttp ? shBridge.getJwtSignOptions() : {})),
                    pt : token
                } ;
            }
        }

        //info for http
        if(Array.isArray(info) && info.length > 0) {
            obj.zhi = info;
        }

        return obj;
    }
}