/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Event
{
    //Zation Events
    static readonly ZATION_EXPRESS                     = 'express'; //SmallBag + Express ok
    static readonly ZATION_WORKER_IS_STARTED           = 'workerIsStarted'; //SmallBag + infoObj + worker ok
    static readonly ZATION_HTTP_SERVER_IS_STARTED      = 'httpServerIsStarted'; // infoObj ok
    static readonly ZATION_WS_SERVER_IS_STARTED        = 'wsServerIsStarted'; // infoObj ok
    static readonly ZATION_IS_STARTED                  = 'isStarted'; // infoObj ok
    static readonly ZATION_BEFORE_ERROR                = 'beforeError'; //SmallBag + Error ok
    static readonly ZATION_BEFORE_TASK_ERROR           = 'beforeTaskError'; //SmallBag + Error ok
    static readonly ZATION_BEFORE_TASK_ERROR_BAG       = 'beforeTaskErrorBag'; //SmallBag + Error ok
    static readonly ZATION_GET_USER_COUNT              = 'getUserCount'; //SmallBag

    //SocketCluster Socket Events
    static readonly SOCKET_ERROR                       = 'socketError';
    static readonly SOCKET_RAW                         = 'socketRaw';
    static readonly SOCKET_CONNECT                     = 'socketConnect';
    static readonly SOCKET_DISCONNECT                  = 'socketDisconnect';
    static readonly SOCKET_CONNECT_ABORT               = 'socketConnectAbort';
    static readonly SOCKET_CLOSE                       = 'socketClose';
    static readonly SOCKET_SUBSCRIBE                   = 'socketSubscribe';
    static readonly SOCKET_UNSUBSCRIBE                 = 'socketUnsubscribe';
    static readonly SOCKET_BAD_AUTH_TOKEN              = 'socketBadAuthToken';
    static readonly SOCKET_AUTHENTICATE                = 'socketAuthenticate';
    static readonly SOCKET_DEAUTHENTICATE              = 'socketDeauthenticate';
    static readonly SOCKET_AUTH_STATE_CHANGE           = 'socketAuthStateChange';
    static readonly SOCKET_MESSAGE                     = 'socketMessage';

    //SocketCluster ScServer Events
    static readonly SC_SERVER_ERROR                    = 'scServerError';
    static readonly SC_SERVER_NOTICE                   = 'scServerNotice';
    static readonly SC_SERVER_HANDSHAKE                = 'scServerHandshake';
    static readonly SC_SERVER_CONNECTION_ABORT         = 'scServerConnectionAbort';
    static readonly SC_SERVER_CONNECTION               = 'scServerConnection';
    static readonly SC_SERVER_DISCONNECTION            = 'scServerDisconnection';
    static readonly SC_SERVER_CLOSURE                  = 'scServerClosure';
    static readonly SC_SERVER_SUBSCRIPTION             = 'scServerSubscription';
    static readonly SC_SERVER_UNSUBSCRIPTION           = 'scServerUnsubscription';
    static readonly SC_SERVER_AUTHENTICATION           = 'scServerAuthentication';
    static readonly SC_SERVER_DEAUTHENTICATION         = 'scServerDeauthentication';
    static readonly SC_SERVER_BAD_SOCKET_AUTH_TOKEN    = 'scServerBadSocketAuthToken';
    static readonly SC_SERVER_READY                    = 'scServerReady';

    //SocketCluster Middleware
    static readonly MIDDLEWARE_AUTHENTICATE            = 'middlewareAuthenticate';
    static readonly MIDDLEWARE_HANDSHAKE_WS            = 'middlewareHandshakeWs';
    static readonly MIDDLEWARE_HANDSHAKE_SC            = 'middlewareHandshakeSc';
    static readonly MIDDLEWARE_SUBSCRIBE               = 'middlewareSubscribe';
    static readonly MIDDLEWARE_PUBLISH_IN              = 'middlewarePublishIn';
    static readonly MIDDLEWARE_PUBLISH_OUT             = 'middlewarePublishOut';
    static readonly MIDDLEWARE_EMIT                    = 'middlewareEmit';
}

export = Event;