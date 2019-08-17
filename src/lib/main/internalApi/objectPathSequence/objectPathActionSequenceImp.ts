/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {SyncTokenActions}   from "../../constants/syncTokenActions";
import {ObjectPathSequence} from "./objectPathSequence";

type CommitFunction = (actions : { action: SyncTokenActions, params: any[] }[]) => Promise<void>;

/**
 * Saves all commands for execute later.
 */
export default class ObjectPathActionSequenceImp implements ObjectPathSequence
{
    private actions : { action: SyncTokenActions, params: any[] }[] = [];
    private readonly commitFunction : CommitFunction;

    constructor(commitFunc : CommitFunction) {
        this.commitFunction = commitFunc;
    }

    set(path : string | string[],value : any) : ObjectPathActionSequenceImp {
        this.actions.push({action : SyncTokenActions.SET,params : [path,value]});
        return this;
    }

    delete(path ?: string | string[]) : ObjectPathActionSequenceImp {
        this.actions.push({action : SyncTokenActions.DELETE,params : [path]});
        return this;
    }

    async commit() {
        await this.commitFunction(this.actions);
    }
}