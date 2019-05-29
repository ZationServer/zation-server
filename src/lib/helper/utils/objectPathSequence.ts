/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectPath from "./objectPath";

type CommitFunction = (object : object) => Promise<void>;

/**
 * Edit an object directly with object paths.
 */
export default class ObjectPathSequence
{
    private object : object;
    private readonly commitFunction : CommitFunction;

    constructor(object : object, commitFunc : CommitFunction) {
        this.object = object;
        this.commitFunction = commitFunc;
    }

    set(path : string | string[],value : any) : ObjectPathSequence {
        ObjectPath.set(this.object,path,value);
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    delete(path ?: string | string[]) : ObjectPathSequence {
        if(!!path) {
            ObjectPath.del(this.object,path);
        }
        else {
            this.object = {};
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    async commit() {
        await this.commitFunction(this.object);
    }
}