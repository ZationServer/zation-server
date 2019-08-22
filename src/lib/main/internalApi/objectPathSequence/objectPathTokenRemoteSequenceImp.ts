/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {SyncTokenDefinitions, SyncTokenOperationType} from "../../constants/syncTokenDefinitions";
import {ObjectPathSequence}                           from "./objectPathSequence";

type CommitFunction = (operations : SyncTokenDefinitions[]) => Promise<void>;

/**
 * Saves all commands for execute later.
 */
export default class ObjectPathTokenRemoteSequenceImp implements ObjectPathSequence
{
    private operations : SyncTokenDefinitions[] = [];
    private readonly commitFunction : CommitFunction;

    constructor(commitFunc : CommitFunction) {
        this.commitFunction = commitFunc;
    }

    set(path : string | string[],value : any) : ObjectPathTokenRemoteSequenceImp {
        this.operations.push({t : SyncTokenOperationType.SET,p : path,v : value});
        return this;
    }

    delete(path ?: string | string[]) : ObjectPathTokenRemoteSequenceImp {
        this.operations.push({t : SyncTokenOperationType.DELETE,p : path});
        return this;
    }

    async commit() {
        await this.commitFunction(this.operations);
    }
}