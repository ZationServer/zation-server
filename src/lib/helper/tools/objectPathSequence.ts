/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectPath = require("./objectPath");

type CommitFunction = (object : object) => Promise<void>;

class ObjectPathSequence
{
    private readonly object : object;
    private readonly commitFunction : CommitFunction;

    constructor(object : object, commitFunc : CommitFunction) {
        this.object = object;
    }

    set(path : string | string[],value : any) : ObjectPathSequence {
        ObjectPath.set(this.object,path,value);
        return this;
    }

    delete(path : string | string[]) : ObjectPathSequence {
        ObjectPath.del(this.object,path);
        return this;
    }

    async commit() {
        await this.commitFunction(this.object);
    }






}

export = ObjectPathSequence;