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
import BagExtension                    from "../bagExtension/bagExtension";

export type ExpressFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), express : ExpressCore.Express) => Promise<void> | void;
export type ScServerFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), scServer : ScServer) => Promise<void> | void;
export type ZationSocketFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socketInfo : SocketInfo) => Promise<void> | void;
export type WorkerIsStartedFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), info : ZationInfoObj, worker : ZationWorker) => Promise<void> | void;
export type HttpServerIsStartedFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (info : ZationInfoObj) => Promise<void> | void;
export type WsServerIsStartedFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (info : ZationInfoObj) => Promise<void> | void;
export type IsStartedFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (info : ZationInfoObj) => Promise<void> | void;
export type BeforeErrorFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), error : object) => Promise<void> | void;
export type BeforeTaskErrorFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), taskError : TaskError) => Promise<void> | void;
export type BeforeCodeErrorFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), taskError : TaskError) => Promise<void> | void;
export type BeforeTaskErrorBagFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), taskErrorBag : TaskErrorBag) => Promise<void> | void;
export type ZationSocketDisconnectionFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socketInfo : SocketInfo,code : any, data : any) => Promise<void> | void;
export type ZationWorkerMessageFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), data : any) => Promise<void> | void;

export type MiddlewareAuthenticationFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]),zationToken  : ZationToken) => Promise<boolean> | boolean | Promise<object> | object | Promise<any> | any;

export type SocketErrorFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, error : object) => Promise<void> | void;
export type SocketRawFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, data : any) => Promise<void> | void;
export type SocketConnectFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, conState : {isAuthenticated : boolean, authError ?: object}) => Promise<void> | void;
export type SocketCodeDataFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket,code : any,data : any) => Promise<void> | void;
export type SocketSubscribeFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, channelName : string, channelOptions : object) => Promise<void> | void;
export type SocketUnsubscribeFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, channelName : string) => Promise<void> | void;
export type SocketBadAuthTokenFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void;
export type SocketAuthenticateFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, authToken : object) => Promise<void> | void;
export type SocketDeauthenticateFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, oldAuthToken : object) => Promise<void> | void;
export type SocketAuthStateChangeFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: object}) => Promise<void> | void;
export type SocketMessageFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, message : string) => Promise<void> | void;

export type ScServerErrorFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), error : object) => Promise<void> | void;
export type ScServerNoticeFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), note : object) => Promise<void> | void;
export type ScServerSocketFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket) => Promise<void> | void;
export type ScServerSocketCodeDataFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket,code : any,data : any) => Promise<void> | void;
export type ScServerConnectionFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, conState : {isAuthenticated : boolean, authError ?: object}) => Promise<void> | void;
export type ScServerSubscriptionFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, channelName : string, channelOptions : object) => Promise<void> | void;
export type ScServerUnsubscriptionFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, channelName : string) => Promise<void> | void;
export type ScServerAuthenticationFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, authToken : object) => Promise<void> | void;
export type ScServerDeauthenticationFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, oldAuthToken : object) => Promise<void> | void;
export type ScServerAuthenticationStateChangeFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket,stateChangeData : {oldState : string,newState : string,signedAuthToken ?: string,authToken ?: object}) => Promise<void> | void;
export type ScServerBadSocketAuthTokenFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), socket : Socket, badAuthStatus : {authError : object,signedAuthToken : string}) => Promise<void> | void;
export type ScServerReadyFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"])) => Promise<void> | void;

export type ScMiddlewareFunction<E extends BagExtension = {smallBag:{},bag:{}}> = (smallBag : (SmallBag & E["smallBag"]), req : object) => Promise<boolean> | boolean | Promise<object> | object | Promise<any> | any;

export interface EventConfig<E extends BagExtension = {smallBag:{},bag:{}}>
{
    express  ?: ExpressFunction<E> | ExpressFunction<E>[];
    scServer  ?: ScServerFunction<E> | ScServerFunction<E>[];
    socket  ?: ZationSocketFunction<E> | ZationSocketFunction<E>[];
    workerIsStarted  ?: WorkerIsStartedFunction<E> | WorkerIsStartedFunction<E>[];
    workerLeaderIsStarted ?: WorkerIsStartedFunction<E> | WorkerIsStartedFunction<E>[];
    httpServerIsStarted  ?: HttpServerIsStartedFunction<E> | HttpServerIsStartedFunction<E>[];
    wsServerIsStarted  ?: WsServerIsStartedFunction<E> | WsServerIsStartedFunction<E>[];
    isStarted  ?: IsStartedFunction<E> | IsStartedFunction<E>[];
    beforeError  ?: BeforeErrorFunction<E> | BeforeErrorFunction<E>[];
    beforeTaskError  ?: BeforeTaskErrorFunction<E> | BeforeTaskErrorFunction<E>[];
    beforeCodeError  ?: BeforeCodeErrorFunction<E> | BeforeCodeErrorFunction<E>[];
    beforeTaskErrorBag  ?: BeforeTaskErrorBagFunction<E> | BeforeTaskErrorBagFunction<E>[];
    socketDisconnection  ?: ZationSocketDisconnectionFunction<E> | ZationSocketDisconnectionFunction<E>[];
    workerMessage  ?: ZationWorkerMessageFunction<E> | ZationWorkerMessageFunction<E>[];

    middlewareAuthenticate  ?: MiddlewareAuthenticationFunction<E>;

    socketError  ?: SocketErrorFunction<E> | SocketErrorFunction<E>[];
    socketRaw  ?: SocketRawFunction<E> | SocketRawFunction<E>[];
    socketConnect  ?: SocketConnectFunction<E> | SocketConnectFunction<E>[];
    socketDisconnect  ?: SocketCodeDataFunction<E> | SocketCodeDataFunction<E>[];
    socketConnectAbort  ?: SocketCodeDataFunction<E> | SocketCodeDataFunction<E>[];
    socketClose  ?: SocketCodeDataFunction<E> | SocketCodeDataFunction<E>[];
    socketSubscribe  ?: SocketSubscribeFunction<E> | SocketSubscribeFunction<E>[];
    socketUnsubscribe  ?: SocketUnsubscribeFunction<E> | SocketUnsubscribeFunction<E>[];
    socketBadAuthToken  ?: SocketBadAuthTokenFunction<E> | SocketBadAuthTokenFunction<E>[];
    socketAuthenticate  ?: SocketAuthenticateFunction<E> | SocketAuthenticateFunction<E>[];
    socketDeauthenticate  ?: SocketDeauthenticateFunction<E> | SocketDeauthenticateFunction<E>[];
    socketAuthStateChange  ?: SocketAuthStateChangeFunction<E> | SocketAuthStateChangeFunction<E>[];
    socketMessage  ?: SocketMessageFunction<E> | SocketMessageFunction<E>[];

    scServerError  ?: ScServerErrorFunction<E> | ScServerErrorFunction<E>[];
    scServerNotice  ?: ScServerNoticeFunction<E> | ScServerNoticeFunction<E>[];
    scServerHandshake  ?: ScServerSocketFunction<E> | ScServerSocketFunction<E>[];
    scServerConnectionAbort  ?: ScServerSocketCodeDataFunction<E> | ScServerSocketCodeDataFunction<E>[];
    scServerDisconnection  ?: ScServerSocketCodeDataFunction<E> | ScServerSocketCodeDataFunction<E>[];
    scServerClosure  ?: ScServerSocketCodeDataFunction<E> | ScServerSocketCodeDataFunction<E>[];
    scServerConnection  ?: ScServerConnectionFunction<E> | ScServerConnectionFunction<E>[];
    scServerSubscription  ?: ScServerSubscriptionFunction<E> | ScServerSubscriptionFunction<E>[];
    scServerUnsubscription  ?: ScServerUnsubscriptionFunction<E> | ScServerUnsubscriptionFunction<E>[];
    scServerAuthentication  ?: ScServerAuthenticationFunction<E> | ScServerAuthenticationFunction<E>[];
    scServerDeauthentication  ?: ScServerDeauthenticationFunction<E> | ScServerDeauthenticationFunction<E>[];
    scServerAuthenticationStateChange  ?: ScServerAuthenticationStateChangeFunction<E> | ScServerAuthenticationStateChangeFunction<E>[];
    scServerBadSocketAuthToken  ?: ScServerBadSocketAuthTokenFunction<E> | ScServerBadSocketAuthTokenFunction<E>[];
    scServerReady  ?: ScServerReadyFunction<E> | ScServerReadyFunction<E>[];

    scMiddlewareAuthenticate  ?: ScMiddlewareFunction<E>;
    scMiddlewareHandshakeWs  ?: ScMiddlewareFunction<E>;
    scMiddlewareHandshakeSc  ?: ScMiddlewareFunction<E>;
    scMiddlewareSubscribe  ?: ScMiddlewareFunction<E>;
    scMiddlewarePublishIn  ?: ScMiddlewareFunction<E>;
    scMiddlewarePublishOut  ?: ScMiddlewareFunction<E>;
    scMiddlewareEmit  ?: ScMiddlewareFunction<E>;
}
