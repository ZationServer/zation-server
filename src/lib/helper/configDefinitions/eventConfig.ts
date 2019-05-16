/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ExpressCore                   = require("express-serve-static-core");
import ZationWorker                  = require("../../main/zationWorker");
import ScServer                        from "../sc/scServer";
import UpSocket, {HandshakeSocket}     from "../sc/socket";
import {ZationToken}                   from "../constants/internal";
import BackError                       from "../../api/BackError";
import BackErrorBag                    from "../../api/BackErrorBag";
import SmallBag                        from "../../api/SmallBag";
import ZationInfo                      from "../infoObjects/zationInfo";
import SocketInfo                      from "../infoObjects/socketInfo";
import CodeError                       from "../error/codeError";

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
    /**
     * This gets triggered when an error occurs on a socket.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,error) => {}
     */
    sc_socketError  ?: SocketErrorFunction | SocketErrorFunction[];
    /**
     * This gets triggered whenever a client socket on the other side calls socket.send(...).
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,data) => {}
     */
    sc_socketRaw  ?: SocketRawFunction | SocketRawFunction[];
    /**
     * Triggers when a socket completes the SC handshake phase and is fully connected.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,conState) => {}
     */
    sc_socketConnect  ?: SocketConnectFunction | SocketConnectFunction[];
    /**
     * Happens when a client becomes disconnected from the server.
     * Note that if the socket becomes disconnected during the SC handshake stage,
     * then the 'connectAbort' event will be triggered instead.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,code,data) => {}
     */
    sc_socketDisconnect  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    /**
     * Happens when a client disconnects from the server before the SocketCluster handshake has completed.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,code,data) => {}
     */
    sc_socketConnectAbort  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    /**
     * Happens when a client disconnects from the server at any stage of the handshake/connection cycle.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,code,data) => {}
     */
    sc_socketClose  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    /**
     * Emitted when a matching client socket successfully subscribes to a channel.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,channelName,channelOptions) => {}
     */
    sc_socketSubscribe  ?: SocketSubscribeFunction | SocketSubscribeFunction[];
    /**
     * Occurs whenever a matching client socket unsubscribes from a channel.
     * This includes automatic unsubscriptions triggered by disconnects.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,channelName) => {}
     */
    sc_socketUnsubscribe  ?: SocketUnsubscribeFunction | SocketUnsubscribeFunction[];
    /**
     * Emitted when a client tries to authenticate itself with an invalid (or expired) token.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,badAuthStatus,signedAuthToken) => {}
     */
    sc_socketBadAuthToken  ?: SocketBadAuthTokenFunction | SocketBadAuthTokenFunction[];
    /**
     * Triggers whenever a client becomes authenticated.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,code,authToken) => {}
     */
    sc_socketAuthenticate  ?: SocketAuthenticateFunction | SocketAuthenticateFunction[];
    /**
     * Triggers whenever a client becomes unauthenticated.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,oldAuthToken) => {}
     */
    sc_socketDeauthenticate  ?: SocketDeauthenticateFunction | SocketDeauthenticateFunction[];
    /**
     * Triggers whenever a socket's authState changes
     * (e.g., transitions between authenticated and unauthenticated states).
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,stateChangeData) => {}
     */
    sc_socketAuthStateChange  ?: SocketAuthStateChangeFunction | SocketAuthStateChangeFunction[];
    /**
     * All data that arrives on a socket is emitted through this event as a string.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,message) => {}
     */
    sc_socketMessage  ?: SocketMessageFunction | SocketMessageFunction[];

    /**
     * This gets triggered when a fatal error occurs on a worker.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,error) => {}
     */
    sc_serverError  ?: ScServerErrorFunction | ScServerErrorFunction[];
    /**
     * A notice carries potentially useful information but isn't quite an error.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,note) => {}
     */
    sc_serverNotice  ?: ScServerNoticeFunction | ScServerNoticeFunction[];
    /**
     * It is emitted as soon as a new socket object is created on the server.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket) => {}
     */
    sc_serverHandshake  ?: ScServerSocketFunction | ScServerSocketFunction[];
    /**
     * Emitted whenever a socket becomes disconnected during the handshake phase.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,code,data) => {}
     */
    sc_serverConnectionAbort  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    /**
     * Emitted whenever a connected socket becomes disconnected (after the handshake phase).
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,code,data) => {}
     */
    sc_serverDisconnection  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    /**
     * Emitted whenever a connected socket becomes disconnected (at any stage of the handshake/connection cycle).
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,code,data) => {}
     */
    sc_serverClosure  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    /**
     * Emitted whenever a new socket connection is established with the server (and the handshake has completed).
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,conState) => {}
     */
    sc_serverConnection  ?: ScServerConnectionFunction | ScServerConnectionFunction[];
    /**
     * Emitted whenever a socket connection which is attached to the server becomes subscribed to a channel.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,channelName,channelOptions) => {}
     */
    sc_serverSubscription  ?: ScServerSubscriptionFunction | ScServerSubscriptionFunction[];
    /**
     * Emitted whenever a socket connection which is attached to the server becomes unsubscribed from a channel.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,channelName) => {}
     */
    sc_serverUnsubscription  ?: ScServerUnsubscriptionFunction | ScServerUnsubscriptionFunction[];
    /**
     * Emitted whenever a socket connection which is attached to the server becomes authenticated.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,authToken) => {}
     */
    sc_serverAuthentication  ?: ScServerAuthenticationFunction | ScServerAuthenticationFunction[];
    /**
     * Emitted whenever a socket connection which is attached to the server becomes deauthenticated.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,oldAuthToken) => {}
     */
    sc_serverDeauthentication  ?: ScServerDeauthenticationFunction | ScServerDeauthenticationFunction[];
    /**
     * Triggers whenever the authState of a socket which is attached to the server changes
     * (e.g., transitions between authenticated and unauthenticated states).
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,stateChangeData) => {}
     */
    sc_serverAuthenticationStateChange  ?: ScServerAuthenticationStateChangeFunction | ScServerAuthenticationStateChangeFunction[];
    /**
     * Emitted when a client which is attached to the server tries
     * to authenticate itself with an invalid (or expired) token.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,badAuthStatus) => {}
     */
    sc_serverBadSocketAuthToken  ?: ScServerBadSocketAuthTokenFunction | ScServerBadSocketAuthTokenFunction[];
    /**
     * Emitted when the server is ready to accept connections.
     * This is a wrapper around a socket cluster event.
     * Use it only for advanced use cases.
     * @example (smallBag) => {}
     */
    sc_serverReady  ?: ScServerReadyFunction | ScServerReadyFunction[];
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
}
