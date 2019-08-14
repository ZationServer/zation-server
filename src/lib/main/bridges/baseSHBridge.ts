/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationToken}     from "../constants/internal";
import {IncomingMessage} from "http";
import UpSocket          from "../sc/socket";
import {JwtSignOptions}  from "../constants/jwt";
import AuthEngine        from "../auth/authEngine";

/**
 * Minimal socket, http bridge interface
 * That not contains request information.
 */
export default interface BaseSHBridge
{
    getHandshakeRequest() : IncomingMessage;
    getVersion() : number;
    getSystem() : string;

    isWebSocket() : boolean;
    /**
     * Is undefined if isWebSocket() is false!
     */
    getSocket() : UpSocket;
    deauthenticate() : void;
    hasToken() : boolean;
    getToken() : ZationToken | null;
    setToken(data : object,jwtOptions ?: JwtSignOptions) : Promise<void>;
    isNewToken() : boolean;

    deauthenticate() : void;
    getRemoteAddress() : string;
    getPublicRemoteAddress() : string;

    getAuthEngine() : AuthEngine;
}
