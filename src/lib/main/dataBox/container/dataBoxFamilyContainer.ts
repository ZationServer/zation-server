/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket             from "../../sc/socket";
import DbCudActionSequence  from "../dbCudActionSequence";
import DataBoxFamily        from "../../../api/dataBox/DataBoxFamily";
import DataBoxUtils         from "../dataBoxUtils";
import {InfoOption, IfContainsOption, TimestampOption} from "../dbDefinitions";

export default class DataBoxFamilyContainer {

    private readonly dataBoxFamilies : DataBoxFamily[];

    constructor(dataBoxFamilies : DataBoxFamily[]) {
        this.dataBoxFamilies = dataBoxFamilies;
    }

    /**
     * Insert a new value in the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
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
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param value
     * @param options
     */
    async insert(id : string | number,keyPath: string[] | string, value: any,options : IfContainsOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            promises.push(this.dataBoxFamilies[i].insert(id,keyPath,value,options));
        }
        await Promise.all(promises);
    }

    /**
     * Update a value in the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Update behavior:
     * Base (with keyPath [] or '') -> Updates the complete structure.
     * KeyArray -> Updates the specific value (if the key does exist).
     * Object -> Updates the specific value (if the key does exist).
     * Array -> Key will be parsed to int if it is a number it will
     * update the specific value (if the index exist).
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param value
     * @param options
     */
    async update(id : string | number,keyPath: string[] | string, value: any,options : InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            promises.push(this.dataBoxFamilies[i].update(id,keyPath,value,options));
        }
        await Promise.all(promises);
    }

    /**
     * Delete a value in the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the database,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * Delete behavior:
     * Base (with keyPath [] or '') -> Deletes the complete structure.
     * KeyArray -> Deletes the specific value (if the key does exist).
     * Object -> Deletes the specific value (if the key does exist).
     * Array -> Key will be parsed to int if it is a number it will delete the
     * specific value (if the index does exist). Otherwise, it will delete the last item.
     * @param id The member of the family you want to update.
     * Numbers will be converted to a string.
     * @param keyPath
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * @param options
     */
    async delete(id : string | number,keyPath: string[] | string,options : InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            promises.push(this.dataBoxFamilies[i].delete(id,keyPath,options));
        }
        await Promise.all(promises);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Sequence edit the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-events.
     * This method is ideal for doing multiple changes on a DataBox
     * because it will pack them all together and send them all in ones.
     * It will not automatically update the database,
     * so you have to do it in the before-events or before calling this method.
     * @param id The member of the family you want to edit.
     * Numbers will be converted to a string.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(id : string | number,timestamp ?: number): DbCudActionSequence {
        return new DbCudActionSequence(async (actions) => {
            const promises : Promise<void>[] = [];
            for(let i = 0; i < this.dataBoxFamilies.length;i++) {
                promises.push(this.dataBoxFamilies[i]._emitCudPackage(
                    DataBoxUtils.buildPreCudPackage(...actions),
                    typeof id === "string" ? id : id.toString(),timestamp));
            }
            await Promise.all(promises);
        })
    }

    /**
     * The close function will close the DataBox for every client on every server.
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
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            this.dataBoxFamilies[i].close(id,code,data,forEveryWorker);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * The reload function will force all clients of the DataBox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param id The member of the family you want to force to reload.
     * Numbers will be converted to a string.
     * @param forEveryWorker
     * @param code
     * @param data
     */
    doReload(id : string | number,forEveryWorker: boolean = false,code ?: number | string,data ?: any): void {
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            this.dataBoxFamilies[i].doReload(id,forEveryWorker,code,data);
        }
    }

    /**
     * With this function, you can kick out a socket from a family member of the DataBox.
     * This method is used internally.
     * @param id
     * @param socket
     * @param code
     * @param data
     */
    kickOut(id : string,socket: UpSocket,code ?: number | string,data ?: any): void {
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            this.dataBoxFamilies[i].kickOut(id,socket,code,data);
        }
    }
}