/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationRequest}      from "../constants/internal";
import SHBridge             from "./shBridge";
import BaseSHBridgeSocket   from "./baseSHBridgeSocket";
import UpSocket             from "../sc/socket";

/**
 * ShBridge implementation for socket.
 */
export default class SHBridgeSocket extends BaseSHBridgeSocket implements SHBridge {

    protected readonly reqId : string;
    protected readonly data : ZationRequest;
    protected readonly validationCheckReq : boolean;

    protected readonly defaultApiLevel : number;
    protected readonly connectionApiLevel : number | undefined;
    protected readonly requestApiLevel : number | undefined;

    constructor(socket : UpSocket, reqId : string, data : ZationRequest, validationCheckReq : boolean,defaultApiLevel : number) {
        super(socket);
        this.reqId = reqId;
        this.data = data;
        this.validationCheckReq = validationCheckReq;

        this.defaultApiLevel = defaultApiLevel;
        this.connectionApiLevel = socket.apiLevel;
        this.requestApiLevel = typeof data.al === 'number' ?
            Math.floor(data.al) : undefined;
    }

    getReqId(): string {
        return this.reqId;
    }

    getZationData(): ZationRequest {
        return this.data;
    }

    /**
     * Is undefined if isWebSocket() is true!
     */
    // @ts-ignore
    getRequest() {
        return undefined;
    }

    /**
     * Is undefined if isWebSocket() is true!
     */
    // @ts-ignore
    getResponse() {
        return undefined;
    }

    isValidationCheckReq(): boolean {
        return this.validationCheckReq;
    }

    getApiLevel(): number {
        return this.requestApiLevel || this.connectionApiLevel || this.defaultApiLevel;
    }

    getConnectionApiLevel(): number | undefined {
        return this.connectionApiLevel;
    }

    getRequestApiLevel(): number | undefined {
        return this.requestApiLevel;
    }
}

