/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Channel                 from '../Channel';
// noinspection ES6PreferShortImport
import {RawSocket}             from '../../../main/sc/socket';

export default class ChannelContainer {

    private readonly _channels: Channel[];
    private readonly _count: number;

    constructor(channels: Channel[]) {
        this._channels = channels;
        this._count = channels.length;
    }

    get channels(): Channel[] {
        return [...this._channels];
    }

    /**
     * **Not override this method.**
     * Publish into this channel.
     * @param event
     * @param data
     * @param publisherSid
     * The publisher sid indicates the socket sid that publishes the data.
     * If you provide one the published data will not send to the publisher socket.
     */
    publish(event: string, data: any, publisherSid?: string) {
        for(let i = 0; i < this._count; i++) {
            this._channels[i].publish(event,data,publisherSid);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Kicks out a socket from this channel.
     * @param socket
     * @param code
     * @param data
     */
    kickOut(socket: RawSocket, code?: number | string, data?: any) {
        for(let i = 0; i < this._count; i++) {
            this._channels[i].kickOut(socket,code,data);
        }
    }
}