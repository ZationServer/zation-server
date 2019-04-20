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
import Socket            from "../sc/socket";

/**
 * BaseShBridge implementation for http.
 */
export default class SHBridgeHttp extends BaseSHBridgeSH implements SHBridge {
    protected readonly httpRes : core.Response;
    protected readonly httpReq : core.Request & {zationToken ?: ZationToken};
    protected readonly data : ZationRequest;
    protected readonly reqId : string;
    protected readonly validationCheckReq : boolean;

    private newToken : boolean;
    private currentToken : ZationToken | null;

    constructor(httpRes : core.Response,httpReq : core.Request,reqId : string,data : ZationRequest,validationCheckReq : boolean) {
        super();
        this.httpRes = httpRes;
        this.httpReq = httpReq;
        this.reqId = reqId;
        this.data = data;
        this.validationCheckReq = validationCheckReq;

        if(this.httpRes['zationInfo'] === undefined) {
            this.httpRes['zationInfo'] = [];
        }
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

    async setToken(data : ZationToken): Promise<void> {
        this.newToken = true;
        this.currentToken = data;
    }

    /**
     * Is undefined if isWebSocket() is false!
     */
    getSocket(): Socket {
        // noinspection TypeScriptValidateTypes
        // @ts-ignore
        return undefined;
    }
}

