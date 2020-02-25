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
import ZationInfo                      from "../../internalApi/zationInfo";
import ZSocket                         from "../../internalApi/zSocket";
import CodeError                       from "../../error/codeError";
import ZationTokenWrapper              from "../../internalApi/zationTokenWrapper";
import {InitFunction}                  from '../../functionInit/functionInitEngine';

export type ExpressFunction = (express: ExpressCore.Express) => Promise<void> | void;
export type SocketServerFunction = (scServer: ScServer) => Promise<void> | void;
export type WorkerInitFunction = (leader: boolean, respawn: boolean) => Promise<void> | void;
export type MasterInitFunction = (info: ZationInfo) => Promise<void> | void;
export type WorkerStartedFunction = (info: ZationInfo,leader: boolean, respawn: boolean, worker: ZationWorker) => Promise<void> | void;
export type HttpServerStartedFunction = (info: ZationInfo) => Promise<void> | void;
export type WsServerStartedFunction = (info: ZationInfo) => Promise<void> | void;
export type StartedFunction = (info: ZationInfo) => Promise<void> | void;
export type BeforeErrorFunction = (error: object) => Promise<void> | void;
export type BeforeBackErrorFunction = (backError: BackError) => Promise<void> | void;
export type BeforeBackErrorBagFunction = (backErrorBag: BackErrorBag) => Promise<void> | void;
export type BeforeCodeErrorFunction = (codeError: CodeError) => Promise<void> | void;
export type WorkerMessageFunction = (data: any) => Promise<void> | void;

export type SocketInitFunction = (socket: ZSocket) => Promise<void> | void;
export type SocketConnectionFunction = (socket: ZSocket) => Promise<void> | void;
export type SocketDisconnectionFunction = (socket: ZSocket, code: any, data: any) => Promise<void> | void;
export type SocketAuthenticationFunction = (socket: ZSocket) => Promise<void> | void;
export type SocketDeauthenticationFunction = (socket: ZSocket) => Promise<void> | void;
export type SocketAuthStateChangeFunction = (socket: ZSocket, stateChangeData: {oldState: string,newState: string,signedAuthToken?: string,authToken?: ZationToken}) => Promise<void> | void;
export type SocketSubscriptionFunction = (socket: ZSocket, channelName: string, channelOptions: object) => Promise<void> | void;
export type SocketUnsubscriptionFunction = (socket: ZSocket, channelName: string) => Promise<void> | void;
export type SocketErrorFunction = (socket: RawSocket, error: object) => Promise<void> | void;
export type SocketRawFunction = (socket: RawSocket, data: any) => Promise<void> | void;
export type SocketConnectionAbortFunction = (socket: RawSocket, code: any, data: any) => Promise<void> | void;
export type SocketBadAuthTokenFunction = (socket: RawSocket, badAuthStatus: {authError: object,signedAuthToken: string}) => Promise<void> | void

export type MiddlewareAuthenticationFunction = (token: ZationTokenWrapper) => Promise<boolean | object | any> | boolean | object | any;
export type MiddlewareSocketFunction = (socket: HandshakeSocket) => Promise<boolean | object | any> | boolean | object | any;
export type MiddlewarePanelAuthFunction = (username: string, password: string) => Promise<boolean | void> | boolean | void;

export type Event<T>              = (InitFunction<T> | T)[] | T | InitFunction<T>;
export type SimpleEvent<T>        = T | T[];

export interface EventConfig
{
    /**
     * An event which that you can initialize an additional HTTP rest API using express.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (express) => {}
     */
    express?: Event<ExpressFunction>;
    /**
     * Socket server event that will be invoked on server start to initialize something with the sc server.
     * Use it only for advanced use cases.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (scServer) => {}
     */
    socketServer?: Event<SocketServerFunction>;
    /**
     * An event that can be used to do extra things in the startup of a worker.
     * The worker startup process will wait for the promise of this event to be resolved.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example async (leader,respawn) => {}
     */
    workerInit?: Event<WorkerInitFunction>;
    /**
     * An event that can be used to do extra things in the startup of the master.
     * The master startup process will wait for the promise of this event to be resolved.
     * Notice that this event can not be initialized with the $init function because it is triggered in the master process.
     * Also, it is not necessary to prepare data because this event is triggered only once.
     * Runs on the master process.
     * @example async (zationInfo) => {}
     */
    masterInit?: SimpleEvent<MasterInitFunction>;
    /**
     * An event that gets invoked when a worker is started.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zationInfo,leader,respawn,worker) => {}
     */
    workerStarted?: Event<WorkerStartedFunction>;
    /**
     * An event that gets invoked when the HTTP server is started.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zationInfo) => {}
     */
    httpServerStarted?: Event<HttpServerStartedFunction>;
    /**
     * An event that gets invoked when the web socket server is started.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zationInfo) => {}
     */
    wsServerStarted?: Event<WsServerStartedFunction>;
    /**
     * An event that gets invoked when the zation server is started.
     * Notice that this event can not be initialized with the $init function because it is triggered in the master process.
     * Also, it is not necessary to prepare data because this event is triggered only once.
     * Runs on the master process.
     * @example (zationInfo) => {}
     */
    started?: SimpleEvent<StartedFunction>;
    /**
     * An event that gets invoked when a error is thrown on the server
     * while processing a request or background task.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (error) => {}
     */
    beforeError?: Event<BeforeErrorFunction>;
    /**
     * An event that gets invoked when a BackError is thrown on the server while processing a request.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (backError) => {}
     */
    beforeBackError?: Event<BeforeBackErrorFunction>;
    /**
     * An event that gets invoked when a BackErrorBag is thrown on the server while processing a request.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (backErrorBag) => {}
     */
    beforeBackErrorBag?: Event<BeforeBackErrorBagFunction>;
    /**
     * An event that gets invoked when a CodeError is thrown on the server while processing a request.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (codeError) => {}
     */
    beforeCodeError?: Event<BeforeCodeErrorFunction>;
    /**
     * An event that gets invoked when the worker receives a worker message
     * that was sent from the bag.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (data) => {}
     */
    workerMessage?: Event<WorkerMessageFunction>;

    /**
     * An event that can be used to do extra things in the creation process of a socket.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zSocket) => {}
     */
    socketInit?: Event<SocketInitFunction>;
    /**
     * An event that gets invoked when a new socket is connected to the server.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zSocket) => {}
     */
    socketConnection?: Event<SocketConnectionFunction>;
    /**
     * An event that gets invoked when a socket gets disconnected.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zSocket,code,data) => {}
     */
    socketDisconnection?: Event<SocketDisconnectionFunction>;
    /**
     * An event that gets invoked when a socket gets authenticated or the auth token is changed.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zSocket) => {}
     */
    socketAuthentication?: Event<SocketAuthenticationFunction>;
    /**
     * An event that gets invoked when a socket gets deauthenticated.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zSocket) => {}
     */
    socketDeauthentication?: Event<SocketDeauthenticationFunction>;
    /**
     * Triggers whenever a socket's authState changes
     * (e.g., transitions between authenticated and unauthenticated states).
     * Use it only for advanced use cases.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket,stateChangeData) => {}
     */
    socketAuthStateChange?: Event<SocketAuthStateChangeFunction>;
    /**
     * Emitted when a matching client socket successfully subscribes to a channel.
     * Use it only for advanced use cases.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket,channelName,channelOptions) => {}
     */
    socketSubscription?: Event<SocketSubscriptionFunction>;
    /**
     * Occurs whenever a matching client socket unsubscribes from a channel.
     * This includes automatic unsubscriptions triggered by disconnects.
     * Use it only for advanced use cases.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket,channelName) => {}
     */
    socketUnsubscription?: Event<SocketUnsubscriptionFunction>;
    /**
     * This gets triggered when an error occurs on a socket.
     * Use it only for advanced use cases.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket,error) => {}
     */
    socketError?: Event<SocketErrorFunction>;
    /**
     * This gets triggered whenever a client socket on the other side calls socket.send(...).
     * Use it only for advanced use cases.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket,data) => {}
     */
    socketRaw?: Event<SocketRawFunction>;
    /**
     * Happens when a client disconnects from the server before the handshake has completed.
     * Use it only for advanced use cases.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket,code,data) => {}
     */
    socketConnectionAbort?: Event<SocketConnectionAbortFunction>;
    /**
     * Emitted when a client tries to authenticate itself with an invalid (or expired) token.
     * Use it only for advanced use cases.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket,badAuthStatus,signedAuthToken) => {}
     */
    socketBadAuthToken?: Event<SocketBadAuthTokenFunction>;

    /**
     * Middleware event where you can block wrong jwt tokens.
     * You can provide one function or multiple middleware functions.
     * When providing multiple functions, they will be invoked in the defined sequence.
     * If one function returns some value, the chain will be broken,
     * and the value is the result.
     * That means if you return nothing, the next function will be called.
     * If no more function is remaining, the action will be allowed.
     * If one function returns true, the chain is broken,
     * and the token is allowed without invoking the remaining functions.
     * To block the token, you can return an object (that can be an error) or false.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zationToken) => {}
     */
    middlewareAuthenticate?: Event<MiddlewareAuthenticationFunction>;
    /**
     * Middleware event where you can block sockets.
     * You can provide one function or multiple middleware functions.
     * When providing multiple functions, they will be invoked in the defined sequence.
     * If one function returns some value, the chain will be broken,
     * and the value is the result.
     * That means if you return nothing, the next function will be called.
     * If no more function is remaining, the action will be allowed.
     * If one function returns true, the chain is broken,
     * and the socket is allowed without invoking the remaining functions.
     * To block the socket, you can return an object (that can be an error) or false.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket) => {}
     */
    middlewareSocket?: Event<MiddlewareSocketFunction>;
    /**
     * In the panel auth middleware, you have the possibility
     * to allow or block authentication requests to the panel with the credentials.
     * This is useful if you want to change user accounts dynamically or
     * connect them to users of a database.
     * The middleware will only be used after Zation was not able
     * to authenticate the user with the users defined in the main config.
     * You can provide one function or multiple middleware functions.
     * When providing multiple functions, they will be invoked in the defined sequence.
     * If one function returns some value, the chain will be broken,
     * and the value is the result.
     * That means if you return nothing, the next function will be called.
     * If no more function is remaining, the authentication request is blocked.
     * If one function returns true, the chain is broken,
     * and the authentication request is successful without
     * invoking the remaining functions.
     * To deny the authentication request, you can return false.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (username, password) => {}
     */
    middlewarePanelAuth?: Event<MiddlewarePanelAuthFunction>;
}

export const middlewareEvents =
    [
        nameof<EventConfig>(s => s.middlewareAuthenticate),
        nameof<EventConfig>(s => s.middlewareSocket),
        nameof<EventConfig>(s => s.middlewarePanelAuth)
    ];

export interface PrecompiledEventConfig extends EventConfig {
    express : ExpressFunction;
    socketServer : SocketServerFunction;
    workerInit: WorkerInitFunction;
    masterInit: MasterInitFunction;
    workerStarted : WorkerStartedFunction;
    httpServerStarted : HttpServerStartedFunction;
    wsServerStarted : WsServerStartedFunction;
    started : StartedFunction;
    beforeError : BeforeErrorFunction;
    beforeBackError : BeforeBackErrorFunction;
    beforeBackErrorBag : BeforeBackErrorBagFunction;
    beforeCodeError : BeforeCodeErrorFunction;
    workerMessage : WorkerMessageFunction;

    socketInit: SocketInitFunction;
    socketConnection : SocketConnectionFunction;
    socketDisconnection : SocketDisconnectionFunction;
    socketAuthentication : SocketAuthenticationFunction;
    socketDeauthentication : SocketDeauthenticationFunction;
    socketAuthStateChange : SocketAuthStateChangeFunction;
    socketSubscription : SocketSubscriptionFunction;
    socketUnsubscription : SocketUnsubscriptionFunction;
    socketError: SocketErrorFunction;
    socketRaw : SocketRawFunction;
    socketConnectionAbort : SocketConnectionAbortFunction;
    socketBadAuthToken : SocketBadAuthTokenFunction;

    middlewareAuthenticate ?: MiddlewareAuthenticationFunction;
    middlewareSocket?: MiddlewareSocketFunction;
    middlewarePanelAuth?: MiddlewarePanelAuthFunction;
}