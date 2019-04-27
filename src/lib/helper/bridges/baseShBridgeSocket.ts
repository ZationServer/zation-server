/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Socket              from "../sc/socket";
import {ZationToken}       from "../constants/internal";
import {IncomingMessage}   from "http";
import BaseSHBridge        from "./baseSHBridge";
import BaseSHBridgeSH      from "./baseSHBridgeSH";
import TokenUtils          from "../token/tokenUtils";
import JwtOptions          from "../constants/jwt";
import AuthEngine          from "../auth/authEngine";

/**
 * BaseShBridge implementation for socket.
 */
export default class BaseShBridgeSocket extends BaseSHBridgeSH implements BaseSHBridge
{
    protected readonly socket : Socket;

    private newToken : boolean;

    constructor(socket : Socket) {
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

    getSocket() : Socket {
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

    async setToken(data : object,jwtOptions : JwtOptions = {}) : Promise<void> {
        await TokenUtils.setSocketTokenAsync(this.socket,data,jwtOptions);
        this.newToken = true;
    }
}

