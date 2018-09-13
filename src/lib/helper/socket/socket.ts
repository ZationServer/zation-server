/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export interface Socket
{
    id : string;
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
    emit(event : string, data : object, callback ?: Function) : void;
    on(event : string, handler : Function) : void;
    off(event ?: string, handler ?: Function) : void;
    send(data : any, options ?: object) : void;
    getAuthToken() : object | null;
    setAuthToken(data : object, options ?: object) : void;
    deauthenticate() : void;
    kickOut(channel ?: string, message ?: string, callback ?: Function) : void;
    subscriptions() : string[];
    isSubscribed(channelName : string) : boolean;
}

