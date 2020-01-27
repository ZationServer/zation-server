/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket                from "../../sc/socket";
import DbCudOperationSequence  from "../dbCudOperationSequence";
import DataboxFamily           from "../../../api/databox/DataboxFamily";
import DataboxUtils            from "../databoxUtils";
import {
    InfoOption,
    IfOption,
    TimestampOption,
    DbSelector,
    PotentialUpdateOption,
    PotentialInsertOption
} from "../dbDefinitions";

export default class DataboxFamilyContainer {

    private readonly databoxFamilies : DataboxFamily[];

    constructor(databoxFamilies : DataboxFamily[]) {
        this.databoxFamilies = databoxFamilies;
    }

    /**
     * Insert a new value in the Databox.
     * Notice that this method will only update the Databox.
     * It will not automatically update the database,
     * so you have to do it before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Insert behavior:
     * Notice that in every case, the insert only happens when the key
     * does not exist on the client.
     * Otherwise, the client will ignore or convert it to an
     * update when potentiallyUpdate is active.
     * Other conditions are that the timeout is newer than the existing
     * timeout and all if conditions are true.
     * Head (with selector [] or '') -> Inserts the value.
     * KeyArray -> Inserts the value at the end with the key.
     * But if you are using a compare function, it will insert the value in the correct position.
     * Object -> Insert the value with the key.
     * Array -> Key will be parsed to int if it is a number, then it will be inserted at the index.
     * Otherwise, it will be inserted at the end.
     * @param id The member of the family you want to update.
     * Number will be converted to a string.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value ($value or property value) by key ($key or property key) or
     * select all keys with {} (For better readability use the constant $all).
     * In the case of insertions, most times, the selector should end with
     * a new key instead of a query.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param value
     * @param options
     */
    async insert(id : string | number, selector: DbSelector, value: any, options : IfOption & PotentialUpdateOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.databoxFamilies.length;i++) {
            promises.push(this.databoxFamilies[i].insert(id,selector,value,options));
        }
        await Promise.all(promises);
    }

    /**
     * Update a value in the Databox.
     * Notice that this method will only update the Databox.
     * It will not automatically update the database,
     * so you have to do it before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Update behavior:
     * Notice that in every case, the update only happens when the key
     * on the client does exist.
     * Otherwise, the client will ignore or convert it to an
     * insert when potentiallyInsert is active.
     * Other conditions are that the timeout is newer than the existing
     * timeout and all if conditions are true.
     * Head (with selector [] or '') -> Updates the complete structure.
     * KeyArray -> Updates the specific value.
     * Object -> Updates the specific value.
     * Array -> Key will be parsed to int if it is a number
     * it will update the specific value.
     * @param id The member of the family you want to update.
     * Number will be converted to a string.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value ($value or property value) by key ($key or property key) or
     * select all keys with {} (For better readability use the constant $all).
     * In the case of insertions, most times, the selector should end with
     * a new key instead of a query.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param value
     * @param options
     */
    async update(id : string | number, selector: DbSelector, value: any, options : IfOption & PotentialInsertOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.databoxFamilies.length;i++) {
            promises.push(this.databoxFamilies[i].update(id,selector,value,options));
        }
        await Promise.all(promises);
    }

    /**
     * Delete a value in the Databox.
     * Notice that this method will only update the Databox.
     * It will not automatically update the database,
     * so you have to do it before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Delete behavior:
     * Notice that in every case, the delete only happens when the key
     * on the client does exist.
     * Otherwise, the client will ignore it.
     * Other conditions are that the timeout is newer than the existing
     * timeout and all if conditions are true.
     * Head (with selector [] or '') -> Deletes the complete structure.
     * KeyArray -> Deletes the specific value.
     * Object -> Deletes the specific value.
     * Array -> Key will be parsed to int if it is a number it
     * will delete the specific value.
     * Otherwise, it will delete the last item.
     * @param id The member of the family you want to update.
     * Number will be converted to a string.
     * @param selector
     * The selector describes which key-value pairs should be
     * deleted updated or where a value should be inserted.
     * It can be a string array key path, but it also can contain
     * filter queries (they work with the forint library).
     * You can filter by value ($value or property value) by key ($key or property key) or
     * select all keys with {} (For better readability use the constant $all).
     * In the case of insertions, most times, the selector should end with
     * a new key instead of a query.
     * Notice that all numeric values in the selector will be converted to a
     * string because all keys need to be from type string.
     * If you provide a string instead of an array, the string will be
     * split by dots to create a string array.
     * @param options
     */
    async delete(id : string | number, selector: DbSelector, options : IfOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.databoxFamilies.length;i++) {
            promises.push(this.databoxFamilies[i].delete(id,selector,options));
        }
        await Promise.all(promises);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Sequence edit the Databox.
     * This method is ideal for doing multiple changes on a Databox
     * because it will pack them all together and send them all in ones.
     * Notice that this method will only update the Databox.
     * It will not automatically update the database,
     * so you have to do it before calling this method.
     * @param id The member of the family you want to edit.
     * Numbers will be converted to a string.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(id : string | number,timestamp ?: number): DbCudOperationSequence {
        return new DbCudOperationSequence(async (operations) => {
            const promises : Promise<void>[] = [];
            for(let i = 0; i < this.databoxFamilies.length;i++) {
                promises.push(this.databoxFamilies[i]._emitCudPackage(
                    DataboxUtils.buildPreCudPackage(...operations),
                    typeof id === "string" ? id : id.toString(),timestamp));
            }
            await Promise.all(promises);
        })
    }

    /**
     * The close function will close the Databox for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param id The member of the family you want to close.
     * Numbers will be converted to a string.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(id : string | number,code ?: number | string, data ?: any,forEveryWorker : boolean = true): void {
        for(let i = 0; i < this.databoxFamilies.length;i++) {
            this.databoxFamilies[i].close(id,code,data,forEveryWorker);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * The reload function will force all clients of the Databox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param id The member of the family you want to force to reload.
     * Numbers will be converted to a string.
     * @param forEveryWorker
     * @param code
     * @param data
     */
    doReload(id : string | number,forEveryWorker: boolean = false,code ?: number | string,data ?: any): void {
        for(let i = 0; i < this.databoxFamilies.length;i++) {
            this.databoxFamilies[i].doReload(id,forEveryWorker,code,data);
        }
    }

    /**
     * With this function, you can kick out a socket from a family member of the Databox.
     * This method is used internally.
     * @param id
     * @param socket
     * @param code
     * @param data
     */
    kickOut(id : string,socket: UpSocket,code ?: number | string,data ?: any): void {
        for(let i = 0; i < this.databoxFamilies.length;i++) {
            this.databoxFamilies[i].kickOut(id,socket,code,data);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Send a signal to all clients of a specific member.
     * The clients can listen to any signal.
     * You also can send additional data with the signal.
     * @param id
     * Numbers will be converted to a string.
     * @param signal
     * @param data
     * @param forEveryWorker
     */
    sendSignal(id : string | number,signal : string,data ?: any,forEveryWorker : boolean = true) {
        for(let i = 0; i < this.databoxFamilies.length;i++) {
            this.databoxFamilies[i].sendSignal(id,signal,data,forEveryWorker);
        }
    }
}