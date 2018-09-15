/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS {
    static readonly AUTH_CONTROLLER         = 'authController';
    static readonly CONTROLLER              = 'controller';
    static readonly USER_GROUPS             = 'userGroups';
    static readonly VERSION_CONTROL         = 'versionControl';
    static readonly CONTROLLER_DEFAULT      = 'controllerDefault';
    static readonly OBJECTS                 = 'objects';
    static readonly VALIDATION_GROUPS       = 'validationGroups';
    static readonly BACKGROUND_TASKS        = 'backgroundTasks';
}

class BACKGROUND_TASKS {
    static readonly EVERY            = 'every';
    static readonly AT               = 'at';
    static readonly TASK             = 'task';
}

class USER_GROUPS {
    static readonly DEFAULT          = 'default';
    static readonly AUTH             = 'auth';
}

class OBJECTS {
    static readonly PROPERTIES             = 'properties';
    static readonly CONSTRUCT              = 'construct';
    static readonly EXTENDS                = 'extends';
}

class CONTROLLER {
    static readonly NAME                = 'name';
    static readonly PATH                = 'path';
    static readonly INPUT               = 'input';
    static readonly BEFORE_HANDLE       = 'beforeHandle';
    static readonly SYSTEM_CONTROLLER   = 'systemController';
    static readonly HTTP_ACCESS         = 'httpAccess';
    static readonly WS_ACCESS           = 'wsAccess';
    static readonly INPUT_VALIDATION    = 'inputValidation';
    static readonly INPUT_ALL_ALLOW     = 'inputAllAllow';
    static readonly NOT_ACCESS          = 'notAccess';
    static readonly ACCESS              = 'access';
}

class ACCESS {
    static readonly ALL_AUTH                = 'allAuth';
    static readonly ALL_NOT_AUTH            = 'allNotAuth';
    static readonly ALL                     = 'all';
}

class INPUT {
    static readonly TYPE                     = 'type';
    static readonly IS_OPTIONAL              = 'isOptional';
    static readonly ARRAY                    = 'array';
    static readonly VALIDATION_GROUP         = 'validationGroup';
}

class ARRAY {
    static readonly MIN_LENGTH               = 'minLength';
    static readonly MAX_LENGTH               = 'maxLength';
    static readonly LENGTH                   = 'length';
}

class AppConfig
{
    public static readonly KEYS = KEYS;
    public static readonly USER_GROUPS = USER_GROUPS;
    public static readonly OBJECTS = OBJECTS;
    public static readonly CONTROLLER = CONTROLLER;
    public static readonly ACCESS = ACCESS;
    public static readonly INPUT = INPUT;
    public static readonly ARRAY = ARRAY;
    public static readonly BACKGROUND_TASKS = BACKGROUND_TASKS;
}

export = AppConfig;
