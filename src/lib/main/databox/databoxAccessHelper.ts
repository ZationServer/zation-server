/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import {Databox}            from "../../../index";
import DataboxFamily        from "../../api/databox/DataboxFamily";
import AccessUtils          from "../access/accessUtils";
import Bag                  from "../../api/Bag";
import {DataboxInfo}        from "./dbDefinitions";
import {DbAccessFunction}   from "../config/definitions/databoxConfig";
import ZSocket              from "../internalApi/zSocket";
import AuthEngine           from "../auth/authEngine";
import {AccessConfigValue}  from '../access/accessOptions';
import {getNotableValue, isNotableNot, Notable} from '../../api/Notable';

export type DbAccessCheckFunction = (authEngine: AuthEngine, socket: ZSocket, dbInfo: DataboxInfo) => Promise<boolean>

/**
 * Helper class for databox access.
 */
export default class DataboxAccessHelper
{
    /**
     * Returns a closure for checking the access to the databox.
     * @param accessValue
     * @param bag
     */
    static createAccessChecker(accessValue: Notable<AccessConfigValue<DbAccessFunction>> | undefined, bag: Bag): DbAccessCheckFunction
    {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<DbAccessCheckFunction,DbAccessFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (_a,socket,dbInfo) => {
                    return func(bag,socket,dbInfo);
                };
            });
        }
        //access is not defined
        return async () => {
            return false;
        };
    }

    /**
     * Checks the socket Databox access.
     * @param socket
     */
    static async checkSocketDataboxAccess(socket: UpSocket): Promise<void>
    {
        const databoxes = socket.databoxes;
        const promises: Promise<void>[] = [];
        for(let i = 0;i < databoxes.length; i++) {
            promises.push((async () => {
                const databox = databoxes[i];
                const name = databox.getName();

                if(databox instanceof DataboxFamily){
                    const memberIds = databox.getSocketRegIds(socket);
                    for(let i = 0; i < memberIds.length; i++){
                        if(!(await databox._accessCheck(socket,{id: memberIds[i],name}))) {
                            databox.kickOut(memberIds[i],socket);
                        }
                    }
                }
                else {
                    if(!(await databox._accessCheck(socket,{name,id: undefined}))) {
                        databox.kickOut(socket);
                    }
                }
            })());
        }
        await Promise.all(promises);
    }

    /**
     * Adds the Databox to the socket.
     * @param db
     * @param socket
     */
    static addDb(db: Databox | DataboxFamily, socket: UpSocket) {
        socket.databoxes.push(db);
    }

    /**
     * Removes the Databox to the socket.
     * @param db
     * @param socket
     */
    static rmDb(db: Databox | DataboxFamily, socket: UpSocket){
        const index = socket.databoxes.indexOf(db);
        if (index > -1) {
            socket.databoxes.splice(index, 1);
        }
    }
}