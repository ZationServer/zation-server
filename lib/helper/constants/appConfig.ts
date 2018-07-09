/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class AppConfig
{
    public static readonly KEYS = KEYS;
    public static readonly USER_GROUPS = USER_GROUPS;
    public static readonly OBJECTS = OBJECTS;
    public static readonly CONTROLLER = CONTROLLER;
    public static readonly ACCESS = ACCESS;
    public static readonly INPUT = INPUT;
    public static readonly ARRAY = ARRAY;
}


enum KEYS {
    AUTH_CONTROLLER         = 'authController',
    CONTROLLER              = 'controller',
    USER_GROUPS             = 'userGroups',
    VERSION_CONTROL         = 'versionControl',
    CONTROLLER_DEFAULT      = 'controllerDefault',
    OBJECTS                 = 'objects',
    VALIDATION_GROUPS       = 'validationGroups'
}

enum USER_GROUPS {
    DEFAULT          = 'default',
    AUTH             = 'auth'
}

enum OBJECTS {
    PROPERTIES             = 'properties',
    COMPILE_AS             = 'compileAs'
}

enum CONTROLLER {
    NAME                = 'name',
    PATH                = 'path',
    INPUT               = 'input',
    BEFORE_HANDLE       = 'beforeHandle',
    EXTRA_SECURE        = 'extraSecure',
    SYSTEM_CONTROLLER   = 'systemController',
    HTTP_ACCESS         = 'httpAccess',
    WS_ACCESS           = 'wsAccess',
    INPUT_VALIDATION    = 'inputValidation',
    INPUT_ALL_ALLOW     = 'inputAllAllow',
    NOT_ACCESS          = 'notAccess',
    ACCESS              = 'access'
}

enum ACCESS {
    ALL_AUTH                = 'allAuth',
    ALL_NOT_AUTH            = 'allNotAuth',
    ALL                     = 'all'
}

enum INPUT {
    TYPE                     = 'type',
    IS_OPTIONAL              = 'isOptional',
    ARRAY                    = 'array',
    VALIDATION_GROUP         = 'validationGroup'
}

enum ARRAY {
    MIN_LENGTH               = 'minLength',
    MAX_LENGTH               = 'maxLength',
    LENGTH                   = 'length'
}

export = AppConfig;
