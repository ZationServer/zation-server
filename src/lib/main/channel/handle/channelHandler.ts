/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ChannelSubscribeRequest}    from '../channelDefinitions';
import {RespondFunction}            from '../../sc/socket';
import {isValidChannelSubRequest}   from './channelReqUtils';
import {ChannelPrepare}             from '../channelPrepare';
import ApiLevelUtils                from '../../apiLevel/apiLevelUtils';
import {ClientErrorName}            from '../../definitions/clientErrorName';
import ZationConfig                 from '../../config/manager/zationConfig';
import Socket                       from '../../../api/Socket';

export default class ChannelHandler {

    protected readonly channelPrepare: ChannelPrepare;

    private readonly defaultApiLevel: number;

    constructor(channelPrepare: ChannelPrepare,zc: ZationConfig) {
        this.channelPrepare = channelPrepare;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
    }

    async processSubRequest(request: ChannelSubscribeRequest, socket: Socket, respond: RespondFunction) {
        try {
            respond(null,await this._processRequest(request,socket));
        }
        catch (err) {
            respond(err);
        }
    }

    private async _processRequest(request: ChannelSubscribeRequest, socket: Socket): Promise<any> {
        if (!isValidChannelSubRequest(request)) {
            const err: any = new Error(`Not valid req structure.`);
            err.name = ClientErrorName.InvalidRequest;
            throw err;
        }

        const channel = this.channelPrepare.get(request.c,
            (ApiLevelUtils.parsePacketApiLevel(request.a) || socket.connectionApiLevel || this.defaultApiLevel));

        return await channel._handleSubRequest(socket, request.m);
    }
}