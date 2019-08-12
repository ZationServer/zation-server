/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket from "../sc/socket";

export default class SocketSet
{
    private length : number = 0;
    private sockets : Record<string,UpSocket> = {};

    add(socket : UpSocket) : void
    {
        if(!this.sockets.hasOwnProperty(socket.tid)) {
            this.sockets[socket.tid] = socket;
            this.length++;
        }
    }

    contains(socket : UpSocket) : boolean {
        return this.sockets.hasOwnProperty(socket.tid);
    }

    remove(socket : UpSocket) : void {
        if(this.sockets.hasOwnProperty(socket.tid)){
            delete this.sockets[socket.tid];
            this.length--;
        }
    }

    getLength() : number {
        return this.length;
    }

    toArray() : UpSocket[] {
        const res : UpSocket[] = [];
        for(let id in this.sockets){
            if(this.sockets.hasOwnProperty(id)){
                res.push(this.sockets[id]);
            }
        }
        return res;
    }

    forEach(func : (socket : UpSocket) => void)
    {
        for(let id in this.sockets){
            if(this.sockets.hasOwnProperty(id)){
                func(this.sockets[id]);
            }
        }
    }
}

