/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ChannelConfig {}

//CHANNEL CONFIG
ChannelConfig.CHANNEL_PUBLISH                = 'publish';
ChannelConfig.CHANNEL_SUBSCRIBE              = 'subscribe';
ChannelConfig.CHANNEL_SPECIAL_CHANNELS       = 'specialChannels';
ChannelConfig.CHANNEL_DEFAULT_RIGHTS         = 'defaultRights';

//Generate Info to check Access for specialChannels
ChannelConfig.CHANNEL_INFO_AUTH_GROUP        = 'authGroup';
ChannelConfig.CHANNEL_INFO_IS_AUTH_IN        = 'authIn';
ChannelConfig.CHANNEL_INFO_ID                = 'id';
ChannelConfig.CHANNEL_INFO_SOCKET            = 'socket';
ChannelConfig.CHANNEL_INFO_TOKEN_ID          = 'tokenId';

module.exports = ChannelConfig;