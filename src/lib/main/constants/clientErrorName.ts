/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export enum ClientErrorName {
    IdMissing                    = 'IdMissing',
    UnknownId                    = 'UnknownId',
    NameMissing                  = 'NameMissing',
    UnknownChannel               = 'UnknownChannel',
    NoAccessWithVersion          = 'NoAccessWithVersion',
    NoAccessWithSystem           = 'NoAccessWithSystem',
    AccessDenied                 = 'AccessDenied',
    IdIsNotValid                 = 'IdIsNotValid',

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