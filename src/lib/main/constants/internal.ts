/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export enum BackErrorInfo {
    MAIN = 'main'
}

export enum ZationAccess {
    ALL_AUTH                = 'allAuth',
    ALL_NOT_AUTH            = 'allNotAuth',
    ALL                     = 'all'
}

export interface ZationToken extends PrepareZationToken{
    zationTokenId : string,
    zationUserId ?: string | number,
    exp : number,
    zationAuthUserGroup : string
}

export interface PrepareZationToken {
    zationAuthUserGroup ?: string,
    zationUserId ?: string | number | undefined,
    zationTokenId ?: string,
    zationPanelAccess ?: boolean,
    zationOnlyPanelToken ?: boolean,
    exp ?: number,
    zationTokenClusterKey ?: string,
    zationCustomVariables ?: object
}

export const DefaultUserGroupFallBack = 'default';

export const ZationCustomEventNamespace = '>CE.';

//CN = CONFIG_NAMES
export enum ConfigNames
{
    APP             = 'App     :',
    MAIN            = 'Main    :',
    ERROR           = 'Error   :',
    EVENT           = 'Event   :',
    SERVICE         = 'Service :',
    STARTER         = 'Starter :'
}