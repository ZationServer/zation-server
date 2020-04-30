/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
import {ZationToken}     from "../../constants/internal";
import SHBridge          from "./bridges/shBridge";
import ZationConfig      from "../../config/manager/zationConfig";
import TokenUtils        from "../../token/tokenUtils";
import Logger            from "../../log/logger";
import SHBridgeHttp      from "./bridges/shBridgeHttp";
import {Response}        from "express";
import {RespondFunction} from "../../sc/socket";
import ErrorUtils        from "../../utils/errorUtils";
import {ControllerResponse}  from "./controllerDefinitions";
import {jsonStringify}       from "../../utils/jsonConverter";

export default class ControllerRequestResponder
{
    private readonly zc: ZationConfig;
    private readonly sendErrorDesc: boolean;

    constructor(zc: ZationConfig) {
        this.zc = zc;
        this.sendErrorDesc = this.zc.mainConfig.sendErrorDescription || this.zc.isDebug();
    }

    respSuccessWs(data: any, respond: RespondFunction, reqId: string): void
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

    async respSuccessHttp(data: any,response: Response,reqId: string,shBridge: SHBridge | undefined): Promise<void>
    {
        const resp = await this.createHttpResp
        (data,undefined,shBridge,response['zationInfo']);
        response.write(jsonStringify(resp));
        response.end();
        this.printHttpResp(resp,reqId);
    }

    respErrorWs(err: any, respond: RespondFunction, reqId: string): void {
        const resp = this.createWsResp
        (
            undefined,
            ErrorUtils.convertErrorToResponseErrors(err,this.sendErrorDesc)
        );

        respond(null,resp);
        this.printWsResp(resp,reqId);
    }

    async respErrorHttp(err: any,response: Response,reqId: string,shBridge: SHBridge | undefined): Promise<void> {
        const resp = await this.createHttpResp
        (
            undefined,
            ErrorUtils.convertErrorToResponseErrors(err,this.sendErrorDesc),
            shBridge,response['zationInfo']
        );

        response.write(jsonStringify(resp));
        response.end();
        this.printHttpResp(resp,reqId);
    }

    // noinspection JSMethodCanBeStatic
    private printWsResp(resp: ControllerResponse,reqId: string) {
        Logger.log.debug(`Socket Controller Response id: ${reqId} ->`,resp);
    }

    // noinspection JSMethodCanBeStatic
    private printHttpResp(resp: ControllerResponse,reqId: string) {
        Logger.log.debug(`Http Controller Response id: ${reqId} ->`,resp);
    }

    // noinspection JSMethodCanBeStatic
    private createWsResp(res: ControllerResponse | undefined,errors: any[] | undefined): ControllerResponse {
        return {
            r: res ? res : {},
            e: errors ? errors : []
        }
    }

    private async createHttpResp(res: ControllerResponse | undefined,errors: any[] | undefined,shBridge: SHBridge | undefined,info): Promise<ControllerResponse> {
        const obj: ControllerResponse = {
            r: res ? res : {},
            e: errors ? errors : []
        };

        //token
        if(shBridge !== undefined && shBridge.isNewToken()) {
            const token: ZationToken | null = shBridge.getToken();
            //can be null! if http deauthenticated
            if(token !== null){
                obj.t = [(await TokenUtils.signToken(token,this.zc,shBridge instanceof SHBridgeHttp ? shBridge.getJwtSignOptions(): {})),token];
            }
        }

        //info for http
        if(Array.isArray(info) && info.length > 0) {
            obj.hi = info;
        }

        return obj;
    }
}