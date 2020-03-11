/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ErrorType}        from "./../constants/errorType";

export const MainBackErrors = {
    controllerNotFound: {
        name         : 'controllerNotFound',
        description  : 'The controller is not found.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // controller
        fromZationSystem: true
    },

    systemControllerNotFound: {
        name         : 'systemControllerNotFound',
        description  : 'The system controller is not found.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // controller
        fromZationSystem: true
    },

    apiLevelIncompatible: {
        name         : 'apiLevelIncompatible',
        description  : 'The API level of the client is incompatible with the request.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // controller
        // apiLevel
        fromZationSystem: true
    },

    authControllerNotSet: {
        name         : 'authControllerNotSet',
        description  : 'Auth controller not set.',
        type         : ErrorType.InputError,
        sendInfo     : false,
        fromZationSystem: true
    },

    noAccessWithSystem : {
        name         : 'noAccessWithSystem',
        description  : 'No access with the current system to the controller.',
        type         : ErrorType.NoAccessError,
        sendInfo     : false,
        //INFO
        // system
        fromZationSystem: true
    },

    noAccessWithVersion   : {
        name         : 'noAccessWithVersion',
        description  : 'No access with the current version to the controller.',
        type         : ErrorType.NoAccessError,
        sendInfo     : true,
        //INFO
        // version
        fromZationSystem: true
    },

    serviceNotFound : {
        name         : 'serviceNotFound',
        description  : 'Service not found.',
        type         : ErrorType.CodeError,
        sendInfo     : false,
        private      : true,
        //INFO
        // serviceName (name of the service)
        // instanceName  (name of the instance)
        fromZationSystem: true
    },

    errorNotFound : {
        name         : 'errorNotFound',
        description  : 'Error not found.',
        type         : ErrorType.CodeError,
        sendInfo     : false,
        private      : true,
        //INFO
        // errorName (name of the error)
        fromZationSystem: true
    },

    methodIsIncompatible : {
        name         : 'methodIsIncompatible',
        description  : 'Method is incompatible with request protocol.',
        type         : ErrorType.CodeError,
        sendInfo     : false,
        private      : true,
        //INFO
        // reqType
        // requiredReqType
        fromZationSystem: true
    },

    inputIsIncompatible : {
        name         : 'inputIsIncompatible',
        description  : 'The input is incompatible with this operation.',
        type         : ErrorType.CodeError,
        sendInfo     : false,
        private      : true,
        fromZationSystem: true
    },

    authenticationError : {
        name         : 'authenticationError',
        description  : 'Authenticate error by trying to authenticate an sc.',
        type         : ErrorType.SystemError,
        sendInfo     : false,
        //INFO
        // reason
        fromZationSystem: true
    },

    unknownCustomCh : {
        name         : 'unknownCustomCh',
        description  : 'Unknown custom channel',
        type         : ErrorType.SystemError,
        sendInfo     : false,
        private      : true,
        //INFO
        // name
        fromZationSystem: true
    },

    databoxNotFound : {
        name         : 'databoxNotFound',
        description  : 'The Databox is not found.',
        type         : ErrorType.SystemError,
        sendInfo     : false,
        private      : true,
        //INFO
        // className
        fromZationSystem: true
    },

    inputParamIsMissing   : {
        name         : 'inputParamIsMissing',
        description  : 'Input param is missing.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // paramName (the name of the missing param)
        fromZationSystem: true
    },

    unknownInputParam: {
        name         : 'unknownInputParam',
        description  : 'Unknown input param was in the input.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // paramName (the unknown input param name)
        fromZationSystem: true
    },

    inputParamNotAssignable   : {
        name         : 'inputParamNotAssignable',
        description  : 'Input param is not assignable.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // index (index of the input param that is not assignable)
        // value (input value of the input param that is not assignable)
        fromZationSystem: true
    },

    arrayWasExpected   : {
        name         : 'arrayWasExpected',
        description  : 'Array was expected.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // inputPath (full path to the value where an array was expected)
        // inputValue (the input value that is not from type array)
        fromZationSystem: true
    },

    objectWasExpected   : {
        name         : 'objectWasExpected',
        description  : 'Object was expected.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // inputValue (the input value that is not from type object)
        // inputPath (full path to the value where an object was expected)
        fromZationSystem: true
    },

    objectPropertyIsMissing : {
        name         : 'objectPropertyIsMissing',
        description  : 'Object property is missing (because its not optional).',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // object (the input object where the property is missing)
        // propertyName (name of missing property)
        // inputPath (the full input path to missing property)
        fromZationSystem: true
    },

    unknownObjectProperty: {
        name         : 'unknownObjectProperty',
        description  : 'Unknown object property was in an object input.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // propertyName (name of the unknown property)
        // inputPath (full input path to unknown property)
        fromZationSystem: true
    },

    inTokenSavedAuthGroupIsNotFound   : {
        name         : 'inTokenSavedAuthGroupIsNotFound',
        description  : 'The auth group is saved in the token is not found on the zation Config.',
        type         : ErrorType.TokenError,
        private      : true,
        sendInfo     : false,
        //INFO
        // savedAuthGroup (the saved auth group in token)
        // authGroupsInZationConfig (auth groups in the zation config)
        fromZationSystem: true
    },

    tokenWithoutAuthGroup  : {
        name         : 'tokenWithoutAuthGroup',
        description  : 'Token without auth group!',
        type         : ErrorType.TokenError,
        private      : true,
        sendInfo     : false,
        fromZationSystem: true
    },

    tokenWithAuthGroupAndOnlyPanel  : {
        name         : 'tokenWithAuthGroupAndOnlyPanel',
        description  : 'Token with auth group and only panel!',
        type         : ErrorType.TokenError,
        private      : true,
        sendInfo     : false,
        fromZationSystem: true
    },

    wrongPanelAuthData  : {
        name         : 'wrongPanelAuthData',
        description  : 'Wrong panel auth data!',
        type         : ErrorType.AuthError,
        private      : false,
        sendInfo     : false,
        fromZationSystem: true
    },

    panelIsNotActivated : {
        name         : 'panelIsNotActivated',
        description  : 'Panel is not activated!',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        fromZationSystem: true
    },

    authStartActive   : {
        name         : 'authStartActive',
        description  : 'Auth start is active, zation only accept auth request for a time!',
        type         : ErrorType.TimeError,
        private      : false,
        sendInfo     : false,
        fromZationSystem: true
    },

    noAccessWithTokenState : {
        name         : 'noAccessWithTokenState',
        description  : 'You have no access with the token state, to this controller.',
        type         : ErrorType.NoAccessError,
        sendInfo     : true,
        //INFO
        // authIn (show if you auth in system)
        // authUserGroup (your auth type)
        // userId (your user id)
        fromZationSystem: true
    },

    wrongInputDataStructure: {
        name         : 'wrongInputDataStructure',
        description  : 'Wrong input data with wrong structure.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        fromZationSystem: true
    },

    wrongInputTypeInParamBasedInput: {
        name         : 'wrongInputTypeInParamBasedInput',
        description  : 'Wrong input type in param based input. The type has to be an array or object.',
        type         : ErrorType.InputError,
        //INFO
        // inputType
        sendInfo     : true,
        fromZationSystem: true
    },

    JSONParseSyntaxError: {
        name         : 'JSONParseSyntaxError ',
        description  : 'Error by parse json.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        fromZationSystem: true
    },

    wrongValidationCheckStructure: {
        name         : 'wrongValidationCheckStructure',
        description  : 'Wrong validation check structure!',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : true,
        //INFO
        // checkIndex
        fromZationSystem: true
    },

    inputPathNotResolvable: {
        name         : 'inputPathNotResolvable',
        description  : 'Input path is not resolvable.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : true,
        //INFO
        // inputPath
        // checkIndex
        fromZationSystem: true
    },

    validationCheckLimitReached: {
        name         : 'validationCheckLimitReached',
        description  : 'Validation check limit is reached!',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : true,
        //INFO
        // limit
        // checksCount
        fromZationSystem: true
    },

    noAccessWithProtocol : {
        name         : 'noAccessWithProtocol',
        description  : 'You have no protocolAccess to this controller with this server protocol!',
        type         : ErrorType.ProtocolError,
        sendInfo     : true,
        //INFO
        // protocol   (The protocol you request with)
        // controller (The controller you request)
        fromZationSystem: true
    },

    noAccessWithHttpMethod : {
        name         : 'noAccessWithHttpMethod' ,
        description  : 'You have no methodAccess to this controller with this http method!',
        type         : ErrorType.ProtocolError,
        sendInfo     : true,
        //INFO
        // method   (The method you request with)
        // controller (The controller you request)
        fromZationSystem: true
    },

    unknownError: {
        name         : 'unknownError',
        description  : 'Look in info for more detail! To see run in debug!',
        type         : ErrorType.SystemError,
        sendInfo     : true,
        //INFO
        // info (info from Exception only in Debug Mode!)
        fromZationSystem: true
    },

    unknownTokenVerifyError: {
        name         : 'unknownTokenVerifyError',
        description  : 'Look in info for more detail!',
        type         : ErrorType.TokenError,
        sendInfo     : false,
        //INFO
        fromZationSystem: true
    },

    unknownTokenSignError: {
        name         : 'unknownTokenSignError',
        description  : 'Look in info for more detail!',
        type         : ErrorType.TokenError,
        sendInfo     : false,
        //INFO
        fromZationSystem: true
    },

    tokenExpiredError: {
        name         : 'tokenExpiredError',
        description  : 'Jwt expired.',
        type         : ErrorType.TokenError,
        sendInfo     : true,
        //INFO
        // expiredAt
        fromZationSystem: true
    },

    jsonWebTokenError: {
        name         : 'jsonWebTokenError',
        description  : 'Json web token error.',
        type         : ErrorType.TokenError,
        sendInfo     : true,
        //INFO
        // message
        fromZationSystem: true
    },

    tokenClusterKeyIsInvalid: {
        name         : 'tokenClusterKeyIsInvalid',
        description  : 'The token cluster key is invalid.',
        type         : ErrorType.TokenError,
        sendInfo     : true,
        fromZationSystem: true
    },

    authenticateMiddlewareBlock: {
        name         : 'authenticateMiddlewareBlock',
        description  : 'Authenticate middleware block req.',
        type         : ErrorType.TokenError,
        sendInfo     : true,
        //INFO
        // err
        fromZationSystem: true
    }
};