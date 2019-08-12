/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import DataBox              from "../../../api/dataBox/DataBox";
import UpSocket             from "../../sc/socket";
import DbCudActionSequence  from "../dbCudActionSequence";
import DataBoxUtils         from "../dataBoxUtils";
import {InfoOption, IfContainsOption, TimestampOption} from "../dbDefinitions";

export default class DataBoxContainer {

    private readonly dataBoxes : DataBox[];

    constructor(dataBoxes : DataBox[]) {
        this.dataBoxes = dataBoxes;
    }

    /**
     * Insert a new value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the databank,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * @param keyPath
     * @param value
     * @param options
     */
    async insert(keyPath: string[] | string, value: any,options : IfContainsOption & InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxes.length;i++) {
            promises.push(this.dataBoxes[i].insert(keyPath,value,options));
        }
        await Promise.all(promises);
    }

    /**
     * Update a value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the databank,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * @param keyPath
     * @param value
     * @param options
     */
    async update(keyPath: string[] | string, value: any,options : InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxes.length;i++) {
            promises.push(this.dataBoxes[i].update(keyPath,value,options));
        }
        await Promise.all(promises);
    }

    /**
     * Delete a value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the databank,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * @param keyPath
     * @param options
     */
    async delete(keyPath: string[] | string,options : InfoOption & TimestampOption = {}): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxes.length;i++) {
            promises.push(this.dataBoxes[i].delete(keyPath,options));
        }
        await Promise.all(promises);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Sequence edit the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-events.
     * This method is ideal for doing multiple changes on a DataBox
     * because it will pack them all together and send them all in ones.
     * It will not automatically update the databank,
     * so you have to do it in the before-events or before calling this method.
     * @param timestamp
     * With the timestamp option, you can change the sequence of data.
     * The client, for example, will only update data that is older as incoming data.
     * Use this option only if you know what you are doing.
     */
    seqEdit(timestamp ?: number): DbCudActionSequence {
        return new DbCudActionSequence(async (actions) => {
            const promises : Promise<void>[] = [];
            for(let i = 0; i < this.dataBoxes.length;i++) {
                promises.push(this.dataBoxes[i]._emitCudPackage(
                    DataBoxUtils.buildPreCudPackage(...actions),timestamp));
            }
            await Promise.all(promises);
        })
    }

    /**
     * The close function will close the DataBox for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(code ?: number | string, data ?: any,forEveryWorker : boolean = true): void {
        for(let i = 0; i < this.dataBoxes.length;i++) {
            this.dataBoxes[i].close(code,data,forEveryWorker);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * The reload function will force all clients of the DataBox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param forEveryWorker
     * @param code
     * @param data
     */
    doReload(forEveryWorker: boolean = false,code ?: number | string,data ?: any): void {
        for(let i = 0; i < this.dataBoxes.length;i++) {
            this.dataBoxes[i].doReload(forEveryWorker,code,data);
        }
    }

    /**
     * With this function, you can kick out a socket from the DataBox.
     * This method is used internally.
     * @param socket
     * @param code
     * @param data
     */
    kickOut(socket: UpSocket,code ?: number | string,data ?: any): void {
        for(let i = 0; i < this.dataBoxes.length;i++) {
            this.dataBoxes[i].kickOut(socket,code,data);
        }
    }
}