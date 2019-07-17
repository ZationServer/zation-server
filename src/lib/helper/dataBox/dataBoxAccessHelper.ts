/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import {DataBox}            from "../../../index";
import DataBoxFamily        from "../../api/dataBox/DataBoxFamily";

/**
 * Helper class for dataBox access.
 */
export default class DataBoxAccessHelper
{
    /**
     * Checks the socket DataBox access.
     * @param socket
     */
    static async checkSocketDataBoxAccess(socket : UpSocket) : Promise<void>
    {
        const dataBoxes = socket.dataBoxes;
        const promises : Promise<void>[] = [];
        for(let i = 0;i < dataBoxes.length; i++) {
            promises.push((async () => {
               if(!dataBoxes[i]._tokenStateAccessCheck(socket)){
                   dataBoxes[i].kickOut(socket);
               }
            })());
        }
        await Promise.all(promises);
    }

    /**
     * Adds the DataBox to the socket.
     * @param db
     * @param socket
     */
    static addDb(db : DataBox | DataBoxFamily,socket : UpSocket) {
        socket.dataBoxes.push(db);
    }

    /**
     * Removes the DataBox to the socket.
     * @param db
     * @param socket
     */
    static rmDb(db : DataBox | DataBoxFamily,socket : UpSocket){
        const index = socket.dataBoxes.indexOf(db);
        if (index > -1) {
            socket.dataBoxes.splice(index, 1);
        }
    }
}