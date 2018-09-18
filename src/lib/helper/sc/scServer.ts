/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export interface ScServer
{
    exchange : any;
    clients : object;
    clientsCount : number;
    pendingClients : object;
    pendingClientsCount : number;
    sourcePort : number;
    secure : boolean;
    host : string;
    ackTimeout : number;

    setCodecEngine : (engine : object) => void;
    close : () => void;
    addMiddleware : (type : string, middlewareFn : Function) => void;
    removeMiddleware : (type : string, middlewareFn : Function) => void;
    on : (event : string, fn : Function) => void;

    MIDDLEWARE_HANDSHAKE_WS : string;
    MIDDLEWARE_HANDSHAKE_SC : string;
    MIDDLEWARE_AUTHENTICATE : string;
    MIDDLEWARE_SUBSCRIBE : string;
    MIDDLEWARE_PUBLISH_IN : string;
    MIDDLEWARE_PUBLISH_OUT : string;
    MIDDLEWARE_EMIT : string;
}

