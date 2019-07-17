/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {
    CudAction,
    CudPackage,
    CudType, DbClientClosePackage,
    DbClientReceiverEvent,
    DbClientReloadPackage,
    DBClientSenderSessionTarget,
    DbSession,
    DbSessionData,
    PreCudPackage
} from "./dbDefinitions";
import DataBoxFamily, {DataBoxFamilyClass} from "../../api/dataBox/DataBoxFamily";
import DataBoxFamilyContainer              from "./container/dataBoxFamilyContainer";
import DataBox, {DataBoxClass}             from "../../api/dataBox/DataBox";
import DataBoxContainer                    from "./container/dataBoxContainer";
import DataBoxNotFound                     from "../error/dataBoxNotFound";
import {ErrorName}                         from "../constants/errorName";
const uniqid                             = require('uniqid');

export default class DataBoxUtils {

    // noinspection JSMethodCanBeStatic
    /**
     * Creates a the PreCudPackage.
     */
     static buildPreCudPackage(...actions : CudAction[]) : PreCudPackage {
        return {
            ci : uniqid(),
            a : actions
        };
     }

     static buildCudPackage(preCudPackage : PreCudPackage,timestamp ?: number) : CudPackage {
         return {
             ...preCudPackage,
             t : timestamp !== undefined ? timestamp : Date.now()
         };
     }

     static handleKeyPath(keyPath : string | string[]) : string[] {
         return typeof keyPath === 'string' ?
             (keyPath === '' ? [] : keyPath.split('.')) : keyPath;
     }

     static buildInsert(keyPath : string[] | string, value : any, ifContains ?: string, code ?: number | string, data ?: any) : CudAction {
         return {
             t : CudType.insert,
             k : DataBoxUtils.handleKeyPath(keyPath),
             v : value,
             ...(ifContains !== undefined ? {i : ifContains} : {}),
             ...(code !== undefined ? {c : code} : {}),
             ...(data !== undefined ? {d : data} : {})
         };
     }

    static buildUpdate(keyPath : string[] | string, value : any,code ?: number | string, data ?: any) : CudAction {
        return {
            t : CudType.update,
            k : DataBoxUtils.handleKeyPath(keyPath),
            v : value,
            ...(code !== undefined ? {c : code} : {}),
            ...(data !== undefined ? {d : data} : {})
        };
    }

    static buildDelete(keyPath : string[] | string,code ?: number | string, data ?: any) : CudAction {
        return {
            t : CudType.delete,
            k : DataBoxUtils.handleKeyPath(keyPath),
            ...(code !== undefined ? {c : code} : {}),
            ...(data !== undefined ? {d : data} : {})
        };
    }

    static buildClientReloadPackage(code ?: number | string, data ?: any) : DbClientReloadPackage {
        return {
            a : DbClientReceiverEvent.reload,
            ...(code !== undefined ? {c : code} : {}),
            ...(data !== undefined ? {d : data} : {})
        };
    }

    static buildClientClosePackage(code ?: number | string, data ?: any) : DbClientClosePackage {
        return {
            a : DbClientReceiverEvent.close,
            ...(code !== undefined ? {c : code} : {}),
            ...(data !== undefined ? {d : data} : {})
        };
    }

    /**
     * A method that will load the instances from DataBox classes
     * and will return the correct container for it.
     * @param dataBoxes
     */
    static getDbContainer(dataBoxes : DataBoxClass[] | DataBoxFamilyClass[]) :  DataBoxFamilyContainer | DataBoxContainer {

        const dataBoxInstances : DataBox[] = [];
        const dataBoxFamilyInstances : DataBoxFamily[] = [];

        for(let i = 0; i < dataBoxes.length; i++){
            const instance = dataBoxes[i].___instance___;
            if(instance !== undefined){
                if(instance instanceof DataBox){
                    dataBoxInstances.push(instance);
                }
                else {
                    dataBoxFamilyInstances.push(instance);
                }
            }
            else {
                throw new DataBoxNotFound(dataBoxes[i].name);
            }
        }

        if(dataBoxInstances.length>0){
            return new DataBoxContainer(dataBoxInstances);
        }
        else {
            return new DataBoxFamilyContainer(dataBoxFamilyInstances);
        }
    }

    /**
     * Create db session data.
     */
    static createDbSessionData() : DbSessionData
    {
        return {
            main : {d:{},c:0},
            restore : {d:{},c:0}
        };
    }

    /**
     * This function is used to figure out the session that the client wants to use.
     * It can throw an error if the target is unknown.
     * @param dbSessionData
     * @param target
     */
    static getSession(dbSessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : DbSession
    {
        if(target === undefined){
            return dbSessionData.main;
        }
        switch (target) {
            case DBClientSenderSessionTarget.mainSession:
                return dbSessionData.main;
            case DBClientSenderSessionTarget.restoreSession:
                return dbSessionData.restore;
            default:
                const err : any = new Error(`Unknown session target.`);
                err.name = ErrorName.UNKNOWN_SESSION_TARGET;
                throw err;
        }
    }

    /**
     * This function will copy the selected session in the other session.
     * @param dbSessionData
     * @param target
     */
    static copySession(dbSessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : void
    {
        const selectedSession = DataBoxUtils.getSession(dbSessionData,target);
        if(dbSessionData.main !== selectedSession){
            dbSessionData.main = dbSessionData.restore;
        }
        else {
            dbSessionData.restore = dbSessionData.main;
        }
    }

    /**
     * This function will reset the selected session.
     * @param dbSessionData
     * @param target
     */
    static resetSession(dbSessionData : DbSessionData,target ?: DBClientSenderSessionTarget) : void
    {
        const selectedSession = DataBoxUtils.getSession(dbSessionData,target);
        if(dbSessionData.main === selectedSession){
            dbSessionData.main = {c:0,d:{}};
        }
        else {
            dbSessionData.restore = {c:0,d:{}};
        }
    }
}