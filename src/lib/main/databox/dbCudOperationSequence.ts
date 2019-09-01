/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {CudOperation, InfoOption, IfContainsOption, DbCudSelector} from "./dbDefinitions";
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
     * Base (with selector [] or '') -> Nothing
     * KeyArray -> Inserts the value at the end with the key
     * (if the key does not exist). But if you are using a compare function,
     * it will insert the value in the correct position.
     * Object -> Inserts the value with the key (if the key does not exist).
     * Array -> Key will be parsed to int if it is a number then it will be inserted at the index.
     * Otherwise, it will be added at the end.
     * With ifContains (ifContains exists):
     * Base (with selector [] or '') -> Nothing
     * KeyArray -> Inserts the value before the ifContains element with the key
     * (if the key does not exist). But if you are using a compare function,
     * it will insert the value in the correct position.
     * Object -> Inserts the value with the key (if the key does not exist).
     * Array -> Key will be parsed to int if it is a number then it will be inserted at the index.
     * Otherwise, it will be added at the end.
     * @param selector
     * The selector can be a direct key-path,
     * can contain filter queries (by using the forint library)
     * or it can select all items with '*'.
     * If you use a string as a param type,
     * you need to notice that it will be split into a key-path by dots.
     * @param value
     * @param ifContains
     * @param code
     * @param data
     */
    insert(selector : DbCudSelector,value : any,{ifContains,code,data} : IfContainsOption & InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildInsert(selector,value,ifContains,code,data));
        return this;
    }

    /**
     * Update a value in the Databox.
     * Update behavior:
     * Base (with selector [] or '') -> Updates the complete structure.
     * KeyArray -> Updates the specific value (if the key does exist).
     * Object -> Updates the specific value (if the key does exist).
     * Array -> Key will be parsed to int if it is a number it will
     * update the specific value (if the index exist).
     * @param selector
     * The selector can be a direct key-path,
     * can contain filter queries (by using the forint library)
     * or it can select all items with '*'.
     * If you use a string as a param type,
     * you need to notice that it will be split into a key-path by dots.
     * @param value
     * @param code
     * @param data
     */
    update(selector : DbCudSelector,value : any,{code,data} : InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildUpdate(selector,value,code,data));
        return this;
    }

    /**
     * Delete a value in the Databox.
     * Delete behavior:
     * Base (with selector [] or '') -> Deletes the complete structure.
     * KeyArray -> Deletes the specific value (if the key does exist).
     * Object -> Deletes the specific value (if the key does exist).
     * Array -> Key will be parsed to int if it is a number it will delete the
     * specific value (if the index does exist). Otherwise, it will delete the last item.
     * @param selector
     * The selector can be a direct key-path,
     * can contain filter queries (by using the forint library)
     * or it can select all items with '*'.
     * If you use a string as a param type,
     * you need to notice that it will be split into a key-path by dots.
     * @param code
     * @param data
     */
    delete(selector : DbCudSelector,{code,data} : InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildDelete(selector,code,data));
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