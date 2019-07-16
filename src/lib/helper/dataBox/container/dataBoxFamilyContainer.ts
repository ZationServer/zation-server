/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket             from "../../sc/socket";
import DbCudActionSequence  from "../dbCudActionSequence";
import DataBoxFamily        from "../../../api/dataBox/DataBoxFamily";
import DataBoxUtils         from "../dataBoxUtils";

export default class DataBoxFamilyContainer {

    private readonly dataBoxFamilies : DataBoxFamily[];

    constructor(dataBoxFamilies : DataBoxFamily[]) {
        this.dataBoxFamilies = dataBoxFamilies;
    }

    /**
     * Insert a new value in the DataBox.
     * The keyPath can be a string array or a
     * string where you can separate the keys with a dot.
     * Notice that this method will only update the DataBox and invoke the before-event.
     * It will not automatically update the databank,
     * so you have to do it in the before-event or before calling this method.
     * If you want to do more changes, you should look at the seqEdit method.
     * @param id The member of the family you want to update.
     * @param keyPath
     * @param value
     * @param timestamp
     * This parameter is optional and only for advanced use cases.
     * The timeout is used to keep the sequence of data.
     * The client, for example, will only update data that is older as incoming data
     */
    async insert(id : string,keyPath: string[] | string, value: any,timestamp ?: number): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            promises.push(this.dataBoxFamilies[i].insert(id,keyPath,value,timestamp));
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
     * @param id The member of the family you want to update.
     * @param keyPath
     * @param value
     * @param timestamp
     * This parameter is optional and only for advanced use cases.
     * The timeout is used to keep the sequence of data.
     * The client, for example, will only update data that is older as incoming data
     */
    async update(id : string,keyPath: string[] | string, value: any,timestamp ?: number): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            promises.push(this.dataBoxFamilies[i].update(id,keyPath,value,timestamp));
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
     * @param id The member of the family you want to update.
     * @param keyPath
     * @param timestamp
     * This parameter is optional and only for advanced use cases.
     * The timeout is used to keep the sequence of data.
     * The client, for example, will only update data that is older as incoming data
     */
    async delete(id : string,keyPath: string[] | string,timestamp ?: number): Promise<void> {
        const promises : Promise<void>[] = [];
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            promises.push(this.dataBoxFamilies[i].delete(id,keyPath,timestamp));
        }
        await Promise.all(promises);
    }

    /**
     * Sequence edit the DataBox.
     * Notice that this method will only update the DataBox and invoke the before-events.
     * This method is ideal for doing multiple changes on a DataBox
     * because it will pack them all together and send them all in ones.
     * It will not automatically update the databank,
     * so you have to do it in the before-events or before calling this method.
     * @param id The member of the family you want to edit.
     * @param timestamp
     * This parameter is optional and only for advanced use cases.
     * The timeout is used to keep the sequence of data.
     * The client, for example, will only update data that is older as incoming data
     */
    seqEdit(id : string,timestamp ?: number): DbCudActionSequence {
        return new DbCudActionSequence(async (actions) => {
            const promises : Promise<void>[] = [];
            for(let i = 0; i < this.dataBoxFamilies.length;i++) {
                promises.push(this.dataBoxFamilies[i]._emitCudPackage(
                    DataBoxUtils.buildPreCudPackage(...actions),id,timestamp));
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
     * @param code
     * @param data
     */
    close(id : string,code: number, data: any): void {
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            this.dataBoxFamilies[i].close(id,code,data);
        }
    }

    /**
     * The reload function will force all clients of the DataBox to reload the data.
     * This method is used internally if it was detected that a worker had
     * missed a cud (create, update, or delete) operation.
     * @param id The member of the family you want to force to reload.
     * @param forEveryServer
     */
    doReload(id : string,forEveryServer: boolean): void {
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            this.dataBoxFamilies[i].doReload(id,forEveryServer);
        }
    }

    /**
     * With this function, you can kick out a socket from the DataBox.
     * This method is used internally.
     * @param socket
     */
    kickOut(socket: UpSocket): void {
        for(let i = 0; i < this.dataBoxFamilies.length;i++) {
            this.dataBoxFamilies[i].kickOut(socket);
        }
    }
}