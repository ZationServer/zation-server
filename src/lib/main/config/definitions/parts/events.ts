/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ExpressCore                   = require("express-serve-static-core");
import ZationWorker                  = require("../../../../core/zationWorker");
import ScServer                        from "../../../sc/scServer";
import {RawSocket}                     from "../../../sc/socket";
import {ZationToken}                   from "../../../constants/internal";
import BackError                       from "../../../../api/BackError";
import ZationInfo                      from "../../../internalApi/zationInfo";
import ZSocket                         from "../../../internalApi/zSocket";
import CodeError                       from "../../../error/codeError";

export type ExpressFunction = (express: ExpressCore.Express) => Promise<void> | void;
export type SocketServerFunction = (scServer: ScServer) => Promise<void> | void;
export type WorkerInitFunction = (leader: boolean, respawn: boolean) => Promise<void> | void;
export type MasterInitFunction = (info: ZationInfo) => Promise<void> | void;
export type WorkerStartedFunction = (info: ZationInfo,leader: boolean, respawn: boolean, worker: ZationWorker) => Promise<void> | void;
export type HttpServerStartedFunction = (info: ZationInfo) => Promise<void> | void;
export type WsServerStartedFunction = (info: ZationInfo) => Promise<void> | void;
export type StartedFunction = (info: ZationInfo) => Promise<void> | void;
export type ErrorFunction = (error: object) => Promise<void> | void;
export type BackErrorsFunction = (backErrors: BackError[]) => Promise<void> | void;
export type CodeErrorFunction = (codeError: CodeError) => Promise<void> | void;
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

export type Event<T> = T | T[];

export interface Events
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
    masterInit?: Event<MasterInitFunction>;
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
    started?: Event<StartedFunction>;
    /**
     * An event that gets invoked when an unknown error is thrown on a worker while:
     * processing a request, run a background task or
     * processing another event (only events that runs on a worker).
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (error) => {}
     */
    error?: Event<ErrorFunction>;
    /**
     * An event that gets invoked when at least one BackError is thrown on the server while processing a request.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (backError) => {}
     */
    backErrors?: Event<BackErrorsFunction>;
    /**
     * An event that gets invoked when a CodeError is thrown on the server while processing a request.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (codeError) => {}
     */
    codeError?: Event<CodeErrorFunction>;
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
}

export interface PrecompiledEvents extends Events {
    express: ExpressFunction;
    socketServer: SocketServerFunction;
    workerInit: WorkerInitFunction;
    masterInit: MasterInitFunction;
    workerStarted: WorkerStartedFunction;
    httpServerStarted: HttpServerStartedFunction;
    wsServerStarted: WsServerStartedFunction;
    started: StartedFunction;
    error: ErrorFunction;
    backErrors: BackErrorsFunction;
    codeError: CodeErrorFunction;
    workerMessage: WorkerMessageFunction;

    socketInit: SocketInitFunction;
    socketConnection: SocketConnectionFunction;
    socketDisconnection: SocketDisconnectionFunction;
    socketAuthentication: SocketAuthenticationFunction;
    socketDeauthentication: SocketDeauthenticationFunction;
    socketAuthStateChange: SocketAuthStateChangeFunction;
    socketSubscription: SocketSubscriptionFunction;
    socketUnsubscription: SocketUnsubscriptionFunction;
    socketError: SocketErrorFunction;
    socketRaw: SocketRawFunction;
    socketConnectionAbort: SocketConnectionAbortFunction;
    socketBadAuthToken: SocketBadAuthTokenFunction;
}