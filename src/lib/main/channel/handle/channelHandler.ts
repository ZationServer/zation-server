/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ChannelSubscribeRequest}    from '../channelDefinitions';
import UpSocket, {RespondFunction}  from '../../sc/socket';
import {isValidChannelSubRequest}   from './channelReqUtils';
import {ChannelPrepare}             from '../channelPrepare';
import ApiLevelUtils                from '../../apiLevel/apiLevelUtils';
import {ClientErrorName}            from '../../constants/clientErrorName';
import ZationConfig                 from '../../config/manager/zationConfig';

export default class ChannelHandler {

    protected readonly channelPrepare: ChannelPrepare;

    private readonly defaultApiLevel: number;

    constructor(channelPrepare: ChannelPrepare,zc: ZationConfig) {
        this.channelPrepare = channelPrepare;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
    }

    async processSubRequest(request: ChannelSubscribeRequest, socket: UpSocket, respond: RespondFunction) {
        try {
            respond(null,await this._processRequest(request,socket));
        }
        catch (err) {
            respond(err);
        }
    }

    private async _processRequest(request: ChannelSubscribeRequest, socket: UpSocket): Promise<any> {
        if (!isValidChannelSubRequest(request)) {
            const err: any = new Error(`Not valid req structure.`);
            err.name = ClientErrorName.InvalidRequest;
            throw err;
        }

        const channel = this.channelPrepare.get(request.c,
            (ApiLevelUtils.parseRequestApiLevel(request.a) || socket.apiLevel || this.defaultApiLevel));

        return await channel._subscribeSocket(socket,
            typeof request.m === 'string' ? request.m : undefined);
    }
}