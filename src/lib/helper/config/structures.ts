/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const       = require('../constants/constWrapper');
import ObjectTools = require('../tools/objectTools');

const Error = {};
Error[Const.Settings.ERROR.NAME]                       = {types : ['string'],isOptional : true};
Error[Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM]      = {types : ['boolean'],isOptional : true};
Error[Const.Settings.ERROR.SEND_INFO]                  = {types : ['boolean'],isOptional : true};
Error[Const.Settings.ERROR.IS_PRIVATE]                 = {types : ['boolean'],isOptional : true};
Error[Const.Settings.ERROR.DESCRIPTION]                = {types : ['string'],isOptional : true};
Error[Const.Settings.ERROR.TYPE]                       = {types : ['string'],isOptional : true};
Error[Const.Settings.ERROR.INFO]                       = {types : ['object'],isOptional : true};

const App = {};
App[Const.App.KEYS.AUTH_CONTROLLER]      = {types : ['string'],isOptional : true};
App[Const.App.KEYS.CONTROLLER]           = {types : ['object'],isOptional : true};
App[Const.App.KEYS.USER_GROUPS]          = {types : ['object'],isOptional : true};
App[Const.App.KEYS.VERSION_CONTROL]      = {types : ['object'],isOptional : true};
App[Const.App.KEYS.CONTROLLER_DEFAULT]   = {types : ['object'],isOptional : true};
App[Const.App.KEYS.OBJECTS]              = {types : ['object'],isOptional : true};
App[Const.App.KEYS.VALIDATION_GROUPS]    = {types : ['object'],isOptional : true};
App[Const.App.KEYS.BACKGROUND_TASKS]     = {types : ['object'],isOptional : true};

const BackgroundTask = {};
BackgroundTask[Const.App.BACKGROUND_TASKS.EVERY]    = {types : ['number','array','object'],isOptional : true};
BackgroundTask[Const.App.BACKGROUND_TASKS.AT]       = {types : ['number','array','object'],isOptional : true};
BackgroundTask[Const.App.BACKGROUND_TASKS.TASK]     = {types : ['function','array'],isOptional : true};

const AppObject = {};
AppObject[Const.App.OBJECTS.PROPERTIES]        = {types : ['object'],isOptional : false};
AppObject[Const.App.OBJECTS.BUILDER]           = {types : ['function'],isOptional : true};
AppObject[Const.App.OBJECTS.EXTENDS]           = {types : ['string'],isOptional : true};

const AppController = {};   
AppController[Const.App.CONTROLLER.INPUT]             = {types : ['object'],isOptional : true};
AppController[Const.App.CONTROLLER.BEFORE_HANDLE]     = {types : ['function','array'],isOptional : true};
AppController[Const.App.CONTROLLER.SYSTEM_CONTROLLER] = {types : ['boolean'],isOptional : true};
AppController[Const.App.CONTROLLER.WS_ACCESS]         = {types : ['boolean'],isOptional : true};
AppController[Const.App.CONTROLLER.HTTP_ACCESS]       = {types : ['boolean'],isOptional : true};
AppController[Const.App.CONTROLLER.INPUT_VALIDATION]  = {types : ['boolean'],isOptional : true};
AppController[Const.App.CONTROLLER.INPUT_ALL_ALLOW]   = {types : ['boolean'],isOptional : true};
AppController[Const.App.CONTROLLER.EXTRA_SECURE]      = {types : ['boolean'],isOptional : true};
AppController[Const.App.CONTROLLER.PATH]              = {types : ['string'],isOptional : true};
AppController[Const.App.CONTROLLER.NAME]              = {types : ['string'],isOptional : true};
AppController[Const.App.CONTROLLER.ACCESS]            = {types : ['string','function','number','array'],isOptional : true};
AppController[Const.App.CONTROLLER.NOT_ACCESS]        = {types : ['string','function','number','array'],isOptional : true};

const Main = {};
Main[Const.Main.KEYS.PORT]                    = {types : ['number'],isOptional : true};
Main[Const.Main.KEYS.HOSTNAME]                = {types : ['string'],isOptional : true};
Main[Const.Main.KEYS.DEBUG]                   = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.START_DEBUG]             = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.SHOW_CONFIG_WARNINGS]    = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.ENVIRONMENT]             = {types : ['string'],isOptional : true};
Main[Const.Main.KEYS.TIME_ZONE]               = {types : ['string'],isOptional : true};
Main[Const.Main.KEYS.ZATION_CONSOLE_LOG]      = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.SC_CONSOLE_LOG]          = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.LEADER_INSTANCE]         = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.USE_SC_UWS]              = {types : ['boolean'],isOptional : true};

Main[Const.Main.KEYS.WORKERS]
    = {types : ['number','string'],isOptional : true, stringOnlyEnum : [Const.Main.OPTIONS.AUTO]};

Main[Const.Main.KEYS.BROKERS]
    = {types : ['number','string'],isOptional : true, stringOnlyEnum : [Const.Main.OPTIONS.AUTO]};

Main[Const.Main.KEYS.APP_NAME]                = {types : ['string'],isOptional : true};
Main[Const.Main.KEYS.SECURE]                  = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.HTTPS_CONFIG]            = {types : ['object'],isOptional : true};
Main[Const.Main.KEYS.USE_AUTH]                = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.USE_PROTOCOL_CHECK]      = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.SEND_ERRORS_DESC]        = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.SYSTEM_BACKGROUND_TASK_REFRESH_RATE] = {types : ['number'],isOptional : true};
Main[Const.Main.KEYS.USE_PANEL]               = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.PANEL_USER]              = {types : ['object','array'],isOptional : true};
Main[Const.Main.KEYS.CLIENT_JS_PREPARE]       = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.USE_TEMP_DB_TOKEN_INFO]  = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.USE_TEMP_DB_ERROR_INFO]  = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.TEMP_DB_ERROR_INFO_LIVE_TIME] = {types : ['number'],isOptional : true};
Main[Const.Main.KEYS.PATH]                    = {types : ['string'],isOptional : true};

Main[Const.Main.KEYS.TEMP_DB_ENGINE] =
    {types : ['string'],isOptional : true,enum : [Const.Main.TEMP_DB_ENGINE.MONGO,Const.Main.TEMP_DB_ENGINE.MASTER_MEMORY]};

Main[Const.Main.KEYS.TEMP_DB_Name]            = {types : ['string'],isOptional : true};
Main[Const.Main.KEYS.TEMP_DB_CONFIG]          = {types : ['object'],isOptional : true};
Main[Const.Main.KEYS.EXTRA_SECURE_AUTH]       = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.AUTH_START]              = {types : ['boolean'],isOptional : true};
Main[Const.Main.KEYS.AUTH_START_DURATION_MS]  = {types : ['number'],isOptional : true};
Main[Const.Main.KEYS.POST_KEY_WORD]           = {types : ['string'],isOptional : true};
Main[Const.Main.KEYS.AUTH_KEY]                = {types : ['string','object'],isOptional : true};
Main[Const.Main.KEYS.AUTH_DEFAULT_EXPIRY]     = {types : ['number'],isOptional : true};
Main[Const.Main.KEYS.AUTH_ALGORITHM]          = {types : ['string'],isOptional : true};
Main[Const.Main.KEYS.AUTH_PRIVATE_KEY]        = {types : ['string','object'],isOptional : true};
Main[Const.Main.KEYS.AUTH_PUBLIC_KEY]         = {types : ['string','object'],isOptional : true};

const StarterConfig = {};
ObjectTools.addObToOb(StarterConfig,Main);
StarterConfig[Const.Starter.KEYS.CONTROLLER]          = {types : ['string'],isOptional : true};
StarterConfig[Const.Starter.KEYS.CONFIG]              = {types : ['string'],isOptional : true};
StarterConfig[Const.Starter.KEYS.APP_CONFIG]          = {types : ['string','object'],isOptional : true};
StarterConfig[Const.Starter.KEYS.SERVICE_CONFIG]      = {types : ['string','object'],isOptional : true};
StarterConfig[Const.Starter.KEYS.ERROR_CONFIG]        = {types : ['string','object'],isOptional : true};
StarterConfig[Const.Starter.KEYS.EVENT_CONFIG]        = {types : ['string','object'],isOptional : true};
StarterConfig[Const.Starter.KEYS.CHANNEL_CONFIG]      = {types : ['string','object'],isOptional : true};
StarterConfig[Const.Starter.KEYS.MAIN_CONFIG]         = {types : ['string','object'],isOptional : true};

const InputBodyMainKeys = {};
InputBodyMainKeys[Const.App.INPUT.IS_OPTIONAL]             = {types : ['boolean'],isOptional : true};

const allValidationTypes = ObjectTools.getObjValues(Const.Validator.TYPE);
const allFormatLetters = ObjectTools.getObjValues(Const.Validator.FORMAT_LETTERS);

const InputBody = {};
InputBody[Const.App.INPUT.TYPE]                    = {types : ['string','array'],isOptional : true,enum:allValidationTypes};
InputBody[Const.App.INPUT.IS_OPTIONAL]             = {types : ['boolean'],isOptional : true};
InputBody[Const.App.INPUT.VALIDATION_GROUP]        = {types : ['string'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_ENUM]      = {types : ['array'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_PRIVATE_ENUM]   = {types : ['array'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_MIN_LENGTH]     = {types : ['number'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_MAX_LENGTH]     = {types : ['number'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_LENGTH]         = {types : ['number'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_CONTAINS]       = {types : ['string'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_EQUALS]         = {types : ['string','number'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_BIGGER_THAN]    = {types : ['number'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_LESSER_THAN]    = {types : ['number'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_REGEX]          = {types : ['string'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_ENDS_WITH]      = {types : ['string'],isOptional : true};
InputBody[Const.Validator.KEYS.FUNCTION_STARTS_WITH]    = {types : ['string'],isOptional : true};
InputBody[Const.Validator.KEYS.FORMAT_IS_LETTERS]       = {types : ['string'],isOptional : true,enum:allFormatLetters};

const ValidationGroup = {};
ValidationGroup[Const.App.INPUT.TYPE]                    = {types : ['string','array'],isOptional : true,enum:allValidationTypes};
ValidationGroup[Const.Validator.KEYS.FUNCTION_ENUM]      = {types : ['array'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_PRIVATE_ENUM]   = {types : ['array'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_MIN_LENGTH]     = {types : ['number'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_MAX_LENGTH]     = {types : ['number'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_LENGTH]         = {types : ['number'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_CONTAINS]       = {types : ['string'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_EQUALS]         = {types : ['string','number','object'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_BIGGER_THAN]    = {types : ['number'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_LESSER_THAN]    = {types : ['number'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_REGEX]          = {types : ['string'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_ENDS_WITH]      = {types : ['string'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FUNCTION_STARTS_WITH]    = {types : ['string'],isOptional : true};
ValidationGroup[Const.Validator.KEYS.FORMAT_IS_LETTERS]       = {types : ['string'],isOptional : true,enum:allFormatLetters};

const ChannelConfig = {};
ChannelConfig[Const.Channel.KEYS.DEFAULTS]                = {types : ['object'],isOptional : true};
ChannelConfig[Const.Channel.KEYS.CUSTOM_CHANNELS]         = {types : ['object'],isOptional : true};
ChannelConfig[Const.Channel.KEYS.CUSTOM_ID_CHANNELS]      = {types : ['object'],isOptional : true};

const HttpsConfig = {};
HttpsConfig[Const.Main.HTTPS_CONFIG.CER]             = {types : ['string'],isOptional : true};
HttpsConfig[Const.Main.HTTPS_CONFIG.KEY]             = {types : ['string'],isOptional : true};

const ServiceConfig = {};
ServiceConfig[Const.Service.KEYS.SERVICES]             = {types : ['object'],isOptional : true};
ServiceConfig[Const.Service.KEYS.CUSTOM_SERVICES]      = {types : ['object'],isOptional : true};

const PanelUserConfig = {};
PanelUserConfig[Const.Main.PANEL_USER.USER_NAME]             = {types : ['string'],isOptional : false};
PanelUserConfig[Const.Main.PANEL_USER.PASSWORD]              = {types : ['string'],isOptional : false};

const ChannelItem = {};
ChannelItem[Const.Channel.CHANNEL.PUBLISH_ACCESS]       = {types : ['function','boolean','number','array','string'],isOptional : true};
ChannelItem[Const.Channel.CHANNEL.SUBSCRIBE_ACCESS]     = {types : ['function','boolean','number','array','string'],isOptional : true};
ChannelItem[Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS] = {types : ['function','boolean','number','array','string'],isOptional : true};
ChannelItem[Const.Channel.CHANNEL.PUBLISH_NOT_ACCESS]   = {types : ['function','boolean','number','array','string'],isOptional : true};
ChannelItem[Const.Channel.CHANNEL.ON_PUBLISH]           = {types : ['function'],isOptional : true};
ChannelItem[Const.Channel.CHANNEL.ON_SUBSCRIPTION]      = {types : ['function'],isOptional : true};

const Services = {};
Services[Const.Service.SERVICES.MYSQL]                  = {types : ['object'],isOptional : true};
Services[Const.Service.SERVICES.NODE_MAILER]            = {types : ['object'],isOptional : true};
Services[Const.Service.SERVICES.POSTGRES_SQL]           = {types : ['object'],isOptional : true};
Services[Const.Service.SERVICES.MONGO_DB]               = {types : ['object'],isOptional : true};

const AppArray = {};
AppArray[Const.App.INPUT.ARRAY]                    = {types : ['object'],isOptional : true};
AppArray[Const.App.ARRAY.MIN_LENGTH]               = {types : ['number'],isOptional : true};
AppArray[Const.App.ARRAY.MAX_LENGTH]               = {types : ['number'],isOptional : true};
AppArray[Const.App.ARRAY.LENGTH]                   = {types : ['number'],isOptional : true};
AppArray[Const.App.INPUT.IS_OPTIONAL]              = {types : ['boolean'],isOptional: true};

const ArrayShortCutSpecify = {};
ArrayShortCutSpecify[Const.App.ARRAY.MIN_LENGTH]               = {types : ['number'],isOptional : true};
ArrayShortCutSpecify[Const.App.ARRAY.MAX_LENGTH]               = {types : ['number'],isOptional : true};
ArrayShortCutSpecify[Const.App.ARRAY.LENGTH]                   = {types : ['number'],isOptional : true};

const EventConfig = {};
EventConfig[Const.Event.ZATION_EXPRESS]                   = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.ZATION_WORKER_IS_STARTED]         = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.ZATION_HTTP_SERVER_IS_STARTED]    = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.ZATION_WS_SERVER_IS_STARTED]  = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.ZATION_IS_STARTED]                = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.ZATION_BEFORE_ERROR]              = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.ZATION_BEFORE_TASK_ERROR]         = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.ZATION_BEFORE_TASK_ERROR_BAG]     = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.ZATION_GET_USER_COUNT]            = {types : ['function'],isOptional : true};

EventConfig[Const.Event.SC_SERVER_ERROR]                  = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_NOTICE]                 = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_HANDSHAKE]              = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_CONNECTION_ABORT]       = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_CONNECTION]             = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_DISCONNECTION]          = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_CLOSURE]                = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_SUBSCRIPTION]           = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_UNSUBSCRIPTION]         = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_AUTHENTICATION]         = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_DEAUTHENTICATION]       = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_BAD_SOCKET_AUTH_TOKEN]  = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SC_SERVER_READY]                  = {types : ['function','array'],isOptional : true};

EventConfig[Const.Event.SOCKET_ERROR]                     = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_RAW]                       = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_CONNECT]                   = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_DISCONNECT]                = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_CONNECT_ABORT]             = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_CLOSE]                     = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_SUBSCRIBE]                 = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_UNSUBSCRIBE]               = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_BAD_AUTH_TOKEN]            = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_AUTHENTICATE]              = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_DEAUTHENTICATE]            = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_AUTH_STATE_CHANGE]         = {types : ['function','array'],isOptional : true};
EventConfig[Const.Event.SOCKET_MESSAGE]                   = {types : ['function','array'],isOptional : true};

EventConfig[Const.Event.MIDDLEWARE_AUTHENTICATE]          = {types : ['function'],isOptional : true};
EventConfig[Const.Event.MIDDLEWARE_HANDSHAKE_WS]          = {types : ['function'],isOptional : true};
EventConfig[Const.Event.MIDDLEWARE_HANDSHAKE_SC]          = {types : ['function'],isOptional : true};
EventConfig[Const.Event.MIDDLEWARE_SUBSCRIBE]             = {types : ['function'],isOptional : true};
EventConfig[Const.Event.MIDDLEWARE_PUBLISH_IN]            = {types : ['function'],isOptional : true};
EventConfig[Const.Event.MIDDLEWARE_PUBLISH_OUT]           = {types : ['function'],isOptional : true};
EventConfig[Const.Event.MIDDLEWARE_EMIT]                  = {types : ['function'],isOptional : true};

class Structures
{
    public static readonly App = App;
    public static readonly BackgroundTask = BackgroundTask;
    public static readonly AppObject = AppObject;
    public static readonly AppController = AppController;
    public static readonly Main = Main;
    public static readonly StarterConfig = StarterConfig;
    public static readonly InputBodyMainKeys = InputBodyMainKeys;
    public static readonly InputBody = InputBody;
    public static readonly ValidationGroup = ValidationGroup;
    public static readonly ChannelConfig = ChannelConfig;
    public static readonly ServiceConfig = ServiceConfig;
    public static readonly ChannelItem = ChannelItem;
    public static readonly Services = Services;
    public static readonly AppArray = AppArray;
    public static readonly ArrayShortCutSpecify = ArrayShortCutSpecify;
    public static readonly EventConfig = EventConfig;
    public static readonly Error = Error;
    public static readonly HttpsConfig = HttpsConfig;
    public static readonly PanelUserConfig = PanelUserConfig;
}

export = Structures;