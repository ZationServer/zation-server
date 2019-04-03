/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Socket}          from "../sc/socket";
import {ZationToken}     from "../constants/internal";
import {IncomingMessage} from "http";

/**
 * Minimal socket, http bridge interface
 * That not contains request information.
 */
export interface BaseSHBridge
{
    getHandshakeRequest() : IncomingMessage;
    getVersion() : number;
    getSystem() : string;

    isWebSocket() : boolean;
    /**
     * Is undefined if isWebSocket() is false!
     */
    getSocket() : Socket;
    deauthenticate() : void;
    hasToken() : boolean;
    getToken() : ZationToken | null;
    setToken(data : object) : Promise<void>;
    isNewToken() : boolean;

    deauthenticate() : void;
    getRemoteAddress() : string;
    getPublicRemoteAddress() : string;
}
