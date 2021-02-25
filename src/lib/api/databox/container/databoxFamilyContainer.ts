/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import DbCudOperationSequence  from "../../../main/databox/dbCudOperationSequence";
import DataboxFamily           from "../DataboxFamily";
import Socket                  from '../../Socket';
import DataboxUtils            from "../../../main/databox/databoxUtils";
import {
    InfoOption,
    IfOption,
    TimestampOption,
    DbSelector,
    PotentialUpdateOption,
    PotentialInsertOption,
} from '../../../main/databox/dbDefinitions';

export default class DataboxFamilyContainer<M = string> {

    private readonly _databoxes: DataboxFamily<M>[];
    private readonly _count: number;

    constructor(databoxes: DataboxFamily<M>[]) {
        this._databoxes = databoxes;
        this._count = databoxes.length;
    }

    get databoxes(): DataboxFamily<M>[] {
        return [...this._databoxes];
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
     * @param member The member of the family you want to update.
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
    async insert(member: M, selector: DbSelector, value: any, options: IfOption & PotentialUpdateOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this._count;i++) {
            promises.push(this._databoxes[i].insert(member,selector,value,options));
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
     * @param member The member of the family you want to update.
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
    async update(member: M, selector: DbSelector, value: any, options: IfOption & PotentialInsertOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this._count;i++) {
            promises.push(this._databoxes[i].update(member,selector,value,options));
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
     * @param member The member of the family you want to update.
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
    async delete(member: M, selector: DbSelector, options: IfOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this._count;i++) {
            promises.push(this._databoxes[i].delete(member,selector,options));
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
     * @param member The member of the family you want to edit.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(member: M,timestamp?: number): DbCudOperationSequence {
        return new DbCudOperationSequence(async (operations) => {
            const promises: Promise<void>[] = [];
            for(let i = 0; i < this._count;i++) {
                promises.push(this._databoxes[i]._emitCudPackage(
                    DataboxUtils.buildPreCudPackage(...operations), member, timestamp));
            }
            await Promise.all(promises);
        })
    }

    /**
     * The close function will close a Databox member for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param member The member of the family you want to close.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(member: M,code?: number | string, data?: any,forEveryWorker: boolean = true): void {
        for(let i = 0; i < this._count;i++) {
            this._databoxes[i].close(member,code,data,forEveryWorker);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * The reload function will force all connected
     * clients of the Databox member to reload the data.
     * @param member
     * @param code
     * @param data
     * @param forEveryWorker
     */
    doReload(member: M, code?: number | string, data?: any, forEveryWorker: boolean = true): void {
        for(let i = 0; i < this._count;i++) {
            this._databoxes[i].doReload(member,code,data,forEveryWorker);
        }
    }

    /**
     * With this function, you can kick out a socket from a family member of the Databox.
     * This method is used internally.
     * @param member
     * @param socket
     * @param code
     * @param data
     */
    kickOut(member: M, socket: Socket, code?: number | string, data?: any): void {
        for(let i = 0; i < this._count;i++) {
            this._databoxes[i].kickOut(member,socket,code,data);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * With this function, you can do a recheck of all sockets on a specific member.
     * It can be useful when the access rights to member have changed,
     * and you want to kick out all sockets that not have access anymore.
     * Notice that the promise is resolved when the access was checked
     * on the current worker and request sent to other workers.
     * @param member
     * @param forEveryWorker
     */
    async recheckMemberAccess(member: M, forEveryWorker: boolean = true): Promise<void> {
        const promises: Promise<void>[] = [];
        for(let i = 0; i < this._count;i++) {
            promises.push(this._databoxes[i].recheckMemberAccess(member,forEveryWorker));
        }
        await Promise.all(promises);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Transmit a signal to all client Databoxes that
     * are connected with a specific member of this Databox.
     * The clients can listen to any received signal.
     * You also can send additional data with the signal.
     * @param member
     * @param signal
     * @param data
     * @param forEveryWorker
     */
    transmitSignal(member: M, signal: string, data?: any, forEveryWorker: boolean = true) {
        for(let i = 0; i < this._count;i++) {
            this._databoxes[i].transmitSignal(member,signal,data,forEveryWorker);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method returns an array with all
     * members where the socket is registered.
     * @param socket
     */
    getSocketRegMembers(socket: Socket): M[] {
        const members: M[] = [];
        for(let i = 0; i < this._count;i++) {
            members.push(...this._databoxes[i].getSocketRegMembers(socket))
        }
        return members;
    }
}