/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ExpressCore                   = require("express-serve-static-core");
import Express                       = require('express');
import ZationWorker                  = require("../../../../core/zationWorker");
import ScServer                        from "../../../sc/scServer";
import {RawZationToken}                from "../../../definitions/internal";
import ServerInfo                      from "../../../internalApi/serverInfo";
import Socket                          from "../../../../api/Socket";
import CodeError                       from "../../../error/codeError";

export type ExpressFunction = (app: ExpressCore.Express,express: typeof Express) => Promise<void> | void;
export type SocketServerFunction = (scServer: ScServer) => Promise<void> | void;
export type WorkerInitFunction = (leader: boolean, respawn: boolean) => Promise<void> | void;
export type BeforeComponentsInitFunction = (workerLeader: boolean) => Promise<void> | void;
export type AfterComponentsInitFunction = (workerLeader: boolean) => Promise<void> | void;
export type MasterInitFunction = (info: ServerInfo) => Promise<void> | void;
export type WorkerStartedFunction = (info: ServerInfo, leader: boolean, respawn: boolean, worker: ZationWorker) => Promise<void> | void;
export type HttpServerStartedFunction = (info: ServerInfo) => Promise<void> | void;
export type WsServerStartedFunction = (info: ServerInfo) => Promise<void> | void;
export type StartedFunction = (info: ServerInfo) => Promise<void> | void;
export type ErrorFunction = (error: Error) => Promise<void> | void;
export type CodeErrorFunction = (codeError: CodeError) => Promise<void> | void;
export type WorkerMessageFunction = (data: any) => Promise<void> | void;

export type SocketInitFunction = (socket: Socket) => Promise<void> | void;
export type SocketConnectionFunction = (socket: Socket) => Promise<void> | void;
export type SocketDisconnectionFunction = (socket: Socket, code: any, data: any) => Promise<void> | void;
export type SocketAuthenticationFunction = (socket: Socket) => Promise<void> | void;
export type SocketDeauthenticationFunction = (socket: Socket) => Promise<void> | void;
export type SocketAuthStateChangeFunction = (socket: Socket, stateChangeData: {oldState: string,newState: string,signedAuthToken?: string,authToken?: RawZationToken}) => Promise<void> | void;
export type SocketErrorFunction = (socket: Socket, error: object) => Promise<void> | void;
export type SocketRawFunction = (socket: Socket, data: any) => Promise<void> | void;
export type SocketConnectionAbortFunction = (socket: Socket, code: any, data: any) => Promise<void> | void;
export type SocketBadAuthTokenFunction = (socket: Socket, badAuthStatus: {authError: object,signedAuthToken: string}) => Promise<void> | void

export type Event<T> = T | T[];

export interface Events
{
    /**
     * An event which that you can initialize an additional HTTP rest API using express.
     * Body-parser is already added to the express middleware.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (app,express) => {}
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
     * An event that will be processed before all components will be initialized.
     * It is useful to prepare things for the initialize of the components.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example async (leaderWorker) => {}
     */
    beforeComponentsInit?: Event<BeforeComponentsInitFunction>;
    /**
     * An event that will be processed after all components have initialized.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example async (leaderWorker) => {}
     */
    afterComponentsInit?: Event<AfterComponentsInitFunction>;
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
     * An event that gets invoked when a CodeError is created.
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

export interface PreparedEvents extends Events {
    express: ExpressFunction;
    socketServer: SocketServerFunction;
    workerInit: WorkerInitFunction;
    beforeComponentsInit: BeforeComponentsInitFunction;
    afterComponentsInit: AfterComponentsInitFunction;
    masterInit: MasterInitFunction;
    workerStarted: WorkerStartedFunction;
    httpServerStarted: HttpServerStartedFunction;
    wsServerStarted: WsServerStartedFunction;
    started: StartedFunction;
    error: ErrorFunction;
    codeError: CodeErrorFunction;
    workerMessage: WorkerMessageFunction;

    socketInit: SocketInitFunction;
    socketConnection: SocketConnectionFunction;
    socketDisconnection: SocketDisconnectionFunction;
    socketAuthentication: SocketAuthenticationFunction;
    socketDeauthentication: SocketDeauthenticationFunction;
    socketAuthStateChange: SocketAuthStateChangeFunction;
    socketError: SocketErrorFunction;
    socketRaw: SocketRawFunction;
    socketConnectionAbort: SocketConnectionAbortFunction;
    socketBadAuthToken: SocketBadAuthTokenFunction;
}