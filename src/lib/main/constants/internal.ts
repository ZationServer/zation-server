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
    tid : string,
    userId ?: string | number,
    exp : number,
    authUserGroup : string
}

export interface PrepareZationToken {
    authUserGroup ?: string,
    userId ?: string | number | undefined,
    /**
     * Token id
     */
    tid ?: string,
    panelAccess ?: boolean,
    onlyPanelToken ?: boolean,
    exp ?: number,
    clusterKey ?: string,
    variables ?: object
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