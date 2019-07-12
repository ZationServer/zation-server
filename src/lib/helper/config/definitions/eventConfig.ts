/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ExpressCore                   = require("express-serve-static-core");
import ZationWorker                  = require("../../../main/zationWorker");
import ScServer                        from "../../sc/scServer";
import {HandshakeSocket, RawSocket}    from "../../sc/socket";
import {ZationToken}                   from "../../constants/internal";
import BackError                       from "../../../api/BackError";
import BackErrorBag                    from "../../../api/BackErrorBag";
import SmallBag                        from "../../../api/SmallBag";
import ZationInfo                      from "../../infoObjects/zationInfo";
import ZSocket                         from "../../infoObjects/ZSocket";
import CodeError                       from "../../error/codeError";

export type ExpressFunction = (smallBag : SmallBag, express : ExpressCore.Express) => Promise<void> | void;
export type SocketServerFunction = (smallBag : SmallBag, scServer : ScServer) => Promise<void> | void;
export type WorkerInitFunction = (smallBag : SmallBag,isLeader : boolean,isRespawn : boolean) => Promise<void> | void;
export type MasterInitFunction = (info : ZationInfo) => Promise<void> | void;
export type WorkerStartedFunction = (smallBag : SmallBag, info : ZationInfo, isRespawn : boolean, worker : ZationWorker) => Promise<void> | void;
export type HttpServerStartedFunction = (info : ZationInfo) => Promise<void> | void;
export type WsServerStartedFunction = (info : ZationInfo) => Promise<void> | void;
export type StartedFunction = (info : ZationInfo) => Promise<void> | void;
export type BeforeErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type BeforeBackErrorFunction = (smallBag : SmallBag, backError : BackError) => Promise<void> | void;
export type BeforeCodeErrorFunction = (smallBag : SmallBag, codeError : CodeError) => Promise<void> | void;
export type BeforeBackErrorBagFunction = (smallBag : SmallBag, backErrorBag : BackErrorBag) => Promise<void> | void;
export type WorkerMessageFunction = (smallBag : SmallBag, data : any) => Promise<void> | void;

export type SocketConnectionFunction = (smallBag : SmallBag, socket : ZSocket) => Promise<void> | void;
export type SocketDisconnectionFunction = (smallBag : SmallBag, socket : ZSocket, code : any, data : any) => Promise<void> | void;
export type SocketAuthenticationFunction = (smallBag : SmallBag, socket : ZSocket) => Promise<void> | void;
export type SocketDeauthenticationFunction = (smallBag : SmallBag, socket : ZSocket) => Promise<void> | void;
export type SocketAuthStateChangeFunction = (smallBag : SmallBag, socket : ZSocket, stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: ZationToken}) => Promise<void> | void;
export type SocketSubscriptionFunction = (smallBag : SmallBag, socket : ZSocket, channelName : string, channelOptions : object) => Promise<void> | void;
export type SocketUnsubscriptionFunction = (smallBag : SmallBag, socket : ZSocket, channelName : string) => Promise<void> | void;
export type SocketErrorFunction = (smallBag : SmallBag, socket : RawSocket, error : object) => Promise<void> | void;
export type SocketRawFunction = (smallBag : SmallBag, socket : RawSocket, data : any) => Promise<void> | void;
export type SocketConnectionAbortFunction = (smallBag : SmallBag, socket : RawSocket, code : any, data : any) => Promise<void> | void;
export type SocketBadAuthTokenFunction = (smallBag : SmallBag, socket : RawSocket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void

export type MiddlewareAuthenticationFunction = (smallBag : SmallBag,zationToken : ZationToken) => Promise<boolean | object | any> | boolean | object | any;
export type MiddlewareSocketFunction = (smallBag : SmallBag,socket : HandshakeSocket) => Promise<boolean | object | any> | boolean | object | any;

export interface EventConfig
{
    /**
     * An event which that you can initialize an additional HTTP rest API using express and the small bag.
     * @example (smallBag,express) => {}
     */
    express  ?: ExpressFunction | ExpressFunction[];
    /**
     * Socket server event that will be invoked on server start to initialize something with the sc server.
     * Use it only for advanced use cases.
     * @example (smallBag,scServer) => {}
     */
    socketServer  ?: SocketServerFunction | SocketServerFunction[];
    /**
     * An event that can be used to do extra things in the startup of a worker.
     * The worker startup process will wait for the promise of this event to be resolved.
     * @example async (smallBag,isLeader) => {}
     */
    workerInit ?: WorkerInitFunction | WorkerInitFunction[];
    /**
     * An event that can be used to do extra things in the startup of the master.
     * The master startup process will wait for the promise of this event to be resolved.
     * @example async (zationInfo) => {}
     */
    masterInit ?: MasterInitFunction | MasterInitFunction[];
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
     * An event that gets invoked when a BackErrorBag is thrown on the server while processing a request.
     * @example (smallBag,backErrorBag) => {}
     */
    beforeBackErrorBag  ?: BeforeBackErrorBagFunction | BeforeBackErrorBagFunction[];
    /**
     * An event that gets invoked when a CodeError is thrown on the server while processing a request.
     * @example (smallBag,codeError) => {}
     */
    beforeCodeError  ?: BeforeCodeErrorFunction | BeforeCodeErrorFunction[];
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
    socketAuthentication  ?: SocketAuthenticationFunction | SocketAuthenticationFunction[];
    /**
     * An event that gets invoked when a socket gets deauthenticated.
     * @example (smallBag,socketInfo) => {}
     */
    socketDeauthentication  ?: SocketDeauthenticationFunction | SocketDeauthenticationFunction[];
    /**
     * Triggers whenever a socket's authState changes
     * (e.g., transitions between authenticated and unauthenticated states).
     * Use it only for advanced use cases.
     * @example (smallBag,socket,stateChangeData) => {}
     */
    socketAuthStateChange  ?: SocketAuthStateChangeFunction | SocketAuthStateChangeFunction[];
    /**
     * Emitted when a matching client socket successfully subscribes to a channel.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,channelName,channelOptions) => {}
     */
    socketSubscription  ?: SocketSubscriptionFunction | SocketSubscriptionFunction[];
    /**
     * Occurs whenever a matching client socket unsubscribes from a channel.
     * This includes automatic unsubscriptions triggered by disconnects.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,channelName) => {}
     */
    socketUnsubscription  ?: SocketUnsubscriptionFunction | SocketUnsubscriptionFunction[];
    /**
     * This gets triggered when an error occurs on a socket.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,error) => {}
     */
    socketError ?: SocketErrorFunction | SocketErrorFunction[];
    /**
     * This gets triggered whenever a client socket on the other side calls socket.send(...).
     * Use it only for advanced use cases.
     * @example (smallBag,socket,data) => {}
     */
    socketRaw  ?: SocketRawFunction | SocketRawFunction[];
    /**
     * Happens when a client disconnects from the server before the handshake has completed.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,code,data) => {}
     */
    socketConnectionAbort  ?: SocketConnectionAbortFunction | SocketConnectionAbortFunction[];
    /**
     * Emitted when a client tries to authenticate itself with an invalid (or expired) token.
     * Use it only for advanced use cases.
     * @example (smallBag,socket,badAuthStatus,signedAuthToken) => {}
     */
    socketBadAuthToken  ?: SocketBadAuthTokenFunction | SocketBadAuthTokenFunction[];

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
}

export interface PreCompiledEventConfig extends EventConfig
{
    express  : ExpressFunction;
    socketServer  : SocketServerFunction;
    workerInit : WorkerInitFunction;
    masterInit : MasterInitFunction;
    workerStarted  : WorkerStartedFunction;
    workerLeaderStarted : WorkerStartedFunction;
    httpServerStarted  : HttpServerStartedFunction;
    wsServerStarted  : WsServerStartedFunction;
    started  : StartedFunction;
    beforeError  : BeforeErrorFunction;
    beforeBackError  : BeforeBackErrorFunction;
    beforeBackErrorBag  : BeforeBackErrorBagFunction;
    beforeCodeError  : BeforeCodeErrorFunction;
    workerMessage  : WorkerMessageFunction;

    socketConnection  : SocketConnectionFunction;
    socketDisconnection  : SocketDisconnectionFunction;
    socketAuthentication  : SocketAuthenticationFunction;
    socketDeauthentication  : SocketDeauthenticationFunction;
    socketAuthStateChange  : SocketAuthStateChangeFunction;
    socketSubscription  : SocketSubscriptionFunction;
    socketUnsubscription  : SocketUnsubscriptionFunction;
    socketError : SocketErrorFunction;
    socketRaw  : SocketRawFunction;
    socketConnectionAbort  : SocketConnectionAbortFunction;
    socketBadAuthToken  : SocketBadAuthTokenFunction;

    middlewareAuthenticate  ?: MiddlewareAuthenticationFunction;
    middlewareSocket ?: MiddlewareSocketFunction;
}
