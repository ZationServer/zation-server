/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ErrorType}        from "./../constants/errorType";

export const MainBackErrors = {
    unknownController: {
        name         : 'unknownController',
        description  : 'The controller is not found.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // identifier
        fromZationSystem: true
    },

    unknownReceiver: {
        name         : 'unknownReceiver',
        description  : 'The receiver is not found.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        private      : true,
        //INFO
        // identifier
        fromZationSystem: true
    },

    apiLevelIncompatible: {
        name         : 'apiLevelIncompatible',
        description  : 'The API level of the client is incompatible with the request.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // identifier
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

    unknownChannel : {
        name         : 'unknownChannel',
        description  : 'Unknown channel',
        type         : ErrorType.SystemError,
        sendInfo     : false,
        private      : true,
        //INFO
        // name
        fromZationSystem: true
    },

    componentNotFound : {
        name         : 'componentNotFound',
        description  : 'The Component is not found.',
        type         : ErrorType.SystemError,
        sendInfo     : false,
        private      : true,
        //INFO
        // className
        // componentType
        fromZationSystem: true
    },

    inputIsMissing   : {
        name         : 'inputIsMissing',
        description  : 'Input is missing.',
        type         : ErrorType.InputError,
        sendInfo     : true,
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
        // path (full path to the value where an array was expected)
        // value (the input value that is not from type array)
        fromZationSystem: true
    },

    objectWasExpected   : {
        name         : 'objectWasExpected',
        description  : 'Object was expected.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // value (the input value that is not from type object)
        // path (full path to the value where an object was expected)
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
        // path (the full input path to missing property)
        fromZationSystem: true
    },

    unknownObjectProperty: {
        name         : 'unknownObjectProperty',
        description  : 'Unknown object property was in an object input.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // propertyName (name of the unknown property)
        // path (full input path to unknown property)
        fromZationSystem: true
    },

    inTokenSavedAuthUserGroupIsNotFound   : {
        name         : 'inTokenSavedAuthUserGroupIsNotFound',
        description  : 'The saved auth user group in the token is not found on the server config.',
        type         : ErrorType.TokenError,
        private      : true,
        sendInfo     : false,
        //INFO
        // savedAuthUserGroup (the saved auth group in token)
        // authUserGroupsInZationConfig (auth groups in the zation config)
        fromZationSystem: true
    },

    tokenWithoutAuthUserGroup : {
        name         : 'tokenWithoutAuthUserGroup',
        description  : 'Token without auth user group.',
        type         : ErrorType.TokenError,
        private      : true,
        sendInfo     : false,
        fromZationSystem: true
    },

    tokenWithAuthUserGroupAndOnlyPanel : {
        name         : 'tokenWithAuthUserGroupAndOnlyPanel',
        description  : 'Token with auth user group and only panel.',
        type         : ErrorType.TokenError,
        private      : true,
        sendInfo     : false,
        fromZationSystem: true
    },

    invalidPanelAuthData : {
        name         : 'invalidPanelAuthData',
        description  : 'Invalid panel auth data.',
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

    noAccessWithTokenState : {
        name         : 'noAccessWithTokenState',
        description  : 'You have no access with the token state, to this component.',
        type         : ErrorType.NoAccessError,
        sendInfo     : true,
        //INFO
        // authIn (show if you auth in system)
        // authUserGroup (your auth type)
        // userId (your user id)
        fromZationSystem: true
    },

    invalidRequest: {
        name         : 'invalidRequest',
        description  : 'Invalid request.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        fromZationSystem: true
    },

    invalidPackage: {
        name         : 'invalidPackage',
        description  : 'Invalid package.',
        type         : ErrorType.InputError,
        private      : true,
        sendInfo     : false,
        fromZationSystem: true
    },

    invalidInputTypeInParamBasedInput: {
        name         : 'invalidInputTypeInParamBasedInput',
        description  : 'Invalid input type in param based input. The type has to be an array or object.',
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

    invalidValidationCheckStructure: {
        name         : 'invalidValidationCheckStructure',
        description  : 'Invalid validation check structure!',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : true,
        //INFO
        // checkIndex
        fromZationSystem: true
    },

    pathNotResolvable: {
        name         : 'pathNotResolvable',
        description  : 'Input path is not resolvable.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : true,
        //INFO
        // path
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
    }
};