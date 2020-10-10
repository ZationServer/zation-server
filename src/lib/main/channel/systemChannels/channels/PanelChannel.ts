/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Channel                    from '../../../../api/channel/Channel';
// noinspection ES6PreferShortImport
import {ChannelConfig}            from '../../../../main/config/definitions/parts/channelConfig';
import {RawZationToken}           from '../../../definitions/internal';

export default class PanelChannel extends Channel
{
    static config: ChannelConfig = {
        access: (socket) => {
            const token = socket.rawToken;
            return token != null && token[nameof<RawZationToken>(s => s.panelAccess)] === true;
        }
    };
}

