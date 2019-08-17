/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ExpressCore                   = require("express-serve-static-core");
import ZationWorker                  = require("../../../core/zationWorker");
import ScServer                        from "../../sc/scServer";
import {HandshakeSocket, RawSocket}    from "../../sc/socket";
import {ZationToken}                   from "../../constants/internal";
import BackError                       from "../../../api/BackError";
import BackErrorBag                    from "../../../api/BackErrorBag";
import Bag                             from "../../../api/Bag";
import ZationInfo                      from "../../internalApi/zationInfo";
import ZSocket                         from "../../internalApi/ZSocket";
import CodeError                       from "../../error/codeError";
import ZationTokenWrapper              from "../../internalApi/zationTokenWrapper";

export type ExpressFunction = (bag : Bag, express : ExpressCore.Express) => Promise<void> | void;
export type SocketServerFunction = (bag : Bag, scServer : ScServer) => Promise<void> | void;
export type WorkerInitFunction = (bag : Bag, isLeader : boolean, isRespawn : boolean) => Promise<void> | void;
export type MasterInitFunction = (info : ZationInfo) => Promise<void> | void;
export type WorkerStartedFunction = (bag : Bag, info : ZationInfo, isRespawn : boolean, worker : ZationWorker) => Promise<void> | void;
export type HttpServerStartedFunction = (info : ZationInfo) => Promise<void> | void;
export type WsServerStartedFunction = (info : ZationInfo) => Promise<void> | void;
export type StartedFunction = (info : ZationInfo) => Promise<void> | void;
export type BeforeErrorFunction = (bag : Bag, error : object) => Promise<void> | void;
export type BeforeBackErrorFunction = (bag : Bag, backError : BackError) => Promise<void> | void;
export type BeforeCodeErrorFunction = (bag : Bag, codeError : CodeError) => Promise<void> | void;
export type BeforeBackErrorBagFunction = (bag : Bag, backErrorBag : BackErrorBag) => Promise<void> | void;
export type WorkerMessageFunction = (bag : Bag, data : any) => Promise<void> | void;

export type SocketInitFunction = (bag : Bag, socket : ZSocket) => Promise<void> | void;
export type SocketConnectionFunction = (bag : Bag, socket : ZSocket) => Promise<void> | void;
export type SocketDisconnectionFunction = (bag : Bag, socket : ZSocket, code : any, data : any) => Promise<void> | void;
export type SocketAuthenticationFunction = (bag : Bag, socket : ZSocket) => Promise<void> | void;
export type SocketDeauthenticationFunction = (bag : Bag, socket : ZSocket) => Promise<void> | void;
export type SocketAuthStateChangeFunction = (bag : Bag, socket : ZSocket, stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: ZationToken}) => Promise<void> | void;
export type SocketSubscriptionFunction = (bag : Bag, socket : ZSocket, channelName : string, channelOptions : object) => Promise<void> | void;
export type SocketUnsubscriptionFunction = (bag : Bag, socket : ZSocket, channelName : string) => Promise<void> | void;
export type SocketErrorFunction = (bag : Bag, socket : RawSocket, error : object) => Promise<void> | void;
export type SocketRawFunction = (bag : Bag, socket : RawSocket, data : any) => Promise<void> | void;
export type SocketConnectionAbortFunction = (bag : Bag, socket : RawSocket, code : any, data : any) => Promise<void> | void;
export type SocketBadAuthTokenFunction = (bag : Bag, socket : RawSocket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void

export type MiddlewareAuthenticationFunction = (bag : Bag, token : ZationTokenWrapper) => Promise<boolean | object | any> | boolean | object | any;
export type MiddlewareSocketFunction = (bag : Bag, socket : HandshakeSocket) => Promise<boolean | object | any> | boolean | object | any;

export interface EventConfig
{
    /**
     * An event which that you can initialize an additional HTTP rest API using express and the bag.
     * @example (bag,express) => {}
     */
    express  ?: ExpressFunction | ExpressFunction[];
    /**
     * Socket server event that will be invoked on server start to initialize something with the sc server.
     * Use it only for advanced use cases.
     * @example (bag,scServer) => {}
     */
    socketServer  ?: SocketServerFunction | SocketServerFunction[];
    /**
     * An event that can be used to do extra things in the startup of a worker.
     * The worker startup process will wait for the promise of this event to be resolved.
     * @example async (bag,isLeader) => {}
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
     * @example (bag,zationInfo,worker) => {}
     */
    workerStarted  ?: WorkerStartedFunction | WorkerStartedFunction[];
    /**
     * An event that gets invoked when the leader worker is started.
     * @example (bag,zationInfo,worker) => {}
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
     * @example (bag,error) => {}
     */
    beforeError  ?: BeforeErrorFunction | BeforeErrorFunction[];
    /**
     * An event that gets invoked when a BackError is thrown on the server while processing a request.
     * @example (bag,backError) => {}
     */
    beforeBackError  ?: BeforeBackErrorFunction | BeforeBackErrorFunction[];
    /**
     * An event that gets invoked when a BackErrorBag is thrown on the server while processing a request.
     * @example (bag,backErrorBag) => {}
     */
    beforeBackErrorBag  ?: BeforeBackErrorBagFunction | BeforeBackErrorBagFunction[];
    /**
     * An event that gets invoked when a CodeError is thrown on the server while processing a request.
     * @example (bag,codeError) => {}
     */
    beforeCodeError  ?: BeforeCodeErrorFunction | BeforeCodeErrorFunction[];
    /**
     * An event that gets invoked when the worker receives a worker message
     * that was sent from the bag.
     * @example (bag,data) => {}
     */
    workerMessage  ?: WorkerMessageFunction | WorkerMessageFunction[];

    /**
     * An event that can be used to do extra things in the creation process of a socket.
     * @example (bag,zSocket) => {}
     */
    socketInit  ?: SocketInitFunction | SocketInitFunction[];
    /**
     * An event that gets invoked when a new socket is connected to the server.
     * @example (bag,zSocket) => {}
     */
    socketConnection  ?: SocketConnectionFunction | SocketConnectionFunction[];
    /**
     * An event that gets invoked when a socket is disconnected.
     * @example (bag,zSocket,code,data) => {}
     */
    socketDisconnection  ?: SocketDisconnectionFunction | SocketDisconnectionFunction[];
    /**
     * An event that gets invoked when a socket gets authenticated or the auth token is changed.
     * @example (bag,zSocket) => {}
     */
    socketAuthentication  ?: SocketAuthenticationFunction | SocketAuthenticationFunction[];
    /**
     * An event that gets invoked when a socket gets deauthenticated.
     * @example (bag,zSocket) => {}
     */
    socketDeauthentication  ?: SocketDeauthenticationFunction | SocketDeauthenticationFunction[];
    /**
     * Triggers whenever a socket's authState changes
     * (e.g., transitions between authenticated and unauthenticated states).
     * Use it only for advanced use cases.
     * @example (bag,socket,stateChangeData) => {}
     */
    socketAuthStateChange  ?: SocketAuthStateChangeFunction | SocketAuthStateChangeFunction[];
    /**
     * Emitted when a matching client socket successfully subscribes to a channel.
     * Use it only for advanced use cases.
     * @example (bag,socket,channelName,channelOptions) => {}
     */
    socketSubscription  ?: SocketSubscriptionFunction | SocketSubscriptionFunction[];
    /**
     * Occurs whenever a matching client socket unsubscribes from a channel.
     * This includes automatic unsubscriptions triggered by disconnects.
     * Use it only for advanced use cases.
     * @example (bag,socket,channelName) => {}
     */
    socketUnsubscription  ?: SocketUnsubscriptionFunction | SocketUnsubscriptionFunction[];
    /**
     * This gets triggered when an error occurs on a socket.
     * Use it only for advanced use cases.
     * @example (bag,socket,error) => {}
     */
    socketError ?: SocketErrorFunction | SocketErrorFunction[];
    /**
     * This gets triggered whenever a client socket on the other side calls socket.send(...).
     * Use it only for advanced use cases.
     * @example (bag,socket,data) => {}
     */
    socketRaw  ?: SocketRawFunction | SocketRawFunction[];
    /**
     * Happens when a client disconnects from the server before the handshake has completed.
     * Use it only for advanced use cases.
     * @example (bag,socket,code,data) => {}
     */
    socketConnectionAbort  ?: SocketConnectionAbortFunction | SocketConnectionAbortFunction[];
    /**
     * Emitted when a client tries to authenticate itself with an invalid (or expired) token.
     * Use it only for advanced use cases.
     * @example (bag,socket,badAuthStatus,signedAuthToken) => {}
     */
    socketBadAuthToken  ?: SocketBadAuthTokenFunction | SocketBadAuthTokenFunction[];

    /**
     * Middleware event where you can block wrong jwt tokens.
     * To block them, you only need to return an object (that can be an error) or false.
     * If you want to allow them, you have to return nothing or a true.
     * @example (bag,zationToken) => {}
     */
    middlewareAuthenticate  ?: MiddlewareAuthenticationFunction;
    /**
     * Middleware event where you can block sockets.
     * To block them, you only need to return an object (that can be an error) or false.
     * If you want to allow them, you have to return nothing or a true.
     * @example (bag,socket) => {}
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

    socketInit : SocketInitFunction;
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
