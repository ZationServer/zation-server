/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Socket} from "../sc/socket";
import {SocketSet} from "./socketSet";

class Mapper<T extends Socket>
{
    private readonly data : Record<string,undefined |SocketSet> = {};

    constructor() {
        this.data = {};
    }

    map(k : string,v : T) : void
    {
        if(this.data[k] instanceof SocketSet) {
            // @ts-ignore
            this.data[k].add(v)
        }
        else {
            this.data[k] = new SocketSet();
            // @ts-ignore
            this.data[k].add(v);
        }
    }

    getValues(k : string) : Socket[]
    {
        if(this.data[k] instanceof SocketSet) {
            // @ts-ignore
            return this.data[k].toArray();
        }
        else {
            return [];
        }
    }

    forEach(k : string,func : (socket : Socket) => void)
    {
        if(this.data[k] instanceof SocketSet) {
            // @ts-ignore
            this.data[k].forEach(func);
        }
    }

    forAllEach(func : (socket : Socket) => void)
    {
        for(let k in this.data){
            if(this.data.hasOwnProperty(k) &&
                this.data[k] instanceof SocketSet) {
                // @ts-ignore
                this.data[k].forEach(func);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeKey(k : string) {
       this.data[k] = undefined;
    }

    removeValueFromKey(k : string, v : T)
    {
        if(this.data[k] instanceof SocketSet) {
            // @ts-ignore
            this.data[k].remove(v);
        }
    }

    getLengthFromKey(k : string) : number {
        if(this.data[k] instanceof SocketSet){
            // @ts-ignore
            return this.data[k].getLength();
        }
        else{
            return 0;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeAllValues(v : T)
    {
        for(let k in this.data) {
            if(this.data[k] instanceof SocketSet) {
                // @ts-ignore
                this.data[k].remove(v)
            }
        }
    }

    isKeyExist(k : string) : boolean {
        return this.data[k] instanceof SocketSet;
    }

    getData() : Record<string,undefined |SocketSet> {
        return this.data;
    }
}

export = Mapper;