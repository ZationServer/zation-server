/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ChannelFamily  from '../ChannelFamily';
import Socket         from '../../Socket';
import {DeepReadonly} from '../../../main/utils/typeUtils';

export default class ChannelFamilyContainer<M = string> {

    private readonly _channels: ChannelFamily<M>[];
    private readonly _count: number;

    constructor(channels: ChannelFamily<M>[]) {
        this._channels = channels;
        this._count = channels.length;
    }

    get channels(): ChannelFamily<M>[] {
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
    publish(member: M,event: string, data: any, publisherSid?: string) {
        for(let i = 0; i < this._count; i++) {
            this._channels[i].publish(member,event,data,publisherSid);
        }
    }

    /**
     * The close function will close a Channel member for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param member The member of the family you want to close.
     * @param code
     * @param data
     * @param forEveryWorker
     * @return The returned promise is resolved when
     * the close is fully processed on the current worker.
     */
    async close(member: M,code?: number | string, data?: any,forEveryWorker: boolean = true): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this._count; i++) {
            promises.push(this._channels[i].close(member,code,data,forEveryWorker));
        }
        await Promise.all(promises);
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
    kickOut(member: M, socket: Socket, code?: number | string, data?: any) {
        for(let i = 0; i < this._count; i++) {
            this._channels[i].kickOut(member,socket,code,data);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * With this function, you can do a recheck of all sockets on a specific member.
     * It can be useful when the access rights to member have changed,
     * and you want to kick out all sockets that not have access anymore.
     * Notice that the promise is resolved when the access was checked
     * on the current worker and request sent to other workers.
     * @param member
     * @param forEveryWorker
     */
    async recheckMemberAccess(member: M, forEveryWorker: boolean = true): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this._count;i++) {
            promises.push(this._channels[i].recheckMemberAccess(member,forEveryWorker));
        }
        await Promise.all(promises);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method returns an array
     * with all members that the socket has subscribed.
     * @param socket
     */
    getSocketSubMembers(socket: Socket): DeepReadonly<M>[] {
        const members: DeepReadonly<M>[] = [];
        for(let i = 0; i < this._count;i++) {
            members.push(...this._channels[i].getSocketSubMembers(socket))
        }
        return members;
    }
}