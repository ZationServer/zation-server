/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket    from "../sc/socket";
import SocketSet   from "./socketSet";

export default class Mapper<T extends UpSocket>
{
    private readonly data: Record<string,undefined |SocketSet> = {};

    constructor() {
        this.data = {};
    }

    map(k: string,v: T): void
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

    getValues(k: string): UpSocket[]
    {
        if(this.data[k] instanceof SocketSet) {
            // @ts-ignore
            return this.data[k].toArray();
        }
        else {
            return [];
        }
    }

    forEach(k: string,func: (socket: UpSocket) => void)
    {
        if(this.data[k] instanceof SocketSet) {
            // @ts-ignore
            this.data[k].forEach(func);
        }
    }

    forAllEach(func: (socket: UpSocket) => void)
    {
        for(const k in this.data){
            if(this.data.hasOwnProperty(k) &&
                this.data[k] instanceof SocketSet) {
                // @ts-ignore
                this.data[k].forEach(func);
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
            // @ts-ignore
            this.data[k].remove(v);
        }
    }

    getLengthOfKey(k: string): number {
        if(this.data[k] instanceof SocketSet){
            // @ts-ignore
            return this.data[k].getLength();
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
                // @ts-ignore
                this.data[k].remove(v)
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