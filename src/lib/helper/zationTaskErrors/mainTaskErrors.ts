/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ErrorType = require('../constants/errorTypes');

export = {

    controllerNotFound : {
        name          : 'controllerNotFound',
        description   : 'Controller is missing',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // controllerName (From missing Controller)
        isFromZationSystem : true
    },

    systemControllerNotFound : {
        name          : 'systemControllerNotFound',
        description   : 'System controller is missing',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // controllerName (From missing Controller)
        isFromZationSystem : true
    },

    authControllerNotSet : {
        name          : 'authControllerNotSet',
        description   : 'Auth controller not set',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
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

    serviceNotFound  : {
        name          : 'serviceNotFound ',
        description   : 'Service not found ',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : false,
        //INFO
        // serviceName (name of the service)
        // serviceKey  (service Key)
        isFromZationSystem : true
    },

    errorNotFound  : {
        name          : 'errorNotFound ',
        description   : 'Error not found ',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : false,
        //INFO
        // errorName (name of the error)
        isFromZationSystem : true
    },

    methodIsNotCompatible  : {
        name          : 'methodIsNotCompatible',
        description   : 'Method is not compatible with request protocol',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : false,
        //INFO
        // reqType
        // requiredReqType
        isFromZationSystem : true
    },

    authenticationError  : {
        name          : 'authenticationError',
        description   : 'Authenticate error by trying to authenticate an socket.',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : false,
        //INFO
        // reason
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

    inputMissing    : {
        name          : 'inputMissing',
        description   : 'input input are Missing',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // inputMissing[] (All input keys are missing)
        isFromZationSystem : true
    },

    inputMissingInObject    : {
        name          : 'inputMissingInObject',
        description   : 'Some keys from the object don\'t equals the input names',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // inputMissing[] (All input are missing in array)
        isFromZationSystem : true
    },

    toMuchInput    : {
        name          : 'toMuchInput',
        description   : 'to many Input in Controller',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        //sendCount : send input Count,
        //expectedMaxCount : controller config max input Count
        isFromZationSystem : true
    },

    arrayWasExpected    : {
        name          : 'arrayWasExpected',
        description   : 'array was expected',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        isFromZationSystem : true
    },

    objectWasExpected    : {
        name          : 'objectWasExpected',
        description   : 'object was expected',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // inputValue (inputValue)
        // inputPath (inputPath)
        isFromZationSystem : true
    },

    objectPropertyIsMissing  : {
        name          : 'objectPropertyIsMissing',
        description   : 'object property is missing (because its not optional)',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // inputValue (inputValue)
        // inputPathMissing (input path to missing property)
        isFromZationSystem : true
    },

    unknownObjectProperty : {
        name          : 'unknownObjectProperty',
        description   : 'unknown object property was in an object input',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // propertyName
        isFromZationSystem : true
    },

    inTokenSavedAuthGroupIsNotFound    : {
        name          : 'inTokenSavedAuthGroupIsNotFound',
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

    authStartActive    : {
        name          : 'authStartActive',
        description   : 'auth start is active, zation only accept auth request for a time!',
        type          : ErrorType.TIME_ERROR,
        isPrivate     : false,
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
        // authUserGroup (your auth type)
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

    inputPathInControllerNotFound : {
        name          : 'inputPathInControllerNotFound',
        description   : 'Input path in controller not found!',
        type          : ErrorType.INPUT_ERROR,
        isPrivate     : true,
        sendInfo      : false,
        //INFO
        //controllerName (name of controller)
        //inputPath
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

    zationKeyConflict : {
        name          : 'zationKeyConflict',
        description   : 'cant Save Data With conflict with Zation Key!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        // key (key like to Set)
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

    authenticateMiddlewareBlock : {
        name          : 'authenticateMiddlewareBlock',
        description   : 'authenticate middleware block req',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : true,
        //INFO
        // err
        isFromZationSystem : true
    }
};