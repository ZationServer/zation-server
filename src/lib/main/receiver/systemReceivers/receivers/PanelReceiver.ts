/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Receiver         from '../../../../api/Receiver';
// noinspection ES6PreferShortImport
import {ReceiverConfig} from '../../../config/definitions/parts/receiverConfig';
// noinspection ES6PreferShortImport
import {$single}                  from '../../../../api/input/Single';
import {createTokenCheckFunction} from '../../../access/accessOptions';
import {RawZationToken}           from '../../../constants/internal';
// noinspection ES6PreferShortImport
import {bag}                      from '../../../../api/Bag';
import {ScExchange}               from '../../../sc/scServer';
import {INTERNAL_PANEL_CH}        from '../../../internalChannels/internalChannelEngine';
// noinspection ES6PreferShortImport
import {$optional}                from '../../../../api/input/Optional';

export default class PanelReceiver extends Receiver
{
    static config: ReceiverConfig = {
        access: createTokenCheckFunction((token) =>
            token !== null && token[nameof<RawZationToken>(s => s.panelAccess)] === true),
        versionAccess: 'all',
        input: $single($optional({type: 'boolean'},false))
    };

    private exchange: ScExchange;

    initialize(): Promise<void> | void {
        this.exchange = bag.getWorker().scServer.exchange;
    }

    handle(_,firstPing: boolean) {
        this.exchange.publish(INTERNAL_PANEL_CH,firstPing);
    }
}

