/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                         = require('./../constants/constWrapper');
import ExpressCore                   = require("express-serve-static-core");
import SmallBag                      = require("../../api/SmallBag");
import ZationInfoObj                 = require("../infoObjects/zationInfo");
import ZationWorker                  = require("../../main/zationWorker");
import TaskError                     = require("../../api/TaskError");
import TaskErrorBag                  = require("../../api/TaskErrorBag");

export type ExpressFunction = (smallBag : SmallBag, express : ExpressCore.Express) => Promise<void> | void;
export type WorkerIsStartedFunction = (smallBag : SmallBag, info : ZationInfoObj, worker : ZationWorker) => Promise<void> | void;
export type HttpServerIsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type WsServerIsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type IsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type BeforeErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type BeforeTaskErrorFunction = (smallBag : SmallBag, taskError : TaskError) => Promise<void> | void;
export type BeforeTaskErrorBagFunction = (smallBag : SmallBag, taskErrorBag : TaskErrorBag) => Promise<void> | void;
export type GetUserCountFunction = (smallBag : SmallBag) => Promise<number> | number;

export type SocketErrorFunction = (smallBag : SmallBag, socket : object, error : object) => Promise<void> | void;
export type SocketFunction = (smallBag : SmallBag, socket : object) => Promise<void> | void;
export type SocketConnectionFunction = (smallBag : SmallBag, socket : object, conState : object) => Promise<void> | void;
export type SocketObjFunction = (smallBag : SmallBag, socket : object, obj : object) => Promise<void> | void;
export type SocketAuthenticateFunction = (smallBag : SmallBag, socket : object, authToken : object) => Promise<void> | void;
export type SocketDeauthenticateFunction = (smallBag : SmallBag, socket : object, oldAuthToken : object) => Promise<void> | void;
export type SocketMessageFunction = (smallBag : SmallBag, socket : object, message : string) => Promise<void> | void;

export type ScServerErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type ScServerNoticeFunction = (smallBag : SmallBag, note : object) => Promise<void> | void;
export type ScServerSocketFunction = (smallBag : SmallBag, socket : object) => Promise<void> | void;
export type ScServerConnectionFunction = (smallBag : SmallBag, socket : object, conState : object) => Promise<void> | void;
export type ScServerSubscriptionFunction = (smallBag : SmallBag, socket : object, channelName : string, channelOptions : object) => Promise<void> | void;
export type ScServerUnsubscriptionFunction = (smallBag : SmallBag, socket : object, channelName : string) => Promise<void> | void;
export type ScServerAuthenticationFunction = (smallBag : SmallBag, socket : object, authToken : object) => Promise<void> | void;
export type ScServerDeauthenticationFunction = (smallBag : SmallBag, socket : object, oldAuthToken : object) => Promise<void> | void;
export type ScServerBadSocketAuthTokenFunction = (smallBag : SmallBag, socket : object, obj : object) => Promise<void> | void;
export type ScServerReadyFunction = (smallBag : SmallBag) => Promise<void> | void;

export type MiddlewareFunction = (smallBag : SmallBag,req : object) => Promise<boolean> | boolean | Promise<object> | object | Promise<any> | any;

export interface EventConfig
{
    [Const.Event.ZATION_EXPRESS] ?: ExpressFunction | ExpressFunction[];
    [Const.Event.ZATION_WORKER_IS_STARTED] ?: WorkerIsStartedFunction | ExpressFunction[];
    [Const.Event.ZATION_HTTP_SERVER_IS_STARTED] ?: HttpServerIsStartedFunction | HttpServerIsStartedFunction[];
    [Const.Event.ZATION_WS_SERVER_IS_STARTED] ?: WsServerIsStartedFunction | WsServerIsStartedFunction[];
    [Const.Event.ZATION_IS_STARTED] ?: IsStartedFunction | IsStartedFunction[];
    [Const.Event.ZATION_BEFORE_ERROR] ?: BeforeErrorFunction | BeforeErrorFunction[];
    [Const.Event.ZATION_BEFORE_TASK_ERROR] ?: BeforeTaskErrorFunction | BeforeTaskErrorFunction[];
    [Const.Event.ZATION_BEFORE_TASK_ERROR_BAG] ?: BeforeTaskErrorBagFunction | BeforeTaskErrorBagFunction[];
    [Const.Event.ZATION_GET_USER_COUNT] ?: GetUserCountFunction;

    [Const.Event.SOCKET_ERROR] ?: SocketErrorFunction | SocketErrorFunction[];
    [Const.Event.SOCKET_RAW] ?: SocketFunction | SocketFunction[];
    [Const.Event.SOCKET_CONNECT] ?: SocketConnectionFunction | SocketConnectionFunction[];
    [Const.Event.SOCKET_DISCONNECT] ?: SocketFunction | SocketFunction[];
    [Const.Event.SOCKET_CONNECT_ABORT] ?: SocketFunction | SocketFunction[];
    [Const.Event.SOCKET_CLOSE] ?: SocketFunction | SocketFunction[];
    [Const.Event.SOCKET_SUBSCRIBE] ?: SocketFunction | SocketFunction[];
    [Const.Event.SOCKET_UNSUBSCRIBE] ?: SocketFunction | SocketFunction[];
    [Const.Event.SOCKET_BAD_AUTH_TOKEN] ?: SocketObjFunction | SocketObjFunction[];
    [Const.Event.SOCKET_AUTHENTICATE] ?: SocketAuthenticateFunction | SocketAuthenticateFunction[];
    [Const.Event.SOCKET_DEAUTHENTICATE] ?: SocketDeauthenticateFunction | SocketDeauthenticateFunction[];
    [Const.Event.SOCKET_AUTH_STATE_CHANGE] ?: SocketFunction | SocketFunction[];
    [Const.Event.SOCKET_MESSAGE] ?: SocketMessageFunction | SocketMessageFunction[];

    [Const.Event.SC_SERVER_ERROR] ?: ScServerErrorFunction | ScServerErrorFunction[];
    [Const.Event.SC_SERVER_NOTICE] ?: ScServerNoticeFunction | ScServerNoticeFunction[];
    [Const.Event.SC_SERVER_HANDSHAKE] ?: ScServerSocketFunction | ScServerSocketFunction[];
    [Const.Event.SC_SERVER_CONNECTION_ABORT] ?: ScServerSocketFunction | ScServerSocketFunction[];
    [Const.Event.SC_SERVER_CONNECTION] ?: ScServerConnectionFunction | ScServerConnectionFunction[];
    [Const.Event.SC_SERVER_DISCONNECTION] ?: ScServerSocketFunction | ScServerSocketFunction[];
    [Const.Event.SC_SERVER_CLOSURE] ?: ScServerSocketFunction | ScServerSocketFunction[];
    [Const.Event.SC_SERVER_SUBSCRIPTION] ?: ScServerSubscriptionFunction | ScServerSubscriptionFunction[];
    [Const.Event.SC_SERVER_UNSUBSCRIPTION] ?: ScServerUnsubscriptionFunction | ScServerUnsubscriptionFunction[];
    [Const.Event.SC_SERVER_AUTHENTICATION] ?: ScServerAuthenticationFunction | ScServerAuthenticationFunction[];
    [Const.Event.SC_SERVER_DEAUTHENTICATION] ?: ScServerDeauthenticationFunction | ScServerDeauthenticationFunction[];
    [Const.Event.SC_SERVER_BAD_SOCKET_AUTH_TOKEN] ?: ScServerBadSocketAuthTokenFunction | ScServerBadSocketAuthTokenFunction[];
    [Const.Event.SC_SERVER_READY] ?: ScServerReadyFunction | ScServerReadyFunction[];

    [Const.Event.MIDDLEWARE_AUTHENTICATE] ?: MiddlewareFunction;
    [Const.Event.MIDDLEWARE_HANDSHAKE_WS] ?: MiddlewareFunction;
    [Const.Event.MIDDLEWARE_HANDSHAKE_SC] ?: MiddlewareFunction;
    [Const.Event.MIDDLEWARE_SUBSCRIBE] ?: MiddlewareFunction;
    [Const.Event.MIDDLEWARE_PUBLISH_IN] ?: MiddlewareFunction;
    [Const.Event.MIDDLEWARE_PUBLISH_OUT] ?: MiddlewareFunction;
    [Const.Event.MIDDLEWARE_EMIT] ?: MiddlewareFunction;
}
