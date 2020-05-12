/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ChannelSubscribeRequest} from '../channelDefinitions';

export function isValidChannelSubRequest(request: ChannelSubscribeRequest & any): boolean {
    return typeof request === 'object' && request && typeof request.c === 'string';
}