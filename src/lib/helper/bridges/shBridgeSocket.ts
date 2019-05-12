/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationRequest}      from "../constants/internal";
import SHBridge             from "./shBridge";
import BaseSHBridgeSocket   from "./baseSHBridgeSocket";
import UpSocket               from "../sc/socket";

/**
 * ShBridge implementation for socket.
 */
export default class SHBridgeSocket extends BaseSHBridgeSocket implements SHBridge {

    protected readonly reqId : string;
    protected readonly data : ZationRequest;
    protected readonly validationCheckReq : boolean;

    constructor(socket : UpSocket, reqId : string, data : ZationRequest, validationCheckReq : boolean) {
        super(socket);
        this.reqId = reqId;
        this.data = data;
        this.validationCheckReq = validationCheckReq;
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
}

