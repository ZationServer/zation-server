/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import {DataBox}            from "../../../index";
import DataBoxFamily        from "../../api/dataBox/DataBoxFamily";
import AccessUtils          from "../access/accessUtils";
import {AuthAccessConfig}   from "../config/definitions/configComponents";
import Bag                  from "../../api/Bag";
import {DataBoxInfo}        from "./dbDefinitions";
import AuthAccessChecker    from "../auth/authAccessChecker";
import {DbAccessFunction}   from "../config/definitions/dataBoxConfig";
import ZSocket              from "../internalApi/zSocket";
import AuthEngine           from "../auth/authEngine";

export type DbAccessCheckFunction = (authEngine : AuthEngine, socket : ZSocket, dbInfo : DataBoxInfo) => Promise<boolean>

/**
 * Helper class for dataBox access.
 */
export default class DataBoxAccessHelper
{
    /**
     * Returns a Closures for checking the subscribe access to a channel.
     * @param accessConfig
     * @param bag
     */
    static createAccessChecker(accessConfig : AuthAccessConfig<DbAccessFunction>, bag : Bag): DbAccessCheckFunction
    {
        const info = AuthAccessChecker.processAuthAccessInfo(accessConfig);

        if(info){
            const {accessValue,accessProcess} = info;
            return AccessUtils.createAccessChecker<DbAccessCheckFunction,DbAccessFunction>
            (accessValue,accessProcess,(func) => {
                return async (_a,socket,dbInfo) => {
                    return accessProcess((await func(bag,socket,dbInfo)));
                };
            });
        }
        //access is not defined
        return async () => {
            return false;
        };
    }

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
                const dataBox = dataBoxes[i];
                const name = dataBox.getName();

                if(dataBox instanceof DataBoxFamily){
                    const memberIds = dataBox.getSocketRegIds(socket);
                    for(let i = 0; i < memberIds.length; i++){
                        if(!(await dataBox._accessCheck(socket,{id : memberIds[i],name}))) {
                            dataBox.kickOut(memberIds[i],socket);
                        }
                    }
                }
                else {
                    if(!(await dataBox._accessCheck(socket,{name,id : undefined}))) {
                        dataBox.kickOut(socket);
                    }
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