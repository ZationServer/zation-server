/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ErrorType}        from "../definitions/errorType";
import BackErrorConstruct from '../definitions/backErrorConstruct';

export const MainBackErrors = {
    unknownController: {
        name         : 'unknownController',
        description  : 'The controller is not found.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // identifier
        custom: false
    } as BackErrorConstruct,

    unknownReceiver: {
        name         : 'unknownReceiver',
        description  : 'The receiver is not found.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // identifier
        custom: false
    } as BackErrorConstruct,

    apiLevelIncompatible: {
        name         : 'apiLevelIncompatible',
        description  : 'The API level of the client is incompatible.',
        type         : ErrorType.InputError,
        sendInfo     : true,
        //INFO
        // identifier
        // apiLevel
        custom: false
    } as BackErrorConstruct,

    authControllerNotSet: {
        name         : 'authControllerNotSet',
        description  : 'Auth controller not set.',
        type         : ErrorType.InputError,
        sendInfo     : false,
        custom: false
    } as BackErrorConstruct,

    accessDenied : {
        name         : 'accessDenied',
        description  : 'The access to the component was denied.',
        type         : ErrorType.AccessError,
        sendInfo     : false,
        //INFO
        // reason
        custom: false
    } as BackErrorConstruct,

    //Code errors
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
    } as BackErrorConstruct,

    authenticationRequired : {
        name         : 'authenticationRequired',
        description  : 'Authentication is required.',
        type         : ErrorType.CodeError,
        sendInfo     : false,
        private      : true,
        //INFO
        // reason
        custom: false
    } as BackErrorConstruct,

    undefinedUserId : {
        name         : 'undefinedUserId',
        description  : 'User id is undefined.',
        type         : ErrorType.CodeError,
        sendInfo     : false,
        private      : true,
        custom: false
    } as BackErrorConstruct,

    instanceNotFound : {
        name         : 'instanceNotFound',
        description  : 'The instance can not be found.',
        type         : ErrorType.CodeError,
        sendInfo     : false,
        private      : true,
        //INFO
        // className
        custom: false
    } as BackErrorConstruct,

    tokenSavedAuthUserGroupNotFound : {
        name         : 'tokenSavedAuthUserGroupNotFound',
        description  : 'The saved auth user group in the token does not exists in the server config.',
        type         : ErrorType.TokenError,
        sendInfo     : false,
        private      : true,
        //INFO
        // savedAuthUserGroup (the saved auth group in token)
        // authUserGroupsInZationConfig (auth groups in the zation config)
        custom: false
    } as BackErrorConstruct,

    tokenWithoutAuthUserGroup : {
        name         : 'tokenWithoutAuthUserGroup',
        description  : 'Token without an auth user group.',
        type         : ErrorType.TokenError,
        sendInfo     : false,
        private      : true,
        custom: false
    } as BackErrorConstruct,

    tokenWithAuthUserGroupAndOnlyPanel : {
        name         : 'tokenWithAuthUserGroupAndOnlyPanel',
        description  : 'Token with an auth user group and only panel.',
        type         : ErrorType.TokenError,
        sendInfo     : false,
        private      : true,
        custom: false
    } as BackErrorConstruct,

    invalidPanelAuthData : {
        name         : 'invalidPanelAuthData',
        description  : 'Invalid panel auth data.',
        type         : ErrorType.AccessError,
        private      : false,
        sendInfo     : false,
        custom: false
    } as BackErrorConstruct,

    panelDeactivated : {
        name         : 'panelDeactivated',
        description  : 'The panel is deactivated.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        custom: false
    } as BackErrorConstruct,

    invalidRequest: {
        name         : 'invalidRequest',
        description  : 'Invalid request.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        custom: false
    } as BackErrorConstruct,

    invalidPackage: {
        name         : 'invalidPackage',
        description  : 'Invalid package.',
        type         : ErrorType.InputError,
        private      : true,
        sendInfo     : false,
        custom: false
    } as BackErrorConstruct,

    JSONParseSyntaxError: {
        name         : 'JSONParseSyntaxError ',
        description  : 'Error by parse json.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : false,
        custom: false
    } as BackErrorConstruct,

    invalidValidationCheckStructure: {
        name         : 'invalidValidationCheckStructure',
        description  : 'Invalid validation check structure.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : true,
        //INFO
        // checkIndex
        custom: false
    } as BackErrorConstruct,

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
    } as BackErrorConstruct,

    validationCheckLimitReached: {
        name         : 'validationCheckLimitReached',
        description  : 'Validation check limit is reached.',
        type         : ErrorType.InputError,
        private      : false,
        sendInfo     : true,
        //INFO
        // limit
        // checksCount
        custom: false
    } as BackErrorConstruct,

    unknownError: {
        name         : 'unknownError',
        description  : 'If server runs in debug you can found more detail in the info.',
        type         : ErrorType.SystemError,
        sendInfo     : true,
        //INFO
        // info (the Exception only available when server runs in debug.)
        custom: false
    } as BackErrorConstruct,
};