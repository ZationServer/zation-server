/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class AppConfig {}

AppConfig.KEYS = {};
AppConfig.KEYS.AUTH_CONTROLLER         = 'authController';
AppConfig.KEYS.CONTROLLER              = 'controller';
AppConfig.KEYS.USER_GROUPS             = 'userGroups';
AppConfig.KEYS.VERSION_CONTROL         = 'versionControl';
AppConfig.KEYS.CONTROLLER_DEFAULT      = 'controllerDefault';
AppConfig.KEYS.OBJECTS                 = 'objects';
AppConfig.KEYS.VALIDATION_GROUPS       = 'validationGroups';

AppConfig.USER_GROUPS = {};
AppConfig.USER_GROUPS.DEFAULT          = 'default';
AppConfig.USER_GROUPS.AUTH             = 'auth';

AppConfig.OBJECTS = {};
AppConfig.OBJECTS.PROPERTIES             = 'properties';
AppConfig.OBJECTS.COMPILE_AS             = 'compileAs';

AppConfig.CONTROLLER = {};
AppConfig.CONTROLLER.NAME                = 'name';
AppConfig.CONTROLLER.PATH                = 'path';
AppConfig.CONTROLLER.INPUT               = 'input';
AppConfig.CONTROLLER.BEFORE_HANDLE       = 'beforeHandle';
AppConfig.CONTROLLER.INPUT_CAN_MISSING   = 'inputCanMissing';
AppConfig.CONTROLLER.EXTRA_SECURE        = 'extraSecure';
AppConfig.CONTROLLER.SYSTEM_CONTROLLER   = 'systemController';
AppConfig.CONTROLLER.HTTP_ACCESS         = 'httpAccess';
AppConfig.CONTROLLER.SOCKET_ACCESS       = 'socketAccess';
AppConfig.CONTROLLER.INPUT_VALIDATION    = 'inputValidation';
AppConfig.CONTROLLER.NOT_ACCESS          = 'notAccess';
AppConfig.CONTROLLER.ACCESS              = 'access';

AppConfig.ACCESS ={};
AppConfig.ACCESS.ALL_AUTH                = 'allAuth';
AppConfig.ACCESS.ALL_NOT_AUTH            = 'allNotAuth';
AppConfig.ACCESS.ALL                     = 'all';

AppConfig.INPUT = {};
AppConfig.INPUT.TYPE                     = 'type';
AppConfig.INPUT.IS_OPTIONAL              = 'isOptional';
AppConfig.INPUT.IS_ARRAY                 = 'isArray';
AppConfig.INPUT.VALIDATION_GROUP         = 'validationGroup';

module.exports = AppConfig;