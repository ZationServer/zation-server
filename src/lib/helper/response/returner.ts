/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Logger          = require('../logger/logger');
import MainErrors      = require('../zationTaskErrors/mainTaskErrors');
import ZationConfig    = require("../../main/zationConfig");
import {ResponseResult, ZationResponse, ZationToken} from "../constants/internal";
import TokenTools      = require("../token/tokenTools");
import {SHBridge}       from "../bridges/shBridge";
import stringify        from "fast-stringify";
import BackError        from "../../api/BackError";
import BackErrorBag      from "../../api/BackErrorBag";

export class Returner
{
    private readonly zc : ZationConfig;
    private readonly sendErrorDesc : boolean;
    private readonly debugMode : boolean;

    constructor(zc : ZationConfig) {
        this.zc = zc;
        this.sendErrorDesc = this.zc.mainConfig.sendErrorDescription || this.zc.isDebug();
        this.debugMode = this.zc.isDebug();
    }

    respSuccessWs(data : any,respond,reqId) : void
    {
        if(data !== undefined) {
            const resp = this.createWsResp(data,undefined);
            respond(null,resp);
            this.printResp(resp,reqId,true);
        }
        else {
            respond();
        }
    }

    async respSuccessHttp(data : any,response,reqId,shBridge : SHBridge | undefined) : Promise<void>
    {
        const resp = await this.createHttpResp
        (data,undefined,shBridge,response['zationInfo']);
        response.write(stringify(resp));
        response.end();
        this.printResp(resp,reqId,false);
    }

    respErrorWs(err : any,respond,reqId) : void {
        const resp = this.createWsResp(undefined,this.errorJsonObj(err));
        respond(null,resp);
        this.printResp(resp,reqId,true);
    }

    async respErrorHttp(err : any,response,reqId,shBridge : SHBridge | undefined) : Promise<void> {
        const resp = await this.createHttpResp
        (undefined,this.errorJsonObj(err),shBridge,response['zationInfo']);
        response.write(JSON.stringify(resp));
        response.end();
        this.printResp(resp,reqId,false);
    }

    private errorJsonObj(err)
    {
        let errors;
        if(err instanceof BackError) {
            errors = [err._getJsonObj(this.sendErrorDesc)];
        }
        else {
            // noinspection SuspiciousInstanceOfGuard
            if(err instanceof BackErrorBag) {
                errors = err._getJsonObj(this.sendErrorDesc);
            }
            else {
                errors = [(new BackError(MainErrors.unknownError))._getJsonObj()];
            }
        }
        return errors;
    }

    private printResp(resp,reqId,wsResp)
    {
        if(wsResp)
        {
            if(this.debugMode){
                Logger.printDebugInfo(`Socket Result id: ${reqId} ->`,resp,true);
            }
            if(this.zc.mainConfig.logRequests){
                Logger.logFileInfo(`Socket Result id: ${reqId} ->`,resp,true);
            }
        }
        else
        {
            if(this.debugMode){
                Logger.printDebugInfo(`Http Result id: ${reqId} ->`,resp,true);
            }
            if(this.zc.mainConfig.logRequests){
                Logger.logFileInfo(`Http Result id: ${reqId} ->`,resp,true);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private createWsResp(res : ResponseResult | undefined,errors : any[] | undefined) : ZationResponse {
        return {
            r : res ? res : {},
            e : errors ? errors : [],
            s : errors ? errors.length === 0 : true,
        }
    }

    private async createHttpResp(res : ResponseResult | undefined,errors : any[] | undefined,shBridge : SHBridge | undefined,info) : Promise<ZationResponse> {
        const obj : ZationResponse = {
            r : res ? res : {},
            e : errors ? errors : [],
            s : errors ? errors.length === 0 : true,
        };

        //token
        if(shBridge !== undefined && shBridge.isNewToken()) {
            const token : ZationToken | null = shBridge.getToken();
            //can be null! if http deauthenticated
            if(token !== null){
                obj.t = {
                    st : (await TokenTools.signToken(token,this.zc)),
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

