/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationToken} from "../constants/internal";
export type OnHandlerFunction = (data : any, response : ResponseFunction) => void
export type ResponseFunction = (err ?: any | number, responseData ?: any) => void

export interface Socket
{
    id : string;
    sid : string;
    request : any;
    remoteAddress : string;
    exchange : any;
    state : string;
    authState : string;
    authToken : object | null;
    CONNECTING : string;
    OPEN : string;
    CLOSED : string;
    AUTHENTICATED : string;
    UNAUTHENTICATED : string;

    getState() : string;
    disconnect(code ?: any, data ?: any) : void;
    emit(event : string, data : object, callback ?: ResponseFunction) : void;
    on(event : string, handler : OnHandlerFunction) : void;
    off(event ?: string, handler ?: Function) : void;
    send(data : any, options ?: object) : void;
    getAuthToken() : ZationToken | null;
    setAuthToken(data : object, options ?: object) : void;
    deauthenticate() : void;
    kickOut(channel ?: string, message ?: string, callback ?: Function) : void;
    subscriptions() : string[];
    isSubscribed(channelName : string) : boolean;

    //Zation
    zationSocketVariables : object,
    zationClient : {
        version : number,
        system : string
    }
}

