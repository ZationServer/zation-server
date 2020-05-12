/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket                from "../../../main/sc/socket";
import ChannelFamily           from '../ChannelFamily';

export default class ChannelFamilyContainer {

    private readonly _channels: ChannelFamily[];
    private readonly _count: number;

    constructor(channels: ChannelFamily[]) {
        this._channels = channels;
        this._count = channels.length;
    }

    get channels(): ChannelFamily[] {
        return [...this._channels];
    }

    /**
     * **Not override this method.**
     * Publish into a member of this channel.
     * @param member
     * @param event
     * @param data
     * @param publisherSid
     * The publisher sid indicates the socket sid that publishes the data.
     * If you provide one the published data will not send to the publisher socket.
     */
    publish(member: string | number,event: string, data: any, publisherSid?: string) {
        for(let i = 0; i < this._count; i++) {
            this._channels[i].publish(member,event,data,publisherSid);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Kicks out a socket from a member of this channel.
     * @param member
     * @param socket
     * @param code
     * @param data
     */
    kickOut(member: string | number,socket: UpSocket,code?: number | string,data?: any) {
        for(let i = 0; i < this._count; i++) {
            this._channels[i].kickOut(member,socket,code,data);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method returns a string array
     * with all members that the socket has subscribed.
     * @param socket
     */
    getSocketSubMembers(socket: UpSocket): string[] {
        const members: string[] = [];
        for(let i = 0; i < this._count;i++) {
            members.push(...this._channels[i].getSocketSubMembers(socket))
        }
        return members;
    }
}