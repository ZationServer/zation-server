/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Databox                 from "../../../api/databox/Databox";
import UpSocket                from "../../sc/socket";
import DbCudOperationSequence  from "../dbCudOperationSequence";
import DataboxUtils            from "../databoxUtils";
import {InfoOption, IfContainsOption, TimestampOption, DbCudSelector} from "../dbDefinitions";

export default class DataboxContainer {

    private readonly databoxes : Databox[];

    constructor(databoxes : Databox[]) {
        this.databoxes = databoxes;
    }

    /**
     * Insert a new value in the Databox.
     * Notice that this method will only update the Databox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
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
     * you need to notice that it will be split into a path by dots.
     * All numeric values will be converted to a string because the key can only be a string.
     * @param value
     * @param options
     */
    async insert(selector: DbCudSelector,value: any,options : IfContainsOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.databoxes.length;i++) {
            promises.push(this.databoxes[i].insert(selector,value,options));
        }
        await Promise.all(promises);
    }

    /**
     * Update a value in the Databox.
     * Notice that this method will only update the Databox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
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
     * you need to notice that it will be split into a path by dots.
     * All numeric values will be converted to a string because the key can only be a string.
     * @param value
     * @param options
     */
    async update(selector: DbCudSelector,value: any,options : InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.databoxes.length;i++) {
            promises.push(this.databoxes[i].update(selector,value,options));
        }
        await Promise.all(promises);
    }

    /**
     * Delete a value in the Databox.
     * Notice that this method will only update the Databox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
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
     * you need to notice that it will be split into a path by dots.
     * All numeric values will be converted to a string because the key can only be a string.
     * @param options
     */
    async delete(selector: DbCudSelector,options : InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.databoxes.length;i++) {
            promises.push(this.databoxes[i].delete(selector,options));
        }
        await Promise.all(promises);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Sequence edit the Databox.
     * Notice that this method will only update the Databox and invoke the before-events.
     * This method is ideal for doing multiple changes on a Databox
     * because it will pack them all together and send them all in ones.
     * It will not automatically update the database,
     * so you have to do it in the before-events or before calling this method.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(timestamp ?: number): DbCudOperationSequence {
        return new DbCudOperationSequence(async (operations) => {
            const promises : Promise<void>[] = [];
            for(let i = 0; i < this.databoxes.length;i++) {
                promises.push(this.databoxes[i]._emitCudPackage(
                    DataboxUtils.buildPreCudPackage(...operations),timestamp));
            }
            await Promise.all(promises);
        })
    }

    /**
     * The close function will close the Databox for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(code ?: number | string, data ?: any,forEveryWorker : boolean = true): void {
        for(let i = 0; i < this.databoxes.length;i++) {
            this.databoxes[i].close(code,data,forEveryWorker);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * The reload function will force all clients of the Databox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param forEveryWorker
     * @param code
     * @param data
     */
    doReload(forEveryWorker: boolean = false,code ?: number | string,data ?: any): void {
        for(let i = 0; i < this.databoxes.length;i++) {
            this.databoxes[i].doReload(forEveryWorker,code,data);
        }
    }

    /**
     * With this function, you can kick out a socket from the Databox.
     * This method is used internally.
     * @param socket
     * @param code
     * @param data
     */
    kickOut(socket: UpSocket,code ?: number | string,data ?: any): void {
        for(let i = 0; i < this.databoxes.length;i++) {
            this.databoxes[i].kickOut(socket,code,data);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Send a signal to all clients.
     * The clients can listen to any signal.
     * You also can send additional data with the signal.
     * @param signal
     * @param data
     * @param forEveryWorker
     */
    sendSignal(signal : string,data ?: any,forEveryWorker : boolean = true) {
        for(let i = 0; i < this.databoxes.length;i++) {
            this.databoxes[i].sendSignal(signal,data,forEveryWorker);
        }
    }
}