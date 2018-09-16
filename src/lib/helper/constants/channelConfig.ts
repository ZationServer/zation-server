/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS {
    static readonly CUSTOM_ID_CHANNELS         = 'customIdChannels';
    static readonly CUSTOM_CHANNELS            = 'customChannels';
    static readonly USER_CH                    = 'userCh';
    static readonly AUTH_USER_GROUP_CH         = 'authUserGroupCh';
    static readonly DEFAULT_USER_GROUP_CH      = 'defaultUserGroupCh';
    static readonly ALL_CH                     = 'allCh';
}

class ACCESS {
    static readonly ALL_AUTH                = 'allAuth';
    static readonly ALL_NOT_AUTH            = 'allNotAuth';
    static readonly ALL                     = 'all';
}

class CHANNEL {
    static readonly CLIENT_PUBLISH_NOT_ACCESS  = 'clientPublishNotAccess';
    static readonly CLIENT_PUBLISH_ACCESS      = 'clientPublishAccess';
    static readonly SUBSCRIBE_NOT_ACCESS       = 'subscribeNotAccess';
    static readonly SUBSCRIBE_ACCESS           = 'subscribeAccess';

    static readonly ON_SUBSCRIPTION        = 'onSubscription';
    static readonly ON_UNSUBSCRIPTION      = 'onUnsubscription';
    static readonly ON_CLIENT_PUBLISH      = 'onClientPublish';
    static readonly ON_BAG_PUBLISH         = 'onBagPublish';
}

class CHANNEL_SETTINGS {
    static readonly SOCKET_GET_OWN_PUBLISH = 'socketGetOwnPublish';
}

class CHANNEL_DEFAULT {
    static readonly DEFAULT = 'default';
}

class ChannelConfig
{
    public static readonly KEYS = KEYS;
    public static readonly CHANNEL = CHANNEL;
    public static readonly ACCESS = ACCESS;
    public static readonly CHANNEL_SETTINGS = CHANNEL_SETTINGS;
    public static readonly CHANNEL_DEFAULT = CHANNEL_DEFAULT;
}

export = ChannelConfig;