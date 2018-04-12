/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Event {}

//Zation Events
Event.ZATION_EXPRESS                     = 'express'; //SmallBag + Express
Event.ZATION_WORKER_IS_STARTED           = 'workerIsStarted'; //SmallBag + workerInformationObj
Event.ZATION_HTTP_SERVER_IS_STARTED      = 'httpServerIsStarted'; // infoObj
Event.ZATION_SOCKET_SERVER_IS_STARTED    = 'socketServerIsStarted'; // infoObj
Event.ZATION_IS_STARTED                  = 'isStarted'; // infoObj
Event.ZATION_BEFORE_ERROR                = 'beforeError'; //SmallBag + Error
Event.ZATION_BEFORE_TASK_ERROR           = 'beforeTaskError'; //SmallBag + Error
Event.ZATION_BEFORE_TASK_ERROR_BAG       = 'beforeTaskErrorBag'; //SmallBag + Error
Event.ZATION_BACKGROUND_TASK             = 'backgroundTask'; //SmallBag

//SocketCluster Socket Events
Event.SOCKET_ERROR                       = 'socketError';
Event.SOCKET_RAW                         = 'socketRaw';
Event.SOCKET_CONNECT                     = 'socketConnect';
Event.SOCKET_DISCONNECT                  = 'socketDisconnect';
Event.SOCKET_CONNECT_ABORT               = 'socketConnectAbort';
Event.SOCKET_CLOSE                       = 'socketClose';
Event.SOCKET_SUBSCRIBE                   = 'socketSubscribe';
Event.SOCKET_UNSUBSCRIBE                 = 'socketUnsubscribe';
Event.SOCKET_BAD_AUTH_TOKEN              = 'socketBadAuthToken';
Event.SOCKET_AUTHENTICATE                = 'socketAuthenticate';
Event.SOCKET_DEAUTHENTICATE              = 'socketDeauthenticate';
Event.SOCKET_MESSAGE                     = 'socketMessage';

//SocketCluster ScServer Events
Event.SC_SERVER_ERROR                    = 'scServerError';
Event.SC_SERVER_NOTICE                   = 'scServerNotice';
Event.SC_SERVER_HANDSHAKE                = 'scServerHandshake';
Event.SC_SERVER_CONNECTION_ABORT         = 'scServerConnectionAbort';
Event.SC_SERVER_CONNECTION               = 'scServerConnection';
Event.SC_SERVER_DISCONNECTION            = 'scServerDisconnection';
Event.SC_SERVER_CLOSURE                  = 'scServerClosure';
Event.SC_SERVER_SUBSCRIPTION             = 'scServerSubscription';
Event.SC_SERVER_UNSUBSCRIPTION           = 'scServerUnsubscription';
Event.SC_SERVER_AUTHENTICATION           = 'scServerAuthentication';
Event.SC_SERVER_DEAUTHENTICATION         = 'scServerDeauthentication';
Event.SC_SERVER_BAD_SOCKET_AUTH_TOKEN    = 'scServerBadSocketAuthToken';

//SocketCluster Middleware
Event.MIDDLEWARE_HANDSHAKE_WS            = 'middlewareHandshakeWs';
Event.MIDDLEWARE_HANDSHAKE_SC            = 'middlewareHandshakeSc';
Event.MIDDLEWARE_SUBSCRIBE               = 'middlewareSubscribe';
Event.MIDDLEWARE_PUBLISH_IN              = 'middlewarePublishIn';
Event.MIDDLEWARE_PUBLISH_OUT             = 'middlewarePublishOut';
Event.MIDDLEWARE_EMIT                    = 'middlewareEmit';


module.exports = Event;