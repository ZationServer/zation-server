/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import HashSet               = require('hashset');

class Mapper<T>
{
    private readonly data : object = {};

    constructor()
    {
        this.data = {};
    }

    map(k : string,v : T) : void
    {
        if(this.data.hasOwnProperty(k) && this.data[k] instanceof HashSet) {
            this.data[k].add(v)
        }
        else {
            this.data[k] = new HashSet();
            this.data[k].add(v);
        }
    }

    getValues(k : string) : T[]
    {
        if(this.data.hasOwnProperty(k) && this.data[k] instanceof HashSet) {
            return this.data[k].toArray();
        }
        else {
            return [];
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeKey(k : string)
    {
        delete this.data[k];
    }

    removeValueFromKey(k : string, v : T)
    {
        if(this.data.hasOwnProperty(k) && this.data[k] instanceof HashSet)
        {
            this.data[k].remove(v);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeAllValues(v : T)
    {
        for(let k in this.data)
        {
            if(this.data.hasOwnProperty(k))
            {
                this.data[k].remove(v)
            }
        }
    }

    isKeyExist(k : string) : boolean
    {
        return this.data[k] instanceof HashSet;
    }
}

export = Mapper;