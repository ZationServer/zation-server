/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BaseSHBridge         from "./baseSHBridge";
import {IncomingMessage}    from "http";
import {ZationToken}        from "../constants/internal";
import UpSocket             from "../sc/socket";
import AuthEngine           from "../auth/authEngine";
const  IP : any           = require('ip');

/**
 * This class adds method they are same on both sides. (http/socket)
 */
export default abstract class BaseSHBridgeDefault implements BaseSHBridge {

    abstract deauthenticate(): void;
    abstract getHandshakeRequest(): IncomingMessage;
    abstract getRemoteAddress();
    abstract getSocket(): UpSocket;
    abstract getSystem(): string;
    abstract getToken(): ZationToken | null;
    abstract getVersion(): number;
    abstract isNewToken(): boolean;
    abstract isWebSocket(): boolean;
    abstract setToken(data: object): Promise<void>;

    // noinspection JSUnusedGlobalSymbols
    getPublicRemoteAddress() : any {
        let remId = this.getRemoteAddress();
        // noinspection TypeScriptValidateJSTypes
        if(IP.isPrivate(remId)) {
            // noinspection TypeScriptValidateJSTypes
            return IP.address();
        }
        else {
            return remId;
        }
    }

    hasToken(): boolean {
        return this.getToken() !== null;
    }

    abstract getAuthEngine(): AuthEngine;
}

