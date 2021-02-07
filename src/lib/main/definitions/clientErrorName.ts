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
    AccessDenied                 = 'AccessDenied',
    InvalidMember                = 'InvalidMember',
    InvalidToken                 = 'InvalidToken',
    InvalidPackage               = 'InvalidPackage',
    InvalidRequest               = 'InvalidRequest',
    ApiLevelIncompatible         = 'ApiLevelIncompatible',
    UnknownDatabox               = 'UnknownDatabox',
    DataboxLimitReached          = 'DataboxLimitReached',
    UnknownSessionTarget         = 'UnknownSessionTarget',
    UnknownAction                = 'UnknownAction',
    NoData                       = 'NoData',
    MaxBackpressureReached       = 'MaxBackpressureReached',
    InvalidInput                 = 'InvalidInput',
    MaxInputChannelsReached      = 'MaxInputChannelsReached',
    MaxMembersReached            = 'MaxMembersReached'
}