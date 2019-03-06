/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {SyncTokenActions} from "../constants/syncTokenActions";

type CommitFunction = (actions : { action: SyncTokenActions, params: any[] }[]) => Promise<void>;

/*
Saves all commands for execute later.
 */
class ObjectPathActionSequence
{
    private actions : { action: SyncTokenActions, params: any[] }[] = [];
    private readonly commitFunction : CommitFunction;

    constructor(commitFunc : CommitFunction) {
        this.commitFunction = commitFunc;
    }

    set(path : string | string[],value : any) : ObjectPathActionSequence {
        this.actions.push({action : SyncTokenActions.SET,params : [path,value]});
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    delete(path ?: string | string[]) : ObjectPathActionSequence {
        this.actions.push({action : SyncTokenActions.DELETE,params : [path]});
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    async commit() {
        await this.commitFunction(this.actions);
    }
}

export = ObjectPathActionSequence;