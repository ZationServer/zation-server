/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Socket from "../sc/socket";

export default class SocketSet
{
    private length : number = 0;
    private sockets : Record<string,Socket> = {};

    add(socket : Socket) : void
    {
        if(!this.sockets.hasOwnProperty(socket.tid)) {
            this.sockets[socket.tid] = socket;
            this.length++;
        }
    }

    contains(socket : Socket) : boolean {
        return this.sockets.hasOwnProperty(socket.tid);
    }

    remove(socket : Socket) : void {
        if(this.sockets.hasOwnProperty(socket.tid)){
            delete this.sockets[socket.tid];
            this.length--;
        }
    }

    getLength() : number {
        return this.length;
    }

    toArray() : Socket[] {
        const res : Socket[] = [];
        for(let id in this.sockets){
            if(this.sockets.hasOwnProperty(id)){
                res.push(this.sockets[id]);
            }
        }
        return res;
    }

    forEach(func : (socket : Socket) => void)
    {
        for(let id in this.sockets){
            if(this.sockets.hasOwnProperty(id)){
                func(this.sockets[id]);
            }
        }
    }
}

