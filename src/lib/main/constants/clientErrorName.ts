/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export enum ClientErrorName {
    MemberMissing                = 'MemberMissing',
    UnnecessaryMember            = 'UnnecessaryMember',
    IdentifierMissing            = 'IdentifierMissing',
    UnknownChannel               = 'UnknownChannel',
    NoAccessWithVersion          = 'NoAccessWithVersion',
    NoAccessWithSystem           = 'NoAccessWithSystem',
    AccessDenied                 = 'AccessDenied',
    InvalidMember                = 'InvalidMember',

    InvalidRequest               = 'InvalidRequest',
    ApiLevelIncompatible         = 'ApiLevelIncompatible',
    UnknownDatabox               = 'UnknownDatabox',
    DataboxLimitReached          = 'DataboxLimitReached',
    UnknownSessionTarget         = 'UnknownSessionTarget',
    UnknownAction                = 'UnknownAction',
    NoMoreDataAvailable          = 'NoMoreDataAvailable',
    NoDataAvailable              = 'NoDataAvailable',
    MaxBackpressureReached       = 'MaxBackpressureReached',
    InvalidInput                 = 'InvalidInput',
    MaxInputChannelsReached      = 'MaxInputChannelsReached',
}