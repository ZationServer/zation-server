/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ExpressCore                   = require("express-serve-static-core");
import SmallBag                      = require("../../api/SmallBag");
import ZationInfoObj                 = require("../infoObjects/zationInfo");
import ZationWorker                  = require("../../main/zationWorker");
import TaskError                     = require("../../api/TaskError");
import TaskErrorBag                  = require("../../api/TaskErrorBag");
import {ScServer}                      from "../sc/scServer";
import {Socket}                        from "../sc/socket";
import {ZationToken}                   from "../constants/internal";

export type ExpressFunction = (smallBag : SmallBag, express : ExpressCore.Express) => Promise<void> | void;
export type ScServerFunction = (smallBag : SmallBag, scServer : ScServer) => Promise<void> | void;
export type ZationSocketFunction = (smallBag : SmallBag,socket : Socket) => Promise<void> | void;
export type WorkerIsStartedFunction = (smallBag : SmallBag, info : ZationInfoObj, worker : ZationWorker) => Promise<void> | void;
export type HttpServerIsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type WsServerIsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type IsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type BeforeErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type BeforeTaskErrorFunction = (smallBag : SmallBag, taskError : TaskError) => Promise<void> | void;
export type BeforeCodeErrorFunction = (smallBag : SmallBag, taskError : TaskError) => Promise<void> | void;
export type BeforeTaskErrorBagFunction = (smallBag : SmallBag, taskErrorBag : TaskErrorBag) => Promise<void> | void;
export type ZationSocketDisconnectionFunction = (smallBag : SmallBag,socket : Socket,code : any, data : any) => Promise<void> | void;
export type ZationWorkerMessageFunction = (smallBag : SmallBag, data : any) => Promise<void> | void;

export type MiddlewareAuthenticationFunction = (smallBag : SmallBag,zationToken  : ZationToken) => Promise<boolean | object | any> | boolean | object | any;

export type SocketErrorFunction = (smallBag : SmallBag, socket : Socket, error : object) => Promise<void> | void;
export type SocketRawFunction = (smallBag : SmallBag, socket : Socket, data : any) => Promise<void> | void;
export type SocketConnectFunction = (smallBag : SmallBag, socket : Socket, conState : {isAuthenticated : boolean, authError ?: object}) => Promise<void> | void;
export type SocketCodeDataFunction = (smallBag : SmallBag, socket : Socket,code : any,data : any) => Promise<void> | void;
export type SocketSubscribeFunction = (smallBag : SmallBag, socket : Socket, channelName : string, channelOptions : object) => Promise<void> | void;
export type SocketUnsubscribeFunction = (smallBag : SmallBag, socket : Socket, channelName : string) => Promise<void> | void;
export type SocketBadAuthTokenFunction = (smallBag : SmallBag, socket : Socket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void;
export type SocketAuthenticateFunction = (smallBag : SmallBag, socket : Socket, authToken : object) => Promise<void> | void;
export type SocketDeauthenticateFunction = (smallBag : SmallBag, socket : Socket, oldAuthToken : object) => Promise<void> | void;
export type SocketAuthStateChangeFunction = (smallBag : SmallBag, socket : Socket, stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: object}) => Promise<void> | void;
export type SocketMessageFunction = (smallBag : SmallBag, socket : Socket, message : string) => Promise<void> | void;

export type ScServerErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type ScServerNoticeFunction = (smallBag : SmallBag, note : object) => Promise<void> | void;
export type ScServerSocketFunction = (smallBag : SmallBag, socket : Socket) => Promise<void> | void;
export type ScServerSocketCodeDataFunction = (smallBag : SmallBag, socket : Socket,code : any,data : any) => Promise<void> | void;
export type ScServerConnectionFunction = (smallBag : SmallBag, socket : Socket, conState : {isAuthenticated : boolean, authError ?: object}) => Promise<void> | void;
export type ScServerSubscriptionFunction = (smallBag : SmallBag, socket : Socket, channelName : string, channelOptions : object) => Promise<void> | void;
export type ScServerUnsubscriptionFunction = (smallBag : SmallBag, socket : Socket, channelName : string) => Promise<void> | void;
export type ScServerAuthenticationFunction = (smallBag : SmallBag, socket : Socket, authToken : object) => Promise<void> | void;
export type ScServerDeauthenticationFunction = (smallBag : SmallBag, socket : Socket, oldAuthToken : object) => Promise<void> | void;
export type ScServerAuthenticationStateChangeFunction = (smallBag : SmallBag, socket : Socket,stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: object}) => Promise<void> | void;
export type ScServerBadSocketAuthTokenFunction = (smallBag : SmallBag, socket : Socket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void;
export type ScServerReadyFunction = (smallBag : SmallBag) => Promise<void> | void;

export type ScMiddlewareFunction = (smallBag : SmallBag, req : object) => Promise<boolean> | boolean | Promise<object> | object | Promise<any> | any;

export interface EventConfig
{
    express  ?: ExpressFunction | ExpressFunction[];
    scServer  ?: ScServerFunction | ScServerFunction[];
    socket  ?: ZationSocketFunction | ZationSocketFunction[];
    workerIsStarted  ?: WorkerIsStartedFunction | WorkerIsStartedFunction[];
    workerLeaderIsStarted ?: WorkerIsStartedFunction | WorkerIsStartedFunction[];
    httpServerIsStarted  ?: HttpServerIsStartedFunction | HttpServerIsStartedFunction[];
    wsServerIsStarted  ?: WsServerIsStartedFunction | WsServerIsStartedFunction[];
    isStarted  ?: IsStartedFunction | IsStartedFunction[];
    beforeError  ?: BeforeErrorFunction | BeforeErrorFunction[];
    beforeTaskError  ?: BeforeTaskErrorFunction | BeforeTaskErrorFunction[];
    beforeCodeError  ?: BeforeCodeErrorFunction | BeforeCodeErrorFunction[];
    beforeTaskErrorBag  ?: BeforeTaskErrorBagFunction | BeforeTaskErrorBagFunction[];
    socketDisconnection  ?: ZationSocketDisconnectionFunction | ZationSocketDisconnectionFunction[];
    workerMessage  ?: ZationWorkerMessageFunction | ZationWorkerMessageFunction[];
    middlewareAuthenticate  ?: MiddlewareAuthenticationFunction;

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

    sc_middlewareAuthenticate  ?: ScMiddlewareFunction;
    sc_middlewareHandshakeWs  ?: ScMiddlewareFunction;
    sc_middlewareHandshakeSc  ?: ScMiddlewareFunction;
    sc_middlewareSubscribe  ?: ScMiddlewareFunction;
    sc_middlewarePublishIn  ?: ScMiddlewareFunction;
    sc_middlewarePublishOut  ?: ScMiddlewareFunction;
    sc_middlewareEmit  ?: ScMiddlewareFunction;
}
