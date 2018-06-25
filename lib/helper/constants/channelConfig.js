/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ChannelConfig {}

ChannelConfig.KEYS = {};
ChannelConfig.KEYS.CUSTOM_ID_CHANNELS         = 'customIdChannels';
ChannelConfig.KEYS.CUSTOM_CHANNELS            = 'customChannels';
ChannelConfig.KEYS.DEFAULTS                   = 'default';

//CHANNEL CONFIG
ChannelConfig.CHANNEL = {};
ChannelConfig.CHANNEL.NOT_PUBLISH            = 'notPublish';
ChannelConfig.CHANNEL.PUBLISH                = 'publish';
ChannelConfig.CHANNEL.NOT_SUBSCRIBE          = 'notSubscribe';
ChannelConfig.CHANNEL.SUBSCRIBE              = 'subscribe';

//Generate Info to check Access for specialChannels
ChannelConfig.CHANNEL.INFO = {};
ChannelConfig.CHANNEL.INFO.AUTH_USER_GROUP   = 'authUserGroup';
ChannelConfig.CHANNEL.INFO.IS_AUTH_IN        = 'authIn';
ChannelConfig.CHANNEL.INFO.USER_ID           = 'userId';
ChannelConfig.CHANNEL.INFO.SOCKET            = 'socket';
ChannelConfig.CHANNEL.INFO.TOKEN_ID          = 'tokenId';

module.exports = ChannelConfig;