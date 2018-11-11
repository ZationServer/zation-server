/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ErrorType} from "../constants/errorType";

export = {

    controllerNotFound : {
        name          : 'controllerNotFound',
        description   : 'Controller is missing.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // controllerName (From missing Controller)
        fromZationSystem : true
    },

    systemControllerNotFound : {
        name          : 'systemControllerNotFound',
        description   : 'System controller is missing.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        //INFO
        // controllerName (From missing Controller)
        fromZationSystem : true
    },

    authControllerNotSet : {
        name          : 'authControllerNotSet',
        description   : 'Auth controller not set.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : false,
        fromZationSystem : true
    },

    systemNotCompatible  : {
        name          : 'systemNotCompatible',
        description   : 'System is not compatible for this controller.',
        type          : ErrorType.COMPATIBILITY_ERROR,
        sendInfo      : false,
        //INFO
        // system
        fromZationSystem : true
    },

    versionNotCompatible    : {
        name          : 'versionNotCompatible',
        description   : 'Version is not compatible for this controller.',
        type          : ErrorType.COMPATIBILITY_ERROR,
        sendInfo      : true,
        //INFO
        // version
        fromZationSystem : true
    },

    serviceNotFound  : {
        name          : 'serviceNotFound',
        description   : 'Service not found.',
        type          : ErrorType.CODE_ERROR,
        sendInfo      : false,
        private       : true,
        //INFO
        // serviceName (name of the service)
        // serviceKey  (service Key)
        fromZationSystem : true
    },

    errorNotFound  : {
        name          : 'errorNotFound',
        description   : 'Error not found.',
        type          : ErrorType.CODE_ERROR,
        sendInfo      : false,
        private       : true,
        //INFO
        // errorName (name of the error)
        fromZationSystem : true
    },

    methodIsNotCompatible  : {
        name          : 'methodIsNotCompatible',
        description   : 'Method is not compatible with request protocol.',
        type          : ErrorType.CODE_ERROR,
        sendInfo      : false,
        private       : true,
        //INFO
        // reqType
        // requiredReqType
        fromZationSystem : true
    },

    authenticationError  : {
        name          : 'authenticationError',
        description   : 'Authenticate error by trying to authenticate an sc.',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : false,
        //INFO
        // reason
        fromZationSystem : true
    },

    inputPropertyIsMissing    : {
        name          : 'inputPropertyIsMissing',
        description   : 'Input property is missing.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // propertyName (the name of the missing property)
        // input (the input object where the property is missing)
        fromZationSystem : true
    },

    unknownInputProperty : {
        name          : 'unknownInputProperty',
        description   : 'Unknown input property was in input.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // propertyName (the unknown input property name)
        fromZationSystem : true
    },

    tooMuchInput    : {
        name          : 'tooMuchInput',
        description   : 'Too much input.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        //sendCount (send input count)
        //maxCount (controller config max input count)
        fromZationSystem : true
    },

    arrayWasExpected    : {
        name          : 'arrayWasExpected',
        description   : 'Array was expected.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // inputPath (full path to the value where an array was expected)
        // inputValue (the input value that is not from type array)
        fromZationSystem : true
    },

    objectWasExpected    : {
        name          : 'objectWasExpected',
        description   : 'Object was expected.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // inputValue (the input value that is not from type object)
        // inputPath (full path to the value where an object was expected)
        fromZationSystem : true
    },

    objectPropertyIsMissing  : {
        name          : 'objectPropertyIsMissing',
        description   : 'Object property is missing (because its not optional).',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // object (the input object where the property is missing)
        // propertyName (name of missing property)
        // inputPath (the full input path to missing property)
        fromZationSystem : true
    },

    unknownObjectProperty : {
        name          : 'unknownObjectProperty',
        description   : 'Unknown object property was in an object input.',
        type          : ErrorType.INPUT_ERROR,
        sendInfo      : true,
        //INFO
        // propertyName (name of the unknown property)
        // inputPath (full input path to unknown property)
        fromZationSystem : true
    },

    inTokenSavedAuthGroupIsNotFound    : {
        name          : 'inTokenSavedAuthGroupIsNotFound',
        description   : 'The auth group is saved in the token is not found on the zation Config.',
        type          : ErrorType.TOKEN_ERROR,
        private       : true,
        sendInfo      : false,
        //INFO
        // savedAuthGroup (the saved auth group in token)
        // authGroupsInZationConfig (auth groups in the zation config)
        fromZationSystem : true
    },

    tokenWithoutAuthGroup   : {
        name          : 'tokenWithoutAuthGroup',
        description   : 'Token without auth group!',
        type          : ErrorType.TOKEN_ERROR,
        private       : true,
        sendInfo      : false,
        fromZationSystem : true
    },

    wrongPanelAuthData   : {
        name          : 'wrongPanelAuthData',
        description   : 'Wrong panel auth data!',
        type          : ErrorType.AUTH_ERROR,
        private       : false,
        sendInfo      : false,
        fromZationSystem : true
    },

    authStartActive    : {
        name          : 'authStartActive',
        description   : 'Auth start is active, zation only accept auth request for a time!',
        type          : ErrorType.TIME_ERROR,
        private       : false,
        sendInfo      : false,
        fromZationSystem : true
    },

    noAccessToController  : {
        name          : 'noAccessToController',
        description   : 'You have no protocolAccess to this controller!',
        type          : ErrorType.AUTH_ERROR,
        sendInfo      : true,
        //INFO
        // authIn (show if you auth in system)
        // authUserGroup (your auth type)
        fromZationSystem : true
    },

    wrongInputDataStructure : {
        name          : 'wrongInputDataStructure',
        description   : 'Wrong input data with wrong structure.',
        type          : ErrorType.INPUT_ERROR,
        private       : false,
        sendInfo      : false,
        fromZationSystem : true
    },

    JSONParseSyntaxError : {
        name          : 'JSONParseSyntaxError ',
        description   : 'Error by parse json.',
        type          : ErrorType.INPUT_ERROR,
        private       : false,
        sendInfo      : false,
        fromZationSystem : true
    },

    inputPathInControllerNotFound : {
        name          : 'inputPathInControllerNotFound',
        description   : 'Input path in controller not found!',
        type          : ErrorType.INPUT_ERROR,
        private       : false,
        sendInfo      : true,
        //INFO
        //controllerName (name of controller)
        //inputPath
        fromZationSystem : true
    },

    inputPathNotHasAtLeastOneEntry : {
        name          : 'inputPathNotHasAtLeastOneEntry',
        description   : 'Input path not has at least one entry!',
        type          : ErrorType.INPUT_ERROR,
        private       : false,
        sendInfo      : true,
        //INFO
        //inputPath
        fromZationSystem : true
    },

    noAccessWithProtocol  : {
        name          : 'noAccessWithProtocol',
        description   : 'You have no protocolAccess to this controller with this server protocol!',
        type          : ErrorType.PROTOCOL_ERROR,
        sendInfo      : true,
        //INFO
        // protocol   (The protocol you request with)
        // controllerName (The controller you request)
        fromZationSystem : true
    },

    noAccessWithHttpMethod  : {
        name          : 'noAccessWithHttpMethod' ,
        description   : 'You have no methodAccess to this controller with this http method!',
        type          : ErrorType.PROTOCOL_ERROR,
        sendInfo      : true,
        //INFO
        // method   (The method you request with)
        // controller (The controller you request)
        fromZationSystem : true
    },

    unknownError : {
        name          : 'unknownError',
        description   : 'Look in info for more detail! To see run in debug!',
        type          : ErrorType.SYSTEM_ERROR,
        sendInfo      : true,
        //INFO
        // info (info from Exception only in Debug Mode!)
        fromZationSystem : true
    },

    unknownTokenVerifyError : {
        name          : 'unknownTokenVerifyError',
        description   : 'Look in info for more detail!',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : false,
        //INFO
        fromZationSystem : true
    },

    unknownTokenSignError : {
        name          : 'unknownTokenSignError',
        description   : 'Look in info for more detail!',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : false,
        //INFO
        fromZationSystem : true
    },

    tokenExpiredError : {
        name          : 'tokenExpiredError',
        description   : 'Jwt expired.',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : true,
        //INFO
        // expiredAt
        fromZationSystem : true
    },

    jsonWebTokenError : {
        name          : 'jsonWebTokenError',
        description   : 'Json web token error.',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : true,
        //INFO
        // message
        fromZationSystem : true
    },

    authenticateMiddlewareBlock : {
        name          : 'authenticateMiddlewareBlock',
        description   : 'Authenticate middleware block req.',
        type          : ErrorType.TOKEN_ERROR,
        sendInfo      : true,
        //INFO
        // err
        fromZationSystem : true
    }
};