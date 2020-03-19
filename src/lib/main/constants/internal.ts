/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export enum BackErrorInfo {
    Main = 'main'
}

export type ZationAccessRecord = Record<ZationAccess,any>;
export type ZationAccess = 'all' | 'allAuth' | 'allNotAuth';

export interface ZationToken extends PrepareZationToken{
    tid: string,
    userId?: string | number,
    exp: number,
    authUserGroup: string
}

export interface PrepareZationToken {
    authUserGroup?: string,
    userId?: string | number | undefined,
    /**
     * Token id
     */
    tid?: string,
    panelAccess?: boolean,
    onlyPanelToken?: boolean,
    exp?: number,
    clusterKey?: string,
    variables?: object
}

export const DEFAULT_USER_GROUP_FALLBACK = 'default';

export const ZATION_CUSTOM_EVENT_NAMESPACE = '>CE.';

//CN = CONFIG_NAMES
export enum ConfigNames
{
    App             = 'App     :',
    Main            = 'Main    :',
    Service         = 'Service :',
    Starter         = 'Starter :'
}