/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let ErrorType = require('../constante/errorTypes');

module.exports = {

    controllerNotFound : {
        name          : 'controllerNotFound',
        description   : 'Controller is missing',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // controllerName (From missing Controller)

        isSystemError : true
    },

    systemNotFound  : {
        name          : 'systemNotFound',
        description   : 'system not found on Server',
        type          : ErrorType.COMPATIBILITY_ERROR,
        sendInfo      : false,
        //INFO
        // systemName (From missing system)
        isSystemError : true
    },

    versionToOld    : {
        name          : 'versionToOld',
        description   : 'Version is to old',
        type          : ErrorType.COMPATIBILITY_ERROR,
        sendInfo      : true,
        //INFO
        // minVersion (Version you need min)
        isSystemError : true
    },

    paramsMissing    : {
        name          : 'paramsMissing',
        description   : 'input params are Missing',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // paramsMissing[] (All params are missing in array)
        isSystemError : true
    },

    paramsMissingInObject    : {
        name          : 'paramsMissingInObject',
        description   : 'Some keys from the object don\'t equals the param names',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // paramsMissing[] (All params are missing in array)
        isSystemError : true
    },

    toManyParams    : {
        name          : 'toManyParams',
        description   : 'to many Params in Controller',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // sendParams[] (All params are send (valueOnly))
        // expectedParams[] (All params are expected (from Config))
        isSystemError : true
    },

    savedAuthGroupFromClientDataNotFound    : {
        name          : 'savedAuthGroupInSessionNotFound',
        description   : 'the Auth Group is saved in the Session is not found on the Zation Config',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        // savedAuthGroup (the saved auth Group in Session)
        // authGroupsInZationConfig (auth Groups in the Zation Config)
        isSystemError : true
    },

    tokenWithoutAuthGroup   : {
        name          : 'tokenWithoutAuthGroup',
        description   : 'Token without AuthGroup!',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        isSystemError : true
    },

    defaultGroupNotFound    : {
        name          : 'defaultGroupNotFound',
        description   : 'no default Group is set in the Zation config',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        isSystemError : true
    },

    doubleAccessKeyWord  : {
        name          : 'doubleAccessKeyWord',
        description   : 'double Access KeyWord is use in Controller or auth Default!',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        // isInController (show if it is in a Controller, if not it is in Default)
        isSystemError : true
    },

    noAccessToController  : {
        name          : 'noAccessToController',
        description   : 'you have no access to this controller!',
        type          : ErrorType.AUTH_ERROR,
        sendInfo      : true,
        //INFO
        // authIn (show if you auth in system)
        // authType (your auth type)
        isSystemError : true
    },

    noValidatorTypeValue : {
        name          : 'noValidatorValue',
        description   : 'no value in validator type',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        //
        isSystemError : true
    },

    notValidValidatorTypeValue : {
        name          : 'noValidValidatorTypeValue',
        description   : 'not valid value in validator type',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        //  value (ValidatorTyp Value)
        isSystemError : true
    },

    wrongInputData : {
        name          : 'wrongInputData',
        description   : 'wrong input data with missing object fields!',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        //
        isSystemError : true
    },

    noAccessToServerProtocol  : {
        name          : 'noAccessToServerProtocol',
        description   : 'you have no access to this controller with this server protocol!',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // protocol   (The protocol you request with)
        // controller (The controller you request)
        isSystemError : true
    },

    cantSetUndefinedId : {
        name          : 'cantSetUndefinedId',
        description   : 'cant set undefined id!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        isSystemError : true
    },

    zationKeyConflict : {
        name          : 'zationKeyConflict',
        description   : 'cant Save Data With conflict with Zation Key!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        // key (key like to Set)
        isSystemError : true
    },

    tryToUseNotConfiguredService : {
        name          : 'tryToUseNotConfiguredService',
        description   : 'Try to use not configured service!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        // service (service name)
        isSystemError : true
    },

    unknownSystemError : {
        name          : 'unknownSystemError',
        description   : 'Look in Info for more Detail! To see run in Debug!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        // info (info from Exception only in Debug Mode!)
        isSystemError : true
    },











};