/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket            from "../sc/socket";
import {ZationToken}       from "../constants/internal";
import {IncomingMessage}   from "http";
import BaseSHBridge        from "./baseSHBridge";
import BaseSHBridgeDefault from "./baseSHBridgeDefault";
import TokenUtils          from "../token/tokenUtils";
import {JwtSignOptions}    from "../constants/jwt";
import AuthEngine          from "../auth/authEngine";

/**
 * BaseShBridge implementation for socket.
 */
export default class BaseSHBridgeSocket extends BaseSHBridgeDefault implements BaseSHBridge
{
    protected readonly socket : UpSocket;

    private newToken : boolean;

    constructor(socket : UpSocket) {
        super();
        this.socket = socket;
    }

    getAuthEngine() : AuthEngine {
        return this.socket.authEngine;
    }

    getHandshakeRequest() : IncomingMessage {
        return this.socket.request;
    }

    getVersion() : number {
        return this.socket.zationClient.version;
    }

    getSystem() : string {
        return this.socket.zationClient.system;
    }

    deauthenticate() : void {
        this.socket.deauthenticate();
    }

    getSocket() : UpSocket {
        return this.socket;
    }

    getRemoteAddress() : any {
        return this.socket.remoteAddress;
    }

    isWebSocket() : boolean {
        return true;
    }

    getToken(): ZationToken | null {
        return this.socket.authToken;
    }

    isNewToken(): boolean {
        return this.newToken;
    }

    async setToken(data : object,jwtOptions : JwtSignOptions = {}) : Promise<void> {
        await TokenUtils.setSocketTokenAsync(this.socket,data,jwtOptions);
        this.newToken = true;
    }
}

