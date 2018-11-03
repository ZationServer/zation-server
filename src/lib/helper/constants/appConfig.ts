/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS {
    static readonly AUTH_CONTROLLER         = 'authController';
    static readonly CONTROLLER              = 'controller';
    static readonly USER_GROUPS             = 'userGroups';
    static readonly CONTROLLER_DEFAULTS     = 'controllerDefaults';
    static readonly OBJECTS                 = 'objects';
    static readonly INPUT_GROUPS            = 'inputGroups';
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

class AUTH_USER_GROUP {
    static readonly PANEL_ACCESS       = 'panelAccess';
    static readonly PANEL_DISPLAY_NAME = 'panelDisplayName';
}

class OBJECTS {
    static readonly PROPERTIES             = 'properties';
    static readonly CONSTRUCT              = 'construct';
    static readonly EXTENDS                = 'extends';
}

class CONTROLLER {
    static readonly FILE_NAME           = 'fileName';
    static readonly FILE_PATH           = 'filePath';
    static readonly INPUT               = 'input';
    static readonly BEFORE_HANDLE       = 'beforeHandle';
    static readonly SYSTEM_CONTROLLER   = 'systemController';
    static readonly HTTP_ACCESS         = 'httpAccess';
    static readonly HTTP_GET_ALLOWED    = 'httpGetAllowed';
    static readonly HTTP_POST_ALLOWED   = 'httpPostAllowed';
    static readonly WS_ACCESS           = 'wsAccess';
    static readonly INPUT_VALIDATION    = 'inputValidation';
    static readonly INPUT_ALL_ALLOW     = 'inputAllAllow';
    static readonly ACCESS              = 'access';
    static readonly NOT_ACCESS          = 'notAccess';
    static readonly VERSION_ACCESS      = 'versionAccess';
}

class ACCESS {
    static readonly ALL_AUTH                = 'allAuth';
    static readonly ALL_NOT_AUTH            = 'allNotAuth';
    static readonly ALL                     = 'all';
}

class INPUT {
    static readonly IS_OPTIONAL              = 'isOptional';
    static readonly ARRAY                    = 'array';
    static readonly CONVERT                  = 'convert';
    static readonly CONVERT_TYPE             = 'convertType';
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
    public static readonly AUTH_USER_GROUP = AUTH_USER_GROUP;
    public static readonly OBJECTS = OBJECTS;
    public static readonly CONTROLLER = CONTROLLER;
    public static readonly ACCESS = ACCESS;
    public static readonly INPUT = INPUT;
    public static readonly ARRAY = ARRAY;
    public static readonly BACKGROUND_TASKS = BACKGROUND_TASKS;
}

export = AppConfig;
