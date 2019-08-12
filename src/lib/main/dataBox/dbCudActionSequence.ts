/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {CudAction, InfoOption, IfContainsOption} from "./dbDefinitions";
import DataBoxUtils                              from "./dataBoxUtils";

type CommitFunction = (actions : CudAction[]) => Promise<void>;

/**
 * Saves all commands for execute later.
 */
export default class DbCudActionSequence
{
    private actions : CudAction[] = [];
    private readonly commitFunction : CommitFunction;

    constructor(commitFunc : CommitFunction) {
        this.commitFunction = commitFunc;
    }

    /**
     * Insert a new value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param keyPath
     * @param value
     * @param ifContains
     * @param code
     * @param data
     */
    insert(keyPath : string[] | string,value : any,{ifContains,code,data} : IfContainsOption & InfoOption) : DbCudActionSequence {
        this.actions.push(DataBoxUtils.buildInsert(keyPath,value,ifContains,code,data));
        return this;
    }

    /**
     * Update a value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param keyPath
     * @param value
     * @param code
     * @param data
     */
    update(keyPath : string[] | string,value : any,{code,data} : InfoOption) : DbCudActionSequence {
        this.actions.push(DataBoxUtils.buildUpdate(keyPath,value,code,data));
        return this;
    }

    /**
     * Delete a value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param keyPath
     * @param code
     * @param data
     */
    delete(keyPath : string[] | string,{code,data} : InfoOption) : DbCudActionSequence {
        this.actions.push(DataBoxUtils.buildDelete(keyPath,code,data));
        return this;
    }

    /**
     * Apply all changes on the DataBox.
     */
    async commit() {
        await this.commitFunction(this.actions);
    }
}