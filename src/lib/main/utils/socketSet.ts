/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RawSocket} from '../sc/socket';

export default class SocketSet
{
    private length: number = 0;
    private sockets: Record<string,RawSocket> = {};

    add(socket: RawSocket): void
    {
        if(!this.sockets.hasOwnProperty(socket.tid)) {
            this.sockets[socket.tid] = socket;
            this.length++;
        }
    }

    contains(socket: RawSocket): boolean {
        return this.sockets.hasOwnProperty(socket.tid);
    }

    remove(socket: RawSocket): void {
        if(this.sockets.hasOwnProperty(socket.tid)){
            delete this.sockets[socket.tid];
            this.length--;
        }
    }

    getLength(): number {
        return this.length;
    }

    toArray(): RawSocket[] {
        const res: RawSocket[] = [];
        for(const id in this.sockets){
            if(this.sockets.hasOwnProperty(id)){
                res.push(this.sockets[id]);
            }
        }
        return res;
    }

    forEach(func: (socket: RawSocket) => void)
    {
        for(const id in this.sockets){
            if(this.sockets.hasOwnProperty(id)){
                func(this.sockets[id]);
            }
        }
    }
}

