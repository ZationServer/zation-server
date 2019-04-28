/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationHttpInfo, ZationRequest, ZationToken} from "../constants/internal";
import * as core         from "express-serve-static-core";
import {IncomingMessage} from "http";
import SHBridge          from "./shBridge";
import BaseSHBridgeSH    from "./baseSHBridgeSH";
import UpSocket            from "../sc/socket";
import JwtOptions        from "../constants/jwt";
import AuthEngine        from "../auth/authEngine";
import ZationWorker    = require("../../main/zationWorker");

/**
 * BaseShBridge implementation for http.
 */
export default class SHBridgeHttp extends BaseSHBridgeSH implements SHBridge {

    protected readonly httpRes : core.Response;
    protected readonly httpReq : core.Request & {zationToken ?: ZationToken};
    protected readonly data : ZationRequest;
    protected readonly reqId : string;
    protected readonly validationCheckReq : boolean;

    protected readonly authEngine : AuthEngine;

    private newToken : boolean;
    private currentToken : ZationToken | null;
    protected currentJwtSignOptions : JwtOptions = {};

    constructor(httpRes : core.Response,
                httpReq : core.Request,
                reqId : string,data : ZationRequest,
                validationCheckReq : boolean,
                worker : ZationWorker)
    {

        super();
        this.httpRes = httpRes;
        this.httpReq = httpReq;
        this.reqId = reqId;
        this.data = data;
        this.validationCheckReq = validationCheckReq;

        if(this.httpRes['zationInfo'] === undefined) {
            this.httpRes['zationInfo'] = [];
        }

        this.authEngine = new AuthEngine(this,worker);

        //refresh auth engine at start
        this.authEngine.refresh(this.getToken());
    }

    getAuthEngine(): AuthEngine {
        return this.authEngine;
    }

    isValidationCheckReq(): boolean {
        return this.validationCheckReq;
    }

    getReqId(): string {
        return this.reqId;
    }

    getZationData(): ZationRequest {
        return this.data;
    }

    getRequest() {
        return this.httpReq;
    }

    getResponse() {
        return this.httpRes;
    }

    deauthenticate(): void {
        this.newToken = true;
        this.currentToken = null;
        this.httpRes['zationInfo'].push(ZationHttpInfo.DEAUTHENTICATE);

        this.authEngine.refresh(null);
    }

    getHandshakeRequest(): IncomingMessage {
        return this.httpReq;
    }

    getRemoteAddress(): any {
        const forwarded : any = this.httpReq.headers['x-forwarded-for'];
        return (forwarded ? forwarded.split(',')[0] : this.httpReq.connection.remoteAddress);
    }


    getSystem(): string {
        //is checked before
        // @ts-ignore
        return this.getZationData().s;
    }

    getToken(): ZationToken | null {
        // noinspection JSUnresolvedVariable
        if(this.newToken) {
            // @ts-ignore
            return this.currentToken;
        }
        else {
            return this.httpReq.zationToken !== undefined ? this.httpReq.zationToken : null;
        }
    }

    getVersion(): number {
        //is checked before
        // @ts-ignore
        return this.getZationData().v;
    }

    isNewToken(): boolean {
        return this.newToken;
    }

    isWebSocket(): boolean {
        return false;
    }

    async setToken(data : ZationToken,jwtOptions : JwtOptions = {}): Promise<void> {
        this.newToken = true;
        this.currentToken = data;
        this.currentJwtSignOptions = jwtOptions;

        this.authEngine.refresh(data);
    }

    /**
     * Is undefined if isWebSocket() is false!
     */
    getSocket(): UpSocket {
        // noinspection TypeScriptValidateTypes
        // @ts-ignore
        return undefined;
    }

    getJwtSignOptions() : JwtOptions {
        return this.currentJwtSignOptions;
    }
}

