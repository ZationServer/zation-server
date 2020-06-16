/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import * as ObjectPath      from "object-path";
import {ObjectPathSequence} from "./objectPathSequence";

type CommitFunction = (object: object) => Promise<void>;

/**
 * Edit an object directly with object paths.
 */
export default class ObjectPathSequenceImp implements ObjectPathSequence
{
    private object: object;
    private readonly commitFunction: CommitFunction;

    constructor(object: object, commitFunc: CommitFunction) {
        this.object = object;
        this.commitFunction = commitFunc;
    }

    set(path: string | string[],value: any): ObjectPathSequenceImp {
        ObjectPath.set(this.object,path,value);
        return this;
    }

    delete(path?: string | string[]): ObjectPathSequenceImp {
        if(!!path) {
            ObjectPath.del(this.object,path);
        }
        else {
            this.object = {};
        }
        return this;
    }

    commit(): Promise<void> {
        return this.commitFunction(this.object);
    }
}