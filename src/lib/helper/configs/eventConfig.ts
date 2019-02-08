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

export type ExpressFunction<SB = {}> = (smallBag : (SmallBag & SB), express : ExpressCore.Express) => Promise<void> | void;
export type ScServerFunction<SB = {}> = (smallBag : (SmallBag & SB), scServer : ScServer) => Promise<void> | void;
export type ZationSocketFunction<SB = {}> = (smallBag : (SmallBag & SB), socketInfo : SocketInfo) => Promise<void> | void;
export type WorkerIsStartedFunction<SB = {}> = (smallBag : (SmallBag & SB), info : ZationInfoObj, worker : ZationWorker) => Promise<void> | void;
export type HttpServerIsStartedFunction<SB = {}> = (info : ZationInfoObj) => Promise<void> | void;
export type WsServerIsStartedFunction<SB = {}> = (info : ZationInfoObj) => Promise<void> | void;
export type IsStartedFunction<SB = {}> = (info : ZationInfoObj) => Promise<void> | void;
export type BeforeErrorFunction<SB = {}> = (smallBag : (SmallBag & SB), error : object) => Promise<void> | void;
export type BeforeTaskErrorFunction<SB = {}> = (smallBag : (SmallBag & SB), taskError : TaskError) => Promise<void> | void;
export type BeforeCodeErrorFunction<SB = {}> = (smallBag : (SmallBag & SB), taskError : TaskError) => Promise<void> | void;
export type BeforeTaskErrorBagFunction<SB = {}> = (smallBag : (SmallBag & SB), taskErrorBag : TaskErrorBag) => Promise<void> | void;
export type ZationSocketDisconnectionFunction<SB = {}> = (smallBag : (SmallBag & SB), socketInfo : SocketInfo,code : any, data : any) => Promise<void> | void;
export type ZationWorkerMessageFunction<SB = {}> = (smallBag : (SmallBag & SB), data : any) => Promise<void> | void;

export type MiddlewareAuthenticationFunction<SB = {}> = (smallBag : (SmallBag & SB),zationToken  : ZationToken) => Promise<boolean> | boolean | Promise<object> | object | Promise<any> | any;

export type SocketErrorFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, error : object) => Promise<void> | void;
export type SocketRawFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, data : any) => Promise<void> | void;
export type SocketConnectFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, conState : {isAuthenticated : boolean, authError ?: object}) => Promise<void> | void;
export type SocketCodeDataFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket,code : any,data : any) => Promise<void> | void;
export type SocketSubscribeFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, channelName : string, channelOptions : object) => Promise<void> | void;
export type SocketUnsubscribeFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, channelName : string) => Promise<void> | void;
export type SocketBadAuthTokenFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void;
export type SocketAuthenticateFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, authToken : object) => Promise<void> | void;
export type SocketDeauthenticateFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, oldAuthToken : object) => Promise<void> | void;
export type SocketAuthStateChangeFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: object}) => Promise<void> | void;
export type SocketMessageFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, message : string) => Promise<void> | void;

export type ScServerErrorFunction<SB = {}> = (smallBag : (SmallBag & SB), error : object) => Promise<void> | void;
export type ScServerNoticeFunction<SB = {}> = (smallBag : (SmallBag & SB), note : object) => Promise<void> | void;
export type ScServerSocketFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket) => Promise<void> | void;
export type ScServerSocketCodeDataFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket,code : any,data : any) => Promise<void> | void;
export type ScServerConnectionFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, conState : {isAuthenticated : boolean, authError ?: object}) => Promise<void> | void;
export type ScServerSubscriptionFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, channelName : string, channelOptions : object) => Promise<void> | void;
export type ScServerUnsubscriptionFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, channelName : string) => Promise<void> | void;
export type ScServerAuthenticationFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, authToken : object) => Promise<void> | void;
export type ScServerDeauthenticationFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, oldAuthToken : object) => Promise<void> | void;
export type ScServerAuthenticationStateChangeFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket,stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: object}) => Promise<void> | void;
export type ScServerBadSocketAuthTokenFunction<SB = {}> = (smallBag : (SmallBag & SB), socket : Socket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void;
export type ScServerReadyFunction<SB = {}> = (smallBag : (SmallBag & SB)) => Promise<void> | void;

export type ScMiddlewareFunction<SB = {}> = (smallBag : (SmallBag & SB), req : object) => Promise<boolean> | boolean | Promise<object> | object | Promise<any> | any;

export interface EventConfig<SB = {}>
{
    express  ?: ExpressFunction<SB> | ExpressFunction<SB>[];
    scServer  ?: ScServerFunction<SB> | ScServerFunction<SB>[];
    socket  ?: ZationSocketFunction<SB> | ZationSocketFunction<SB>[];
    workerIsStarted  ?: WorkerIsStartedFunction<SB> | WorkerIsStartedFunction<SB>[];
    workerLeaderIsStarted ?: WorkerIsStartedFunction<SB> | WorkerIsStartedFunction<SB>[];
    httpServerIsStarted  ?: HttpServerIsStartedFunction<SB> | HttpServerIsStartedFunction<SB>[];
    wsServerIsStarted  ?: WsServerIsStartedFunction<SB> | WsServerIsStartedFunction<SB>[];
    isStarted  ?: IsStartedFunction<SB> | IsStartedFunction<SB>[];
    beforeError  ?: BeforeErrorFunction<SB> | BeforeErrorFunction<SB>[];
    beforeTaskError  ?: BeforeTaskErrorFunction<SB> | BeforeTaskErrorFunction<SB>[];
    beforeCodeError  ?: BeforeCodeErrorFunction<SB> | BeforeCodeErrorFunction<SB>[];
    beforeTaskErrorBag  ?: BeforeTaskErrorBagFunction<SB> | BeforeTaskErrorBagFunction<SB>[];
    socketDisconnection  ?: ZationSocketDisconnectionFunction<SB> | ZationSocketDisconnectionFunction<SB>[];
    workerMessage  ?: ZationWorkerMessageFunction<SB> | ZationWorkerMessageFunction<SB>[];

    middlewareAuthenticate  ?: MiddlewareAuthenticationFunction<SB>;

    socketError  ?: SocketErrorFunction<SB> | SocketErrorFunction<SB>[];
    socketRaw  ?: SocketRawFunction<SB> | SocketRawFunction<SB>[];
    socketConnect  ?: SocketConnectFunction<SB> | SocketConnectFunction<SB>[];
    socketDisconnect  ?: SocketCodeDataFunction<SB> | SocketCodeDataFunction<SB>[];
    socketConnectAbort  ?: SocketCodeDataFunction<SB> | SocketCodeDataFunction<SB>[];
    socketClose  ?: SocketCodeDataFunction<SB> | SocketCodeDataFunction<SB>[];
    socketSubscribe  ?: SocketSubscribeFunction<SB> | SocketSubscribeFunction<SB>[];
    socketUnsubscribe  ?: SocketUnsubscribeFunction<SB> | SocketUnsubscribeFunction<SB>[];
    socketBadAuthToken  ?: SocketBadAuthTokenFunction<SB> | SocketBadAuthTokenFunction<SB>[];
    socketAuthenticate  ?: SocketAuthenticateFunction<SB> | SocketAuthenticateFunction<SB>[];
    socketDeauthenticate  ?: SocketDeauthenticateFunction<SB> | SocketDeauthenticateFunction<SB>[];
    socketAuthStateChange  ?: SocketAuthStateChangeFunction<SB> | SocketAuthStateChangeFunction<SB>[];
    socketMessage  ?: SocketMessageFunction<SB> | SocketMessageFunction<SB>[];

    scServerError  ?: ScServerErrorFunction<SB> | ScServerErrorFunction<SB>[];
    scServerNotice  ?: ScServerNoticeFunction<SB> | ScServerNoticeFunction<SB>[];
    scServerHandshake  ?: ScServerSocketFunction<SB> | ScServerSocketFunction<SB>[];
    scServerConnectionAbort  ?: ScServerSocketCodeDataFunction<SB> | ScServerSocketCodeDataFunction<SB>[];
    scServerDisconnection  ?: ScServerSocketCodeDataFunction<SB> | ScServerSocketCodeDataFunction<SB>[];
    scServerClosure  ?: ScServerSocketCodeDataFunction<SB> | ScServerSocketCodeDataFunction<SB>[];
    scServerConnection  ?: ScServerConnectionFunction<SB> | ScServerConnectionFunction<SB>[];
    scServerSubscription  ?: ScServerSubscriptionFunction<SB> | ScServerSubscriptionFunction<SB>[];
    scServerUnsubscription  ?: ScServerUnsubscriptionFunction<SB> | ScServerUnsubscriptionFunction<SB>[];
    scServerAuthentication  ?: ScServerAuthenticationFunction<SB> | ScServerAuthenticationFunction<SB>[];
    scServerDeauthentication  ?: ScServerDeauthenticationFunction<SB> | ScServerDeauthenticationFunction<SB>[];
    scServerAuthenticationStateChange  ?: ScServerAuthenticationStateChangeFunction<SB> | ScServerAuthenticationStateChangeFunction<SB>[];
    scServerBadSocketAuthToken  ?: ScServerBadSocketAuthTokenFunction<SB> | ScServerBadSocketAuthTokenFunction<SB>[];
    scServerReady  ?: ScServerReadyFunction<SB> | ScServerReadyFunction<SB>[];

    scMiddlewareAuthenticate  ?: ScMiddlewareFunction<SB>;
    scMiddlewareHandshakeWs  ?: ScMiddlewareFunction<SB>;
    scMiddlewareHandshakeSc  ?: ScMiddlewareFunction<SB>;
    scMiddlewareSubscribe  ?: ScMiddlewareFunction<SB>;
    scMiddlewarePublishIn  ?: ScMiddlewareFunction<SB>;
    scMiddlewarePublishOut  ?: ScMiddlewareFunction<SB>;
    scMiddlewareEmit  ?: ScMiddlewareFunction<SB>;
}
