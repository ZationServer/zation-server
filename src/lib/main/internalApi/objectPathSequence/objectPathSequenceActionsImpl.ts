/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ObjectEditAction, EditType} from "../../definitions/objectEditAction";
import {ObjectPathSequence}         from "./objectPathSequence";

type CommitFunction = (operations: ObjectEditAction[]) => Promise<void>;

/**
 * Saves all commands for execute later.
 */
export default class ObjectPathSequenceActionsImpl implements ObjectPathSequence
{
    private operations: ObjectEditAction[] = [];
    private readonly commitFunction: CommitFunction;

    constructor(commitFunc: CommitFunction) {
        this.commitFunction = commitFunc;
    }

    set(path: string | string[],value: any): ObjectPathSequenceActionsImpl {
        this.operations.push([EditType.Set,path,value]);
        return this;
    }

    delete(path: string | string[]): ObjectPathSequenceActionsImpl {
        this.operations.push([EditType.Delete,path]);
        return this;
    }

    clear(): ObjectPathSequenceActionsImpl {
        this.operations = [];
        this.operations.push([EditType.Clear]);
        return this;
    }

    hasUncommittedChanges(): boolean {
        return this.operations.length > 0;
    }

    async commit() {
        if(this.operations.length > 0) {
            await this.commitFunction(this.operations);
            this.operations = [];
        }
    }
}