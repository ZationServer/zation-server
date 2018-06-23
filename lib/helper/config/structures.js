/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const       = require('../constants/constWrapper');
const ObjectTools = require('./../tools/objectTools');

class Structures {}

Structures.App = {};
Structures.App[Const.App.KEYS.AUTH_CONTROLLER]      = {types : ['string'],isOptional : true};
Structures.App[Const.App.KEYS.CONTROLLER]           = {types : ['object'],isOptional : true};
Structures.App[Const.App.KEYS.USER_GROUPS]          = {types : ['object'],isOptional : true};
Structures.App[Const.App.KEYS.VERSION_CONTROL]      = {types : ['object'],isOptional : true};
Structures.App[Const.App.KEYS.CONTROLLER_DEFAULT]   = {types : ['object'],isOptional : true};
Structures.App[Const.App.KEYS.OBJECTS]              = {types : ['object'],isOptional : true};
Structures.App[Const.App.KEYS.VALIDATION_GROUPS]    = {types : ['object'],isOptional : true};


Structures.AppObject = {};
Structures.AppObject[Const.App.OBJECTS.PROPERTIES]        = {types : ['object'],isOptional : false};
Structures.AppObject[Const.App.OBJECTS.COMPILE_AS]        = {types : ['function'],isOptional : true};

Structures.AppController = {};
Structures.AppController[Const.App.CONTROLLER.INPUT]             = {types : ['object'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.BEFORE_HANDLE]     = {types : ['function','array'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.SYSTEM_CONTROLLER] = {types : ['boolean'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.SOCKET_ACCESS]     = {types : ['boolean'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.HTTP_ACCESS]       = {types : ['boolean'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.INPUT_VALIDATION]  = {types : ['boolean'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.EXTRA_SECURE]      = {types : ['boolean'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.INPUT_CAN_MISSING] = {types : ['boolean'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.PATH]              = {types : ['string'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.NAME]              = {types : ['string'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.ACCESS]            = {types : ['string','function','number','array'],isOptional : true};
Structures.AppController[Const.App.CONTROLLER.NOT_ACCESS]        = {types : ['string','function','number','array'],isOptional : true};

Structures.Main = {};
Structures.Main[Const.Main.KEYS.PORT]                    = {types : ['number'],isOptional : true};
Structures.Main[Const.Main.KEYS.HOSTNAME]                = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.DEBUG]                   = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.START_DEBUG]             = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.SHOW_CONFIG_WARNINGS]    = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.ENVIRONMENT]             = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.TIME_ZONE]               = {types : ['string'],isOptional : true};

Structures.Main[Const.Main.KEYS.WORKERS]
    = {types : ['number','string'],isOptional : true, stringOnlyEnum : [Const.Main.OPTIONS.AUTO]};

Structures.Main[Const.Main.KEYS.BROKERS]
    = {types : ['number','string'],isOptional : true, stringOnlyEnum : [Const.Main.OPTIONS.AUTO]};

Structures.Main[Const.Main.KEYS.APP_NAME]                = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.SECURE]                  = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.HTTPS_CONFIG]            = {types : ['object'],isOptional : true};
Structures.Main[Const.Main.KEYS.USE_AUTH]                = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.USE_PROTOCOL_CHECK]      = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.SEND_ERRORS_DESC]        = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE] = {types : ['number'],isOptional : true};
Structures.Main[Const.Main.KEYS.USE_PANEL]               = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.PANEL_USER]              = {types : ['object'],isOptional : true};
Structures.Main[Const.Main.KEYS.CLIENT_JS_PREPARE]       = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO]  = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO]  = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.TEMP_DB_ERROR_INFO_LIVE_TIME] = {types : ['number'],isOptional : true};

Structures.Main[Const.Main.KEYS.TEMP_DB_ENGINE] =
    {types : ['string'],isOptional : true,enum : [Const.Main.TEMP_DB_ENGINE.MONGO,Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY]};

Structures.Main[Const.Main.KEYS.TEMP_DB_Name]            = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.TEMP_DB_CONFIG]          = {types : ['object'],isOptional : true};
Structures.Main[Const.Main.KEYS.EXTRA_SECURE_AUTH]       = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.AUTH_START]              = {types : ['boolean'],isOptional : true};
Structures.Main[Const.Main.KEYS.AUTH_START_DURATION_MS]  = {types : ['number'],isOptional : true};
Structures.Main[Const.Main.KEYS.POST_KEY_WORD]           = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.CONTROLLER]              = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.CONFIG]                  = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.APP_CONFIG]              = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.CHANNEL_CONFIG]          = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.MAIN_CONFIG]             = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.ERROR_CONFIG]            = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.EVENT_CONFIG]            = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.SERVICE_CONFIG]          = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.AUTH_KEY]                = {types : ['string','object'],isOptional : true};
Structures.Main[Const.Main.KEYS.AUTH_DEFAULT_EXPIRY]     = {types : ['number'],isOptional : true};
Structures.Main[Const.Main.KEYS.AUTH_ALGORITHM]          = {types : ['string'],isOptional : true};
Structures.Main[Const.Main.KEYS.AUTH_PRIVATE_KEY]        = {types : ['string','object'],isOptional : true};
Structures.Main[Const.Main.KEYS.AUTH_PUBLIC_KEY]         = {types : ['string','object'],isOptional : true};

Structures.InputBody = {};
let allValidationTypes = ObjectTools.getObjValues(Const.Validator.TYPE);
Structures.InputBody[Const.App.INPUT.TYPE]                    = {types : ['string'],isOptional : true,enum:allValidationTypes};
Structures.InputBody[Const.App.INPUT.IS_OPTIONAL]             = {types : ['boolean'],isOptional : true};
Structures.InputBody[Const.App.INPUT.IS_ARRAY]                = {types : ['boolean'],isOptional : true};
Structures.InputBody[Const.App.INPUT.VALIDATION_GROUP]        = {types : ['string'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_ENUM]      = {types : ['array'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_PRIVATE_ENUM]   = {types : ['array'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_MIN_LENGTH]     = {types : ['number'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_MAX_LENGTH]     = {types : ['number'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_LENGTH]         = {types : ['number'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_CONTAINS]       = {types : ['string'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_EQUALS]         = {types : ['string','number'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_BIGGER_THAN]    = {types : ['number'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_LESSER_THAN]    = {types : ['number'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_REGEX]          = {types : ['string'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_ENDS_WITH]      = {types : ['string'],isOptional : true};
Structures.InputBody[Const.Validator.KEYS.FUNCTION_STARTS_WITH]    = {types : ['string'],isOptional : true};
let allFormatLetters = ObjectTools.getObjValues(Const.Validator.FORMAT_LETTERS);
Structures.InputBody[Const.Validator.KEYS.FORMAT_IS_LETTERS]       = {types : ['string'],isOptional : true,enum:allFormatLetters};

Structures.ValidationGroup = {};
Structures.ValidationGroup[Const.App.INPUT.TYPE]                    = {types : ['string'],isOptional : true,enum:allValidationTypes};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_ENUM]      = {types : ['array'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_PRIVATE_ENUM]   = {types : ['array'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_MIN_LENGTH]     = {types : ['number'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_MAX_LENGTH]     = {types : ['number'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_LENGTH]         = {types : ['number'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_CONTAINS]       = {types : ['string'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_EQUALS]         = {types : ['string','number'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_BIGGER_THAN]    = {types : ['number'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_LESSER_THAN]    = {types : ['number'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_REGEX]          = {types : ['string'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_ENDS_WITH]      = {types : ['string'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FUNCTION_STARTS_WITH]    = {types : ['string'],isOptional : true};
Structures.ValidationGroup[Const.Validator.KEYS.FORMAT_IS_LETTERS]       = {types : ['string'],isOptional : true,enum:allFormatLetters};

Structures.ChannelConfig = {};
Structures.ChannelConfig[Const.Channel.KEYS.DEFAULTS]             = {types : ['object'],isOptional : true};
Structures.ChannelConfig[Const.Channel.KEYS.CUSTOM_CHANNELS]      = {types : ['object'],isOptional : true};

Structures.ServiceConfig = {};
Structures.ServiceConfig[Const.Service.KEYS.SERVICES]             = {types : ['object'],isOptional : true};
Structures.ServiceConfig[Const.Service.KEYS.CUSTOM_SERVICES]      = {types : ['object'],isOptional : true};

Structures.ChannelItem = {};
Structures.ChannelItem[Const.Channel.CHANNEL.PUBLISH]           = {types : ['function','boolean'],isOptional : true};
Structures.ChannelItem[Const.Channel.CHANNEL.SUBSCRIBE]         = {types : ['function','boolean'],isOptional : true};

Structures.Services = {};
Structures.Services[Const.Service.SERVICES.MYSQL]                  = {types : ['object'],isOptional : true};
Structures.Services[Const.Service.SERVICES.NODE_MAILER]            = {types : ['object'],isOptional : true};
Structures.Services[Const.Service.SERVICES.POSTGRES_SQL]           = {types : ['object'],isOptional : true};
Structures.Services[Const.Service.SERVICES.MONGO_DB]               = {types : ['object'],isOptional : true};

Structures.EventConfig = {};
Structures.EventConfig[Const.Event.ZATION_EXPRESS]                   = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_WORKER_IS_STARTED]         = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_HTTP_SERVER_IS_STARTED]    = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_SOCKET_SERVER_IS_STARTED]  = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_IS_STARTED]                = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_BEFORE_ERROR]              = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_BEFORE_TASK_ERROR]         = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_BEFORE_TASK_ERROR_BAG]     = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_BACKGROUND_TASK]           = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.ZATION_GET_USER_COUNT]            = {types : ['function'],isOptional : true};

Structures.EventConfig[Const.Event.SC_SERVER_ERROR]                  = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_NOTICE]                 = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_HANDSHAKE]              = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_CONNECTION_ABORT]       = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_CONNECTION]             = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_DISCONNECTION]          = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_CLOSURE]                = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_SUBSCRIPTION]           = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_UNSUBSCRIPTION]         = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_AUTHENTICATION]         = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_DEAUTHENTICATION]       = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SC_SERVER_BAD_SOCKET_AUTH_TOKEN]  = {types : ['function','array'],isOptional : true};

Structures.EventConfig[Const.Event.SOCKET_ERROR]                     = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_RAW]                       = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_CONNECT]                   = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_DISCONNECT]                = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_CONNECT_ABORT]             = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_CLOSE]                     = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_SUBSCRIBE]                 = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_UNSUBSCRIBE]               = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_BAD_AUTH_TOKEN]            = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_AUTHENTICATE]              = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_DEAUTHENTICATE]            = {types : ['function','array'],isOptional : true};
Structures.EventConfig[Const.Event.SOCKET_MESSAGE]                   = {types : ['function','array'],isOptional : true};

Structures.EventConfig[Const.Event.MIDDLEWARE_AUTHENTICATE]          = {types : ['function'],isOptional : true};
Structures.EventConfig[Const.Event.MIDDLEWARE_HANDSHAKE_WS]          = {types : ['function'],isOptional : true};
Structures.EventConfig[Const.Event.MIDDLEWARE_HANDSHAKE_SC]          = {types : ['function'],isOptional : true};
Structures.EventConfig[Const.Event.MIDDLEWARE_SUBSCRIBE]             = {types : ['function'],isOptional : true};
Structures.EventConfig[Const.Event.MIDDLEWARE_PUBLISH_IN]            = {types : ['function'],isOptional : true};
Structures.EventConfig[Const.Event.MIDDLEWARE_PUBLISH_OUT]           = {types : ['function'],isOptional : true};
Structures.EventConfig[Const.Event.MIDDLEWARE_EMIT]                  = {types : ['function'],isOptional : true};

module.exports = Structures;