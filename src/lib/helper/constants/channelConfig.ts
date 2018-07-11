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

//Generate Info to check Access for specialChannels
class INFO {
    static readonly AUTH_USER_GROUP   = 'authUserGroup';
    static readonly IS_AUTH_IN        = 'authIn';
    static readonly USER_ID           = 'userId';
    static readonly SOCKET            = 'socket';
    static readonly TOKEN_ID          = 'tokenId';
}

class CHANNEL {
    static readonly NOT_PUBLISH            = 'notPublish';
    static readonly PUBLISH                = 'publish';
    static readonly NOT_SUBSCRIBE          = 'notSubscribe';
    static readonly SUBSCRIBE              = 'subscribe';

    static readonly INFO = INFO;
}

class ChannelConfig
{
    public static readonly KEYS = KEYS;
    public static readonly CHANNEL = CHANNEL;
}

export = ChannelConfig;