/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Channel                    from '../../../../api/channel/Channel';
// noinspection ES6PreferShortImport
import {ChannelConfig}            from '../../../../main/config/definitions/parts/channelConfig';
import {ZationToken}              from '../../../constants/internal';
import {createTokenCheckFunction} from '../../../access/accessOptions';

export default class PanelChannel extends Channel
{
    static config: ChannelConfig = {
        access: createTokenCheckFunction((token) =>
            token !== null && token[nameof<ZationToken>(s => s.panelAccess)] === true)
    };
}
