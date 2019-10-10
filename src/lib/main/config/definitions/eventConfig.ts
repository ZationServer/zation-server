/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
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
import ZSocket                         from "../../internalApi/zSocket";
import CodeError                       from "../../error/codeError";
import ZationTokenWrapper              from "../../internalApi/zationTokenWrapper";
import {eventInitSymbol}               from "../../../api/Config";

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

export type EventInitFunction<T>  = (bag : Bag) => T | Promise<T>;
export type EventInit<T>          = {(bag : Bag) : T | Promise<T>, [eventInitSymbol] : true};
export type Event<T>              = (EventInit<T> | T)[] | T | EventInit<T>;
export type SimpleEvent<T>        = T | T[];

export interface EventConfig
{
    /**
     * An event which that you can initialize an additional HTTP rest API using express and the bag.
     * @example (bag,express) => {}
     */
    express ?: Event<ExpressFunction>;
    /**
     * Socket server event that will be invoked on server start to initialize something with the sc server.
     * Use it only for advanced use cases.
     * @example (bag,scServer) => {}
     */
    socketServer ?: Event<SocketServerFunction>;
    /**
     * An event that can be used to do extra things in the startup of a worker.
     * The worker startup process will wait for the promise of this event to be resolved.
     * @example async (bag,isLeader) => {}
     */
    workerInit ?: Event<WorkerInitFunction>;
    /**
     * An event that can be used to do extra things in the startup of the master.
     * The master startup process will wait for the promise of this event to be resolved.
     * Notice that this event can not be initialized because it is triggered in the master process.
     * Also, it is not necessary to prepare data because this event is triggered only once.
     * @example async (zationInfo) => {}
     */
    masterInit ?: SimpleEvent<MasterInitFunction>;
    /**
     * An event that gets invoked when a worker is started.
     * @example (bag,zationInfo,worker) => {}
     */
    workerStarted ?: Event<WorkerStartedFunction>;
    /**
     * An event that gets invoked when the leader worker is started.
     * @example (bag,zationInfo,worker) => {}
     */
    workerLeaderStarted ?: Event<WorkerStartedFunction>;
    /**
     * An event that gets invoked when the HTTP server is started.
     * @example (zationInfo) => {}
     */
    httpServerStarted ?: Event<HttpServerStartedFunction>;
    /**
     * An event that gets invoked when the web socket server is started.
     * @example (zationInfo) => {}
     */
    wsServerStarted ?: Event<WsServerStartedFunction>;
    /**
     * An event that gets invoked when the zation server is started.
     * Notice that this event can not be initialized because it is triggered in the master process.
     * Also, it is not necessary to prepare data because this event is triggered only once.
     * @example (zationInfo) => {}
     */
    started ?: SimpleEvent<StartedFunction>;
    /**
     * An event that gets invoked when a error is thrown on the server
     * while processing a request or background task.
     * @example (bag,error) => {}
     */
    beforeError ?: Event<BeforeErrorFunction>;
    /**
     * An event that gets invoked when a BackError is thrown on the server while processing a request.
     * @example (bag,backError) => {}
     */
    beforeBackError ?: Event<BeforeBackErrorFunction>;
    /**
     * An event that gets invoked when a BackErrorBag is thrown on the server while processing a request.
     * @example (bag,backErrorBag) => {}
     */
    beforeBackErrorBag ?: Event<BeforeBackErrorBagFunction>;
    /**
     * An event that gets invoked when a CodeError is thrown on the server while processing a request.
     * @example (bag,codeError) => {}
     */
    beforeCodeError ?: Event<BeforeCodeErrorFunction>;
    /**
     * An event that gets invoked when the worker receives a worker message
     * that was sent from the bag.
     * @example (bag,data) => {}
     */
    workerMessage ?: Event<WorkerMessageFunction>;

    /**
     * An event that can be used to do extra things in the creation process of a socket.
     * @example (bag,zSocket) => {}
     */
    socketInit ?: Event<SocketInitFunction>;
    /**
     * An event that gets invoked when a new socket is connected to the server.
     * @example (bag,zSocket) => {}
     */
    socketConnection ?: Event<SocketConnectionFunction>;
    /**
     * An event that gets invoked when a socket is disconnected.
     * @example (bag,zSocket,code,data) => {}
     */
    socketDisconnection ?: Event<SocketDisconnectionFunction>;
    /**
     * An event that gets invoked when a socket gets authenticated or the auth token is changed.
     * @example (bag,zSocket) => {}
     */
    socketAuthentication ?: Event<SocketAuthenticationFunction>;
    /**
     * An event that gets invoked when a socket gets deauthenticated.
     * @example (bag,zSocket) => {}
     */
    socketDeauthentication ?: Event<SocketDeauthenticationFunction>;
    /**
     * Triggers whenever a socket's authState changes
     * (e.g., transitions between authenticated and unauthenticated states).
     * Use it only for advanced use cases.
     * @example (bag,socket,stateChangeData) => {}
     */
    socketAuthStateChange ?: Event<SocketAuthStateChangeFunction>;
    /**
     * Emitted when a matching client socket successfully subscribes to a channel.
     * Use it only for advanced use cases.
     * @example (bag,socket,channelName,channelOptions) => {}
     */
    socketSubscription ?: Event<SocketSubscriptionFunction>;
    /**
     * Occurs whenever a matching client socket unsubscribes from a channel.
     * This includes automatic unsubscriptions triggered by disconnects.
     * Use it only for advanced use cases.
     * @example (bag,socket,channelName) => {}
     */
    socketUnsubscription ?: Event<SocketUnsubscriptionFunction>;
    /**
     * This gets triggered when an error occurs on a socket.
     * Use it only for advanced use cases.
     * @example (bag,socket,error) => {}
     */
    socketError ?: Event<SocketErrorFunction>;
    /**
     * This gets triggered whenever a client socket on the other side calls socket.send(...).
     * Use it only for advanced use cases.
     * @example (bag,socket,data) => {}
     */
    socketRaw ?: Event<SocketRawFunction>;
    /**
     * Happens when a client disconnects from the server before the handshake has completed.
     * Use it only for advanced use cases.
     * @example (bag,socket,code,data) => {}
     */
    socketConnectionAbort ?: Event<SocketConnectionAbortFunction>;
    /**
     * Emitted when a client tries to authenticate itself with an invalid (or expired) token.
     * Use it only for advanced use cases.
     * @example (bag,socket,badAuthStatus,signedAuthToken) => {}
     */
    socketBadAuthToken ?: Event<SocketBadAuthTokenFunction>;

    /**
     * Middleware event where you can block wrong jwt tokens.
     * To block them, you only need to return an object (that can be an error) or false.
     * If you want to allow them, you have to return nothing or a true.
     * More middleware functions will be invoked in sequence.
     * If one function returns some value, the chain will be broken,
     * and the value is the result.
     * That means if one function returns true, the middleware allows the
     * action without invoking the remaining functions.
     * @example (bag,zationToken) => {}
     */
    middlewareAuthenticate ?: Event<MiddlewareAuthenticationFunction>;
    /**
     * Middleware event where you can block sockets.
     * To block them, you only need to return an object (that can be an error) or false.
     * If you want to allow them, you have to return nothing or a true.
     * More middleware functions will be invoked in sequence.
     * If one function returns some value, the chain will be broken,
     * and the value is the result.
     * That means if one function returns true, the middleware allows the
     * action without invoking the remaining functions.
     * @example (bag,socket) => {}
     */
    middlewareSocket ?: Event<MiddlewareSocketFunction>;
}

export const middlewareEvents =
    [
        nameof<EventConfig>(s => s.middlewareAuthenticate),
        nameof<EventConfig>(s => s.middlewareSocket)
    ];

export interface PrecompiledEventConfig extends EventConfig {}

export interface PreprocessedEvents extends EventConfig
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
