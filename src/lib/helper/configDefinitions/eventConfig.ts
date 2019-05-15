/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ExpressCore                   = require("express-serve-static-core");
import ZationWorker                  = require("../../main/zationWorker");
import ScServer                        from "../sc/scServer";
import UpSocket, {HandshakeSocket} from "../sc/socket";
import {ZationToken}                   from "../constants/internal";
import BackError                       from "../../api/BackError";
import BackErrorBag                    from "../../api/BackErrorBag";
import SmallBag                        from "../../api/SmallBag";
import ZationInfo                      from "../infoObjects/zationInfo";
import {
    AuthMiddlewareReq,
    EmitMiddlewareReq,
    HandshakeScMiddlewareReq, HandshakeWsMiddlewareReq,
    PubInMiddlewareReq,
    PubOutMiddlewareReq,
    SubMiddlewareReq
} from "../sc/scMiddlewareReq";
import SocketInfo from "../infoObjects/socketInfo";
import CodeError  from "../error/codeError";

export type ExpressFunction = (smallBag : SmallBag, express : ExpressCore.Express) => Promise<void> | void;
export type ScServerFunction = (smallBag : SmallBag, scServer : ScServer) => Promise<void> | void;
export type WorkerStartedFunction = (smallBag : SmallBag, info : ZationInfo, worker : ZationWorker) => Promise<void> | void;
export type HttpServerStartedFunction = (info : ZationInfo) => Promise<void> | void;
export type WsServerStartedFunction = (info : ZationInfo) => Promise<void> | void;
export type StartedFunction = (info : ZationInfo) => Promise<void> | void;
export type BeforeErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type BeforeBackErrorFunction = (smallBag : SmallBag, backError : BackError) => Promise<void> | void;
export type BeforeCodeErrorFunction = (smallBag : SmallBag, codeError : CodeError) => Promise<void> | void;
export type BeforeBackErrorBagFunction = (smallBag : SmallBag, backErrorBag : BackErrorBag) => Promise<void> | void;
export type WorkerMessageFunction = (smallBag : SmallBag, data : any) => Promise<void> | void;

export type SocketConnectionFunction = (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;
export type SocketDisconnectionFunction = (smallBag : SmallBag, socketInfo : SocketInfo, code : any, data : any) => Promise<void> | void;
export type SocketAuthenticatedFunction = (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;
export type SocketDeauthenticatedFunction = (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;

export type MiddlewareAuthenticationFunction = (smallBag : SmallBag,zationToken : ZationToken) => Promise<boolean | object | any> | boolean | object | any;
export type MiddlewareSocketFunction = (smallBag : SmallBag,socket : HandshakeSocket) => Promise<boolean | object | any> | boolean | object | any;

export type SocketErrorFunction = (smallBag : SmallBag, socket : UpSocket, error : object) => Promise<void> | void;
export type SocketRawFunction = (smallBag : SmallBag, socket : UpSocket, data : any) => Promise<void> | void;
export type SocketConnectFunction = (smallBag : SmallBag, socket : UpSocket, conState : {isAuthenticated : boolean, authError ?: object}) => Promise<void> | void;
export type SocketCodeDataFunction = (smallBag : SmallBag, socket : UpSocket, code : any, data : any) => Promise<void> | void;
export type SocketSubscribeFunction = (smallBag : SmallBag, socket : UpSocket, channelName : string, channelOptions : object) => Promise<void> | void;
export type SocketUnsubscribeFunction = (smallBag : SmallBag, socket : UpSocket, channelName : string) => Promise<void> | void;
export type SocketBadAuthTokenFunction = (smallBag : SmallBag, socket : UpSocket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void;
export type SocketAuthenticateFunction = (smallBag : SmallBag, socket : UpSocket, authToken : object) => Promise<void> | void;
export type SocketDeauthenticateFunction = (smallBag : SmallBag, socket : UpSocket, oldAuthToken : object) => Promise<void> | void;
export type SocketAuthStateChangeFunction = (smallBag : SmallBag, socket : UpSocket, stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: object}) => Promise<void> | void;
export type SocketMessageFunction = (smallBag : SmallBag, socket : UpSocket, message : string) => Promise<void> | void;

export type ScServerErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type ScServerNoticeFunction = (smallBag : SmallBag, note : object) => Promise<void> | void;
export type ScServerSocketFunction = (smallBag : SmallBag, socket : UpSocket) => Promise<void> | void;
export type ScServerSocketCodeDataFunction = (smallBag : SmallBag, socket : UpSocket, code : any, data : any) => Promise<void> | void;
export type ScServerConnectionFunction = (smallBag : SmallBag, socket : UpSocket, conState : {isAuthenticated : boolean, authError ?: object}) => Promise<void> | void;
export type ScServerSubscriptionFunction = (smallBag : SmallBag, socket : UpSocket, channelName : string, channelOptions : object) => Promise<void> | void;
export type ScServerUnsubscriptionFunction = (smallBag : SmallBag, socket : UpSocket, channelName : string) => Promise<void> | void;
export type ScServerAuthenticationFunction = (smallBag : SmallBag, socket : UpSocket, authToken : object) => Promise<void> | void;
export type ScServerDeauthenticationFunction = (smallBag : SmallBag, socket : UpSocket, oldAuthToken : object) => Promise<void> | void;
export type ScServerAuthenticationStateChangeFunction = (smallBag : SmallBag, socket : UpSocket, stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: object}) => Promise<void> | void;
export type ScServerBadSocketAuthTokenFunction = (smallBag : SmallBag, socket : UpSocket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void;
export type ScServerReadyFunction = (smallBag : SmallBag) => Promise<void> | void;

export type ScMiddlewareFunction<R> = (smallBag : SmallBag, req : R) => Promise<boolean> | boolean | Promise<object> | object | Promise<any> | any;

export interface EventConfig
{
    /**
     * An event which that you can initialize an additional HTTP rest API using express and the small bag.
     * @example (smallBag,express) => {}
     */
    express  ?: ExpressFunction | ExpressFunction[];
    /**
     * Sc server event that will be invoked on server start to initialize something with the sc server.
     * @example (smallBag,scServer) => {}
     */
    scServer  ?: ScServerFunction | ScServerFunction[];
    /**
     * An event that gets invoked when a worker is started.
     * @example (smallBag,zationInfo,worker) => {}
     */
    workerStarted  ?: WorkerStartedFunction | WorkerStartedFunction[];
    /**
     * An event that gets invoked when the leader worker is started.
     * @example (smallBag,zationInfo,worker) => {}
     */
    workerLeaderStarted ?: WorkerStartedFunction | WorkerStartedFunction[];
    /**
     * An event that gets invoked when the HTTP server is started.
     * @example (zationInfo) => {}
     */
    httpServerStarted  ?: HttpServerStartedFunction | HttpServerStartedFunction[];
    /**
     * An event that gets invoked when the web socket server is started.
     * @example (zationInfo) => {}
     */
    wsServerStarted  ?: WsServerStartedFunction | WsServerStartedFunction[];
    /**
     * An event that gets invoked when the zation server is started.
     * @example (zationInfo) => {}
     */
    started  ?: StartedFunction | StartedFunction[];
    /**
     * An event that gets invoked when a error is thrown on the server
     * while processing a request or background task.
     * @example (smallBag,error) => {}
     */
    beforeError  ?: BeforeErrorFunction | BeforeErrorFunction[];
    /**
     * An event that gets invoked when a BackError is thrown on the server while processing a request.
     * @example (smallBag,backError) => {}
     */
    beforeBackError  ?: BeforeBackErrorFunction | BeforeBackErrorFunction[];
    /**
     * An event that gets invoked when a CodeError is thrown on the server while processing a request.
     * @example (smallBag,codeError) => {}
     */
    beforeCodeError  ?: BeforeCodeErrorFunction | BeforeCodeErrorFunction[];
    /**
     * An event that gets invoked when a BackErrorBag is thrown on the server while processing a request.
     * @example (smallBag,backErrorBag) => {}
     */
    beforeBackErrorBag  ?: BeforeBackErrorBagFunction | BeforeBackErrorBagFunction[];
    /**
     * An event that gets invoked when the worker receives a worker message
     * that was sent from the SmallBag.
     * @example (smallBag,data) => {}
     */
    workerMessage  ?: WorkerMessageFunction | WorkerMessageFunction[];

    /**
     * An event that gets invoked when a new socket is connected to the server.
     * @example (smallBag,socketInfo) => {}
     */
    socketConnection  ?: SocketConnectionFunction | SocketConnectionFunction[];
    /**
     * An event that gets invoked when a socket is disconnected.
     * @example (smallBag,socketInfo,code,data) => {}
     */
    socketDisconnection  ?: SocketDisconnectionFunction | SocketDisconnectionFunction[];
    /**
     * An event that gets invoked when a socket gets authenticated or the auth token is changed.
     * @example (smallBag,socketInfo) => {}
     */
    socketAuthenticated  ?: SocketAuthenticatedFunction | SocketAuthenticatedFunction[];
    /**
     * An event that gets invoked when a socket gets deauthenticated.
     * @example (smallBag,socketInfo) => {}
     */
    socketDeauthenticated  ?: SocketDeauthenticatedFunction | SocketDeauthenticatedFunction[];

    /**
     * Middleware event where you can block wrong jwt tokens.
     * To block them, you only need to return an object (that can be an error) or false.
     * If you want to allow them, you have to return nothing or a true.
     * @example (smallBag,zationToken) => {}
     */
    middlewareAuthenticate  ?: MiddlewareAuthenticationFunction;
    /**
     * Middleware event where you can block sockets.
     * To block them, you only need to return an object (that can be an error) or false.
     * If you want to allow them, you have to return nothing or a true.
     * @example (smallBag,socket) => {}
     */
    middlewareSocket ?: MiddlewareSocketFunction;

    //socket cluster events
    sc_socketError  ?: SocketErrorFunction | SocketErrorFunction[];
    sc_socketRaw  ?: SocketRawFunction | SocketRawFunction[];
    sc_socketConnect  ?: SocketConnectFunction | SocketConnectFunction[];
    sc_socketDisconnect  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    sc_socketConnectAbort  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    sc_socketClose  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    sc_socketSubscribe  ?: SocketSubscribeFunction | SocketSubscribeFunction[];
    sc_socketUnsubscribe  ?: SocketUnsubscribeFunction | SocketUnsubscribeFunction[];
    sc_socketBadAuthToken  ?: SocketBadAuthTokenFunction | SocketBadAuthTokenFunction[];
    sc_socketAuthenticate  ?: SocketAuthenticateFunction | SocketAuthenticateFunction[];
    sc_socketDeauthenticate  ?: SocketDeauthenticateFunction | SocketDeauthenticateFunction[];
    sc_socketAuthStateChange  ?: SocketAuthStateChangeFunction | SocketAuthStateChangeFunction[];
    sc_socketMessage  ?: SocketMessageFunction | SocketMessageFunction[];

    sc_serverError  ?: ScServerErrorFunction | ScServerErrorFunction[];
    sc_serverNotice  ?: ScServerNoticeFunction | ScServerNoticeFunction[];
    sc_serverHandshake  ?: ScServerSocketFunction | ScServerSocketFunction[];
    sc_serverConnectionAbort  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    sc_serverDisconnection  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    sc_serverClosure  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    sc_serverConnection  ?: ScServerConnectionFunction | ScServerConnectionFunction[];
    sc_serverSubscription  ?: ScServerSubscriptionFunction | ScServerSubscriptionFunction[];
    sc_serverUnsubscription  ?: ScServerUnsubscriptionFunction | ScServerUnsubscriptionFunction[];
    sc_serverAuthentication  ?: ScServerAuthenticationFunction | ScServerAuthenticationFunction[];
    sc_serverDeauthentication  ?: ScServerDeauthenticationFunction | ScServerDeauthenticationFunction[];
    sc_serverAuthenticationStateChange  ?: ScServerAuthenticationStateChangeFunction | ScServerAuthenticationStateChangeFunction[];
    sc_serverBadSocketAuthToken  ?: ScServerBadSocketAuthTokenFunction | ScServerBadSocketAuthTokenFunction[];
    sc_serverReady  ?: ScServerReadyFunction | ScServerReadyFunction[];

    sc_middlewareAuthenticate  ?: ScMiddlewareFunction<AuthMiddlewareReq>;
    sc_middlewareHandshakeWs  ?: ScMiddlewareFunction<HandshakeWsMiddlewareReq>;
    sc_middlewareHandshakeSc  ?: ScMiddlewareFunction<HandshakeScMiddlewareReq>;
    sc_middlewareSubscribe  ?: ScMiddlewareFunction<SubMiddlewareReq>;
    sc_middlewarePublishIn  ?: ScMiddlewareFunction<PubInMiddlewareReq>;
    sc_middlewarePublishOut  ?: ScMiddlewareFunction<PubOutMiddlewareReq>;
    sc_middlewareEmit  ?: ScMiddlewareFunction<EmitMiddlewareReq>;
}

export interface PreCompiledEventConfig extends EventConfig
{
    express  : ExpressFunction;
    scServer  : ScServerFunction;
    workerStarted  : WorkerStartedFunction;
    workerLeaderStarted : WorkerStartedFunction;
    httpServerStarted  : HttpServerStartedFunction;
    wsServerStarted  : WsServerStartedFunction;
    started  : StartedFunction;
    beforeError  : BeforeErrorFunction;
    beforeBackError  : BeforeBackErrorFunction;
    beforeCodeError  : BeforeCodeErrorFunction;
    beforeBackErrorBag  : BeforeBackErrorBagFunction;
    workerMessage  : WorkerMessageFunction;

    socketConnection  : SocketConnectionFunction;
    socketDisconnection  : SocketDisconnectionFunction;
    socketAuthenticated  : SocketAuthenticatedFunction;
    socketDeauthenticated  : SocketDeauthenticatedFunction;

    middlewareAuthenticate  ?: MiddlewareAuthenticationFunction;
    middlewareSocket ?: MiddlewareSocketFunction;

    //socket cluster events
    sc_socketError  : SocketErrorFunction;
    sc_socketRaw  : SocketRawFunction;
    sc_socketConnect  : SocketConnectFunction;
    sc_socketDisconnect  : SocketCodeDataFunction;
    sc_socketConnectAbort  : SocketCodeDataFunction;
    sc_socketClose  : SocketCodeDataFunction;
    sc_socketSubscribe  : SocketSubscribeFunction;
    sc_socketUnsubscribe  : SocketUnsubscribeFunction;
    sc_socketBadAuthToken  : SocketBadAuthTokenFunction;
    sc_socketAuthenticate  : SocketAuthenticateFunction;
    sc_socketDeauthenticate  : SocketDeauthenticateFunction;
    sc_socketAuthStateChange  : SocketAuthStateChangeFunction;
    sc_socketMessage  : SocketMessageFunction;

    sc_serverError  : ScServerErrorFunction;
    sc_serverNotice  : ScServerNoticeFunction;
    sc_serverHandshake  : ScServerSocketFunction;
    sc_serverConnectionAbort  : ScServerSocketCodeDataFunction;
    sc_serverDisconnection  : ScServerSocketCodeDataFunction;
    sc_serverClosure  : ScServerSocketCodeDataFunction;
    sc_serverConnection  : ScServerConnectionFunction;
    sc_serverSubscription  : ScServerSubscriptionFunction;
    sc_serverUnsubscription  : ScServerUnsubscriptionFunction;
    sc_serverAuthentication  : ScServerAuthenticationFunction;
    sc_serverDeauthentication  : ScServerDeauthenticationFunction;
    sc_serverAuthenticationStateChange  : ScServerAuthenticationStateChangeFunction;
    sc_serverBadSocketAuthToken  : ScServerBadSocketAuthTokenFunction;
    sc_serverReady  : ScServerReadyFunction;

    sc_middlewareAuthenticate  ?: ScMiddlewareFunction<AuthMiddlewareReq>;
    sc_middlewareHandshakeWs  ?: ScMiddlewareFunction<HandshakeWsMiddlewareReq>;
    sc_middlewareHandshakeSc  ?: ScMiddlewareFunction<HandshakeScMiddlewareReq>;
    sc_middlewareSubscribe  ?: ScMiddlewareFunction<SubMiddlewareReq>;
    sc_middlewarePublishIn  ?: ScMiddlewareFunction<PubInMiddlewareReq>;
    sc_middlewarePublishOut  ?: ScMiddlewareFunction<PubOutMiddlewareReq>;
    sc_middlewareEmit  ?: ScMiddlewareFunction<EmitMiddlewareReq>;
}
