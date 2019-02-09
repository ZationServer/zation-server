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
import ZationToken                   = require("../infoObjects/zationTokenInfo");
import SocketInfo                    = require("../infoObjects/socketInfo");
import {ScServer}                      from "../sc/scServer";
import {Socket}                        from "../sc/socket";

export type ExpressFunction = (smallBag : SmallBag, express : ExpressCore.Express) => Promise<void> | void;
export type ScServerFunction = (smallBag : SmallBag, scServer : ScServer) => Promise<void> | void;
export type ZationSocketFunction = (smallBag : SmallBag, socketInfo : SocketInfo) => Promise<void> | void;
export type WorkerIsStartedFunction = (smallBag : SmallBag, info : ZationInfoObj, worker : ZationWorker) => Promise<void> | void;
export type HttpServerIsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type WsServerIsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type IsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type BeforeErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type BeforeTaskErrorFunction = (smallBag : SmallBag, taskError : TaskError) => Promise<void> | void;
export type BeforeCodeErrorFunction = (smallBag : SmallBag, taskError : TaskError) => Promise<void> | void;
export type BeforeTaskErrorBagFunction = (smallBag : SmallBag, taskErrorBag : TaskErrorBag) => Promise<void> | void;
export type ZationSocketDisconnectionFunction = (smallBag : SmallBag, socketInfo : SocketInfo,code : any, data : any) => Promise<void> | void;
export type ZationWorkerMessageFunction = (smallBag : SmallBag, data : any) => Promise<void> | void;

export type MiddlewareAuthenticationFunction = (smallBag : SmallBag,zationToken  : ZationToken) => Promise<boolean> | boolean | Promise<object> | object | Promise<any> | any;

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

    socketError  ?: SocketErrorFunction | SocketErrorFunction[];
    socketRaw  ?: SocketRawFunction | SocketRawFunction[];
    socketConnect  ?: SocketConnectFunction | SocketConnectFunction[];
    socketDisconnect  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    socketConnectAbort  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    socketClose  ?: SocketCodeDataFunction | SocketCodeDataFunction[];
    socketSubscribe  ?: SocketSubscribeFunction | SocketSubscribeFunction[];
    socketUnsubscribe  ?: SocketUnsubscribeFunction | SocketUnsubscribeFunction[];
    socketBadAuthToken  ?: SocketBadAuthTokenFunction | SocketBadAuthTokenFunction[];
    socketAuthenticate  ?: SocketAuthenticateFunction | SocketAuthenticateFunction[];
    socketDeauthenticate  ?: SocketDeauthenticateFunction | SocketDeauthenticateFunction[];
    socketAuthStateChange  ?: SocketAuthStateChangeFunction | SocketAuthStateChangeFunction[];
    socketMessage  ?: SocketMessageFunction | SocketMessageFunction[];

    scServerError  ?: ScServerErrorFunction | ScServerErrorFunction[];
    scServerNotice  ?: ScServerNoticeFunction | ScServerNoticeFunction[];
    scServerHandshake  ?: ScServerSocketFunction | ScServerSocketFunction[];
    scServerConnectionAbort  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    scServerDisconnection  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    scServerClosure  ?: ScServerSocketCodeDataFunction | ScServerSocketCodeDataFunction[];
    scServerConnection  ?: ScServerConnectionFunction | ScServerConnectionFunction[];
    scServerSubscription  ?: ScServerSubscriptionFunction | ScServerSubscriptionFunction[];
    scServerUnsubscription  ?: ScServerUnsubscriptionFunction | ScServerUnsubscriptionFunction[];
    scServerAuthentication  ?: ScServerAuthenticationFunction | ScServerAuthenticationFunction[];
    scServerDeauthentication  ?: ScServerDeauthenticationFunction | ScServerDeauthenticationFunction[];
    scServerAuthenticationStateChange  ?: ScServerAuthenticationStateChangeFunction | ScServerAuthenticationStateChangeFunction[];
    scServerBadSocketAuthToken  ?: ScServerBadSocketAuthTokenFunction | ScServerBadSocketAuthTokenFunction[];
    scServerReady  ?: ScServerReadyFunction | ScServerReadyFunction[];

    scMiddlewareAuthenticate  ?: ScMiddlewareFunction;
    scMiddlewareHandshakeWs  ?: ScMiddlewareFunction;
    scMiddlewareHandshakeSc  ?: ScMiddlewareFunction;
    scMiddlewareSubscribe  ?: ScMiddlewareFunction;
    scMiddlewarePublishIn  ?: ScMiddlewareFunction;
    scMiddlewarePublishOut  ?: ScMiddlewareFunction;
    scMiddlewareEmit  ?: ScMiddlewareFunction;
}
