/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Socket} from "../sc/socket";

export class SocketSet
{
    private length : number = 0;
    private sockets : Record<string,(Socket | undefined)> = {};

    add(socket : Socket) : void
    {
        if(this.sockets[socket.tid] === undefined) {
            this.sockets[socket.tid] = socket;
            this.length++;
        }
    }

    contains(socket : Socket) : boolean {
        return this.sockets[socket.tid] !== undefined;
    }

    remove(socket : Socket) : void {
        if(this.sockets[socket.tid] !== undefined){
            this.sockets[socket.tid] = undefined;
            this.length--;
        }
    }

    getLength() : number {
        return this.length;
    }

    toArray() : Socket[] {
        const res : Socket[] = [];
        for(let id in this.sockets){
            if(this.sockets[id] !== undefined){
                // @ts-ignore
                res.push(this.sockets[id]);
            }
        }
        return res;
    }
}

