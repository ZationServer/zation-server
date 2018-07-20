/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS {
    static readonly CUSTOM_ID_CHANNELS         = 'customIdChannels';
    static readonly CUSTOM_CHANNELS            = 'customChannels';
    static readonly DEFAULTS                   = 'default';
}

class ACCESS {
    static readonly ALL_AUTH                = 'allAuth';
    static readonly ALL_NOT_AUTH            = 'allNotAuth';
    static readonly ALL                     = 'all';
}

//Generate Info to check Access for specialChannels
class INFO {
    static readonly AUTH_USER_GROUP   = 'authUserGroup';
    static readonly IS_AUTH_IN        = 'authIn';
    static readonly USER_ID           = 'userId';
    static readonly SOCKET            = 'socket';
    static readonly TOKEN_ID          = 'tokenId';
}

class CHANNEL {
    static readonly PUBLISH_NOT_ACCESS     = 'PublishNotAccess';
    static readonly PUBLISH_ACCESS         = 'publishAccess';
    static readonly SUBSCRIBE_NOT_ACCESS   = 'subscribeNotAccess';
    static readonly SUBSCRIBE_ACCESS       = 'subscribeAccess';

    static readonly ON_SUBSCRIPTION        = 'onSubscription';
    static readonly ON_PUBLISH             = 'onPublish';

    static readonly INFO = INFO;
}

class ChannelConfig
{
    public static readonly KEYS = KEYS;
    public static readonly CHANNEL = CHANNEL;
    public static readonly ACCESS = ACCESS;
}

export = ChannelConfig;