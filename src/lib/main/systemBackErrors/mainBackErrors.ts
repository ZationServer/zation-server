/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ErrorType}        from "../definitions/errorType";
import BackErrorConstruct from '../definitions/backErrorConstruct';

export const MainBackErrors: Record<string, BackErrorConstruct> = {
    unknownController: {
        name         : 'unknownController',
        description  : 'The controller is not found.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // identifier
        custom: false
    },

    unknownReceiver: {
        name         : 'unknownReceiver',
        description  : 'The receiver is not found.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        private      : true,
        //INFO
        // identifier
        custom: false
    },

    apiLevelIncompatible: {
        name         : 'apiLevelIncompatible',
        description  : 'The API level of the client is incompatible with the request.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // identifier
        // apiLevel
        custom: false
    },

    authControllerNotSet: {
        name         : 'authControllerNotSet',
        description  : 'Auth controller not set.',
        type         : ErrorType.InputError,
        sendInfo     : false,
        custom: false
    },

    noAccessWithSystem : {
        name         : 'noAccessWithSystem',
        description  : 'No access with the current system to the controller.',
        type         : ErrorType.NoAccessError,
        sendInfo     : false,
        //INFO
        // system
        custom: false
    },

    noAccessWithVersion   : {
        name         : 'noAccessWithVersion',
        description  : 'No access with the current version to the controller.',
        type         : ErrorType.NoAccessError,
        sendInfo     : true,
        //INFO
        // version
        custom: false
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
        custom: false
    },

    inputIsIncompatible : {
        name         : 'inputIsIncompatible',
        description  : 'The input is incompatible with this operation.',
        type         : ErrorType.CodeError,
        sendInfo     : false,
        private      : true,
        custom: false
    },

    authenticationRequired : {
        name         : 'authenticationRequired',
        description  : 'Authentication is required.',
        type         : ErrorType.SystemError,
        sendInfo     : false,
        private      : true,
        //INFO
        // reason
        custom: false
    },

    undefinedUserId : {
        name         : 'undefinedUserId',
        description  : 'User id is undefined.',
        type         : ErrorType.SystemError,
        sendInfo     : false,
        private      : true,
        custom: false
    },

    unknownChannel : {
        name         : 'unknownChannel',
        description  : 'Unknown channel',
        type         : ErrorType.SystemError,
        sendInfo     : false,
        private      : true,
        //INFO
        // name
        custom: false
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
        custom: false
    },

    inputIsMissing   : {
        name         : 'inputIsMissing',
        description  : 'Input is missing.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        custom: false
    },

    inputParamIsMissing   : {
        name         : 'inputParamIsMissing',
        description  : 'Input param is missing.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // paramName (the name of the missing param)
        custom: false
    },

    unknownInputParam: {
        name         : 'unknownInputParam',
        description  : 'Unknown input param was in the input.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // paramName (the unknown input param name)
        custom: false
    },

    inputParamNotAssignable   : {
        name         : 'inputParamNotAssignable',
        description  : 'Input param is not assignable.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // index (index of the input param that is not assignable)
        // value (input value of the input param that is not assignable)
        custom: false
    },

    arrayWasExpected   : {
        name         : 'arrayWasExpected',
        description  : 'Array was expected.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // path (full path to the value where an array was expected)
        // value (the input value that is not from type array)
        custom: false
    },

    objectWasExpected   : {
        name         : 'objectWasExpected',
        description  : 'Object was expected.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // value (the input value that is not from type object)
        // path (full path to the value where an object was expected)
        custom: false
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
        custom: false
    },

    unknownObjectProperty: {
        name         : 'unknownObjectProperty',
        description  : 'Unknown object property was in an object input.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // propertyName (name of the unknown property)
        // path (full input path to unknown property)
        custom: false
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
        custom: false
    },

    tokenWithoutAuthUserGroup : {
        name         : 'tokenWithoutAuthUserGroup',
        description  : 'Token without auth user group.',
        type         : ErrorType.TokenError,
        private      : true,
        sendInfo     : false,
        custom: false
    },

    tokenWithAuthUserGroupAndOnlyPanel : {
        name         : 'tokenWithAuthUserGroupAndOnlyPanel',
        description  : 'Token with auth user group and only panel.',
        type         : ErrorType.TokenError,
        private      : true,
        sendInfo     : false,
        custom: false
    },

    invalidPanelAuthData : {
        name         : 'invalidPanelAuthData',
        description  : 'Invalid panel auth data.',
        type         : ErrorType.AuthError,
        private      : false,
        sendInfo     : false,
        custom: false
    },

    panelIsNotActivated : {
        name         : 'panelIsNotActivated',
        description  : 'Panel is not activated!',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        custom: false
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
        custom: false
    },

    invalidRequest: {
        name         : 'invalidRequest',
        description  : 'Invalid request.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        custom: false
    },

    invalidPackage: {
        name         : 'invalidPackage',
        description  : 'Invalid package.',
        type         : ErrorType.InputError,
        private      : true,
        sendInfo     : false,
        custom: false
    },

    invalidInputTypeInParamBasedInput: {
        name         : 'invalidInputTypeInParamBasedInput',
        description  : 'Invalid input type in param based input. The type has to be an array or object.',
        type         : ErrorType.InputError,
        //INFO
        // inputType
        sendInfo     : true,
        custom: false
    },

    JSONParseSyntaxError: {
        name         : 'JSONParseSyntaxError ',
        description  : 'Error by parse json.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        custom: false
    },

    invalidValidationCheckStructure: {
        name         : 'invalidValidationCheckStructure',
        description  : 'Invalid validation check structure!',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : true,
        //INFO
        // checkIndex
        custom: false
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
        custom: false
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
        custom: false
    },

    unknownError: {
        name         : 'unknownError',
        description  : 'Look in info for more detail! To see run in debug!',
        type         : ErrorType.SystemError,
        sendInfo     : true,
        //INFO
        // info (info from Exception only in Debug Mode!)
        custom: false
    },

    unknownTokenVerifyError: {
        name         : 'unknownTokenVerifyError',
        description  : 'Look in info for more detail!',
        type         : ErrorType.TokenError,
        sendInfo     : false,
        //INFO
        custom: false
    },

    unknownTokenSignError: {
        name         : 'unknownTokenSignError',
        description  : 'Look in info for more detail!',
        type         : ErrorType.TokenError,
        sendInfo     : false,
        //INFO
        custom: false
    },

    tokenExpiredError: {
        name         : 'tokenExpiredError',
        description  : 'Jwt expired.',
        type         : ErrorType.TokenError,
        sendInfo     : true,
        //INFO
        // expiredAt
        custom: false
    },

    jsonWebTokenError: {
        name         : 'jsonWebTokenError',
        description  : 'Json web token error.',
        type         : ErrorType.TokenError,
        sendInfo     : true,
        //INFO
        // message
        custom: false
    }
};