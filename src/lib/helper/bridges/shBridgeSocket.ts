/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Socket}        from "../sc/socket";
import {ZationRequest} from "../constants/internal";
import {SHBridge}           from "./shBridge";
import {BaseShBridgeSocket} from "./baseShBridgeSocket";

/**
 * ShBridge implementation for socket.
 */
export class SHBridgeSocket extends BaseShBridgeSocket implements SHBridge {

    protected readonly reqId : string;
    protected readonly data : ZationRequest;

    constructor(socket : Socket,reqId : string,data : ZationRequest) {
        super(socket);
        this.reqId = reqId;
        this.data = data;
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
}

