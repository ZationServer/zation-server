/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ChannelFamily  from '../ChannelFamily';
import Socket         from '../../Socket';

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

    /**
     * The close function will close a Channel member for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param member The member of the family you want to close.
     * Numbers will be converted to a string.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(member: string | number,code?: number | string, data?: any,forEveryWorker: boolean = true): void {
        for(let i = 0; i < this._count; i++) {
            this._channels[i].close(member,code,data,forEveryWorker);
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
    kickOut(member: string | number, socket: Socket, code?: number | string, data?: any) {
        for(let i = 0; i < this._count; i++) {
            this._channels[i].kickOut(member,socket,code,data);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * With this function, you can do a recheck of all sockets on a specific member.
     * It can be useful when the access rights to member have changed,
     * and you want to kick out all sockets that not have access anymore.
     * @param member
     * @param forEveryWorker
     */
    async recheckMemberAccess(member: string | number, forEveryWorker: boolean = true): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this._count;i++) {
            promises.push(this._channels[i].recheckMemberAccess(member,forEveryWorker));
        }
        await Promise.all(promises);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method returns a string array
     * with all members that the socket has subscribed.
     * @param socket
     */
    getSocketSubMembers(socket: Socket): string[] {
        const members: string[] = [];
        for(let i = 0; i < this._count;i++) {
            members.push(...this._channels[i].getSocketSubMembers(socket))
        }
        return members;
    }
}