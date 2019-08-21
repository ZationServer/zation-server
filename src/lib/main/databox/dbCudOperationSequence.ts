/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {CudOperation, InfoOption, IfContainsOption} from "./dbDefinitions";
import DataboxUtils                              from "./databoxUtils";

type CommitFunction = (operations : CudOperation[]) => Promise<void>;

/**
 * Saves all commands for execute later.
 */
export default class DbCudOperationSequence
{
    private operations : CudOperation[] = [];
    private readonly commitFunction : CommitFunction;

    constructor(commitFunc : CommitFunction) {
        this.commitFunction = commitFunc;
    }

    /**
     * Insert a new value in the Databox.
     * Insert behavior:
     * Without ifContains (ifContains exists):
     * Base (with keyPath [] or '') -> Nothing
     * KeyArray -> Inserts the value at the end with the key
     * (if the key does not exist). But if you are using a compare function,
     * it will insert the value in the correct position.
     * Object -> Inserts the value with the key (if the key does not exist).
     * Array -> Key will be parsed to int if it is a number then it will be inserted at the index.
     * Otherwise, it will be added at the end.
     * With ifContains (ifContains exists):
     * Base (with keyPath [] or '') -> Nothing
     * KeyArray -> Inserts the value before the ifContains element with the key
     * (if the key does not exist). But if you are using a compare function,
     * it will insert the value in the correct position.
     * Object -> Inserts the value with the key (if the key does not exist).
     * Array -> Key will be parsed to int if it is a number then it will be inserted at the index.
     * Otherwise, it will be added at the end.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param value
     * @param ifContains
     * @param code
     * @param data
     */
    insert(keyPath : string[] | string,value : any,{ifContains,code,data} : IfContainsOption & InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildInsert(keyPath,value,ifContains,code,data));
        return this;
    }

    /**
     * Update a value in the Databox.
     * Update behavior:
     * Base (with keyPath [] or '') -> Updates the complete structure.
     * KeyArray -> Updates the specific value (if the key does exist).
     * Object -> Updates the specific value (if the key does exist).
     * Array -> Key will be parsed to int if it is a number it will
     * update the specific value (if the index exist).
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param value
     * @param code
     * @param data
     */
    update(keyPath : string[] | string,value : any,{code,data} : InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildUpdate(keyPath,value,code,data));
        return this;
    }

    /**
     * Delete a value in the Databox.
     * Delete behavior:
     * Base (with keyPath [] or '') -> Deletes the complete structure.
     * KeyArray -> Deletes the specific value (if the key does exist).
     * Object -> Deletes the specific value (if the key does exist).
     * Array -> Key will be parsed to int if it is a number it will delete the
     * specific value (if the index does exist). Otherwise, it will delete the last item.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param code
     * @param data
     */
    delete(keyPath : string[] | string,{code,data} : InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildDelete(keyPath,code,data));
        return this;
    }

    /**
     * Apply all changes on the Databox.
     * Notice that this method will only update the Databox and invoke the before-events.
     * It will not automatically update the database,
     * so you have to do it in the before-events or before calling this method.
     */
    async commit() {
        await this.commitFunction(this.operations);
    }
}