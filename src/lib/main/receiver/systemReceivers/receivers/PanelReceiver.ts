/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Receiver         from '../../../../api/Receiver';
import {ReceiverConfig} from '../../../config/definitions/parts/receiverConfig';
// noinspection ES6PreferShortImport
import {$single}                  from '../../../../api/input/Single';
import {createTokenCheckFunction} from '../../../access/accessOptions';
import {RawZationToken}           from '../../../constants/internal';
import Bag                        from '../../../../api/Bag';
import {ScExchange}               from '../../../sc/scServer';
import {INTERNAL_PANEL_CH}        from '../../../internalChannels/internalChannelEngine';
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

    initialize(bag: Bag): Promise<void> | void {
        this.exchange = bag.getWorker().scServer.exchange;
    }

    handle(bag,firstPing: boolean) {
        this.exchange.publish(INTERNAL_PANEL_CH,firstPing);
    }
}

