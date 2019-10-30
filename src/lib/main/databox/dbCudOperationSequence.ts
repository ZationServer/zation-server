/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {
    CudOperation,
    InfoOption,
    IfContainsOption,
    DbCudSelector,
    PotentialUpdateOption,
    PotentialInsertOption
} from "./dbDefinitions";
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
     * Notice that in every case, the insert only happens when the key
     * does not exist on the client.
     * Otherwise, the client will ignore or convert it to an
     * update when potentialUpdate is active.
     * Without ifContains:
     * Base (with selector [] or '') -> Nothing
     * KeyArray -> Inserts the value at the end with the key.
     * But if you are using a compare function, it will insert the value in the correct position.
     * Object -> Insert the value with the key.
     * Array -> Key will be parsed to int if it is a number, then it will be inserted at the index.
     * Otherwise, it will be inserted at the end.
     * With ifContains (ifContains exists):
     * Base (with selector [] or '') -> Nothing
     * KeyArray -> Inserts the value before the ifContains element with the key.
     * But if you are using a compare function, it will insert the value in the correct position.
     * Object -> Insert the value with the key.
     * Array -> Key will be parsed to int if it is a number, then it will be inserted at the index.
     * Otherwise, it will be added at the end.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value (with $value) by key (with $key) or
     * select all keys with the constant $all.
     * In the case of insertions, the selector must be key resolvable.
     * That means it must end with a specific string key.
     * Otherwise, the insertion is ignored by the client.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param value
     * @param ifContains
     * @param potentialUpdate
     * @param code
     * @param data
     */
    insert(selector : DbCudSelector, value : any, {ifContains,potentialUpdate,code,data} : IfContainsOption & PotentialUpdateOption & InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildInsert(selector,value,ifContains,potentialUpdate,code,data));
        return this;
    }

    /**
     * Update a value in the Databox.
     * Update behavior:
     * Notice that in every case, the update only happens when the key
     * on the client does exist.
     * Otherwise, the client will ignore or convert it to an
     * insert when potentialInsert is active.
     * Also, if the ifContains option is provided, the element must exist.
     * Base (with selector [] or '') -> Updates the complete structure.
     * KeyArray -> Updates the specific value.
     * Object -> Updates the specific value.
     * Array -> Key will be parsed to int if it is a number
     * it will update the specific value.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value (with $value) by key (with $key) or
     * select all keys with the constant $all.
     * In the case of insertions, the selector must be key resolvable.
     * That means it must end with a specific string key.
     * Otherwise, the insertion is ignored by the client.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param value
     * @param ifContains
     * @param potentialInsert
     * @param code
     * @param data
     */
    update(selector : DbCudSelector, value : any, {ifContains,potentialInsert,code,data} : IfContainsOption & PotentialInsertOption & InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildUpdate(selector,value,ifContains,potentialInsert,code,data));
        return this;
    }

    /**
     * Delete a value in the Databox.
     * Delete behavior:
     * Notice that in every case, the delete only happens when the key
     * on the client does exist.
     * Otherwise, the client will ignore it.
     * Also, if the ifContains option is provided, the element must exist.
     * Base (with selector [] or '') -> Deletes the complete structure.
     * KeyArray -> Deletes the specific value.
     * Object -> Deletes the specific value.
     * Array -> Key will be parsed to int if it is a number it
     * will delete the specific value.
     * Otherwise, it will delete the last item.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value (with $value) by key (with $key) or
     * select all keys with the constant $all.
     * In the case of insertions, the selector must be key resolvable.
     * That means it must end with a specific string key.
     * Otherwise, the insertion is ignored by the client.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param ifContains
     * @param code
     * @param data
     */
    delete(selector : DbCudSelector, {ifContains,code,data} : IfContainsOption & InfoOption = {}) : DbCudOperationSequence {
        this.operations.push(DataboxUtils.buildDelete(selector,ifContains,code,data));
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