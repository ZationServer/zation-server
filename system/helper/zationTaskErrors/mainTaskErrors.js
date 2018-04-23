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
        isFromZationSystem : true
    },

    controllerIsNotAController : {
        name          : 'controllerIsNotAController',
        description   : 'controller is not a object from type Controller',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : false,
        //INFO
        // controllerName
        isFromZationSystem : true
    },

    systemNotFound  : {
        name          : 'systemNotFound',
        description   : 'system not found on Server',
        type          : ErrorType.COMPATIBILITY_ERROR,
        sendInfo      : false,
        //INFO
        // systemName (From missing system)
        isFromZationSystem : true
    },

    versionToOld    : {
        name          : 'versionToOld',
        description   : 'Version is to old',
        type          : ErrorType.COMPATIBILITY_ERROR,
        sendInfo      : true,
        //INFO
        // minVersion (Version you need min)
        isFromZationSystem : true
    },

    paramsMissing    : {
        name          : 'paramsMissing',
        description   : 'input params are Missing',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // paramsMissing[] (All params are missing in array)
        isFromZationSystem : true
    },

    paramsMissingInObject    : {
        name          : 'paramsMissingInObject',
        description   : 'Some keys from the object don\'t equals the param names',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // paramsMissing[] (All params are missing in array)
        isFromZationSystem : true
    },

    toManyParams    : {
        name          : 'toManyParams',
        description   : 'to many Params in Controller',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // sendParams[] (All params are send (valueOnly))
        // expectedParams[] (All params are expected (from Config))
        isFromZationSystem : true
    },

    savedAuthGroupInTokenNotFound    : {
        name          : 'savedAuthGroupInTokenNotFound',
        description   : 'the auth group is saved in the token is not found on the zation Config',
        type          : ErrorType.TOKEN_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        // savedAuthGroup (the saved auth group in token)
        // authGroupsInZationConfig (auth groups in the zation config)
        isFromZationSystem : true
    },

    tokenWithoutAuthGroup   : {
        name          : 'tokenWithoutAuthGroup',
        description   : 'Token without auth group!',
        type          : ErrorType.TOKEN_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        isFromZationSystem : true
    },

    defaultGroupNotFound    : {
        name          : 'defaultGroupNotFound',
        description   : 'Default group is not set in the app config',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        isFromZationSystem : true
    },

    groupsConfigNotFound    : {
        name          : 'groupsConfigNotFound',
        description   : 'Groups config is not found in the app config',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        isFromZationSystem : true
    },

    doubleAccessKeyWord  : {
        name          : 'doubleAccessKeyWord',
        description   : 'double Access KeyWord is use in Controller or auth Default!',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        // isInController (show if it is in a Controller, if not it is in Default)
        isFromZationSystem : true
    },

    noAccessToController  : {
        name          : 'noAccessToController',
        description   : 'you have no access to this controller!',
        type          : ErrorType.AUTH_ERROR,
        sendInfo      : true,
        //INFO
        // authIn (show if you auth in system)
        // authType (your auth type)
        isFromZationSystem : true
    },

    noValidatorTypeValue : {
        name          : 'noValidatorValue',
        description   : 'no value in validator type',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        //
        isFromZationSystem : true
    },

    notValidValidatorTypeValue : {
        name          : 'noValidValidatorTypeValue',
        description   : 'not valid value in validator type',
        type          : ErrorType.SYSTEM_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        //  value (ValidatorTyp Value)
        isFromZationSystem : true
    },

    wrongInputData : {
        name          : 'wrongInputData',
        description   : 'wrong input data with missing object fields!',
        type          : ErrorType.INPUT_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        //
        isFromZationSystem : true
    },

    noAccessToServerProtocol  : {
        name          : 'noAccessToServerProtocol',
        description   : 'you have no access to this controller with this server protocol!',
        type          : ErrorType.PROTOCOL_ERROR,
        sendInfo      : true,
        //INFO
        // protocol   (The protocol you request with)
        // controller (The controller you request)
        isFromZationSystem : true
    },

    cantSetUndefinedId : {
        name          : 'cantSetUndefinedId',
        description   : 'cant set undefined id!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        isFromZationSystem : true
    },

    zationKeyConflict : {
        name          : 'zationKeyConflict',
        description   : 'cant Save Data With conflict with Zation Key!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        // key (key like to Set)
        isFromZationSystem : true
    },

    tryToUseNotConfiguredService : {
        name          : 'tryToUseNotConfiguredService',
        description   : 'try to use not configured service!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        // service (service name)
        // key (optional)
        isFromZationSystem : true
    },

    unknownSystemError : {
        name          : 'unknownSystemError',
        description   : 'look in info for more detail! To see run in debug!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        // info (info from Exception only in Debug Mode!)
        isFromZationSystem : true
    },

    unknownTokenVerifyError : {
        name          : 'unknownTokenVerifyError',
        description   : 'look in info for more detail!',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : false,
        //INFO
        isFromZationSystem : true
    },

    unknownTokenSignError : {
        name          : 'unknownTokenSignError',
        description   : 'look in info for more detail!',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : false,
        //INFO
        isFromZationSystem : true
    },

    tokenExpiredError : {
        name          : 'tokenExpiredError',
        description   : 'jwt expired',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : true,
        //INFO
        // expiredAt
        isFromZationSystem : true
    },

    jsonWebTokenError : {
        name          : 'jsonWebTokenError',
        description   : 'json web token error',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : true,
        //INFO
        // message
        isFromZationSystem : true
    },

    tokenIsBlocked : {
        name          : 'tokenIsBlocked',
        description   : 'token is blocked',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : true,
        //INFO
        // token
        isFromZationSystem : true
    },

};