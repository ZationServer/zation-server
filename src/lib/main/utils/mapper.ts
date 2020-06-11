/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import SocketSet   from "./socketSet";
import {RawSocket} from '../sc/socket';

export default class Mapper<T extends RawSocket>
{
    private readonly data: Record<string,undefined |SocketSet> = {};

    constructor() {
        this.data = {};
    }

    map(k: string,v: T): void
    {
        if(this.data[k] instanceof SocketSet) {
            (this.data[k] as SocketSet).add(v)
        }
        else {
            this.data[k] = new SocketSet();
            (this.data[k] as SocketSet).add(v);
        }
    }

    getValues(k: string): RawSocket[]
    {
        if(this.data[k] instanceof SocketSet) {
            return (this.data[k] as SocketSet).toArray();
        }
        else {
            return [];
        }
    }

    forEach(k: string,func: (socket: RawSocket) => void)
    {
        if(this.data[k] instanceof SocketSet) {
            (this.data[k] as SocketSet).forEach(func);
        }
    }

    forAllEach(func: (socket: RawSocket) => void)
    {
        for(const k in this.data){
            if(this.data.hasOwnProperty(k) &&
                this.data[k] instanceof SocketSet) {
                (this.data[k] as SocketSet).forEach(func);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeKey(k: string) {
       this.data[k] = undefined;
    }

    unMap(k: string | undefined, v: T)
    {
        if(k !== undefined && this.data[k] instanceof SocketSet) {
            (this.data[k] as SocketSet).remove(v);
        }
    }

    getLengthOfKey(k: string): number {
        if(this.data[k] instanceof SocketSet){
            return (this.data[k] as SocketSet).getLength();
        }
        else{
            return 0;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeAllValues(v: T)
    {
        for(const k in this.data) {
            if(this.data.hasOwnProperty(k) && this.data[k] instanceof SocketSet) {
                (this.data[k] as SocketSet).remove(v)
            }
        }
    }

    isKeyExist(k: string): boolean {
        return this.data[k] instanceof SocketSet;
    }

    getData(): Record<string,undefined |SocketSet> {
        return this.data;
    }
}