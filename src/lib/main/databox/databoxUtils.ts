/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {
    CudOperation,
    CudPackage,
    CudType,
    DBClientInputSessionTarget,
    DbClientOutputClosePackage,
    DbClientOutputEvent,
    DbClientOutputReloadPackage,
    DbClientOutputSignalPackage,
    DbProcessedSelector,
    DbSelector,
    DbSession,
    DbSessionData,
    DbToken,
    IfOptionValue,
    PreCudPackage
} from "./dbDefinitions";
import DataboxFamily, {DataboxFamilyClass} from "../../api/databox/DataboxFamily";
import DataboxFamilyContainer              from "./container/databoxFamilyContainer";
import Databox, {DataboxClass}             from "../../api/databox/Databox";
import DataboxContainer                    from "./container/databoxContainer";
import DataboxNotFound                     from "../error/databoxNotFound";
import {ClientErrorName}                   from "../constants/clientErrorName";
import {databoxInstanceSymbol}             from "./databoxPrepare";
const uniqid                             = require('uniqid');

export default class DataboxUtils {

    // noinspection JSMethodCanBeStatic
    /**
     * Creates a the PreCudPackage.
     */
     static buildPreCudPackage(...operations : CudOperation[]) : PreCudPackage {
        return {
            ci : uniqid(),
            o : operations
        };
     }

     static buildCudPackage(preCudPackage : PreCudPackage,timestamp ?: number) : CudPackage {
         return {
             ...preCudPackage,
             t : timestamp !== undefined ? timestamp : Date.now()
         };
     }

     /**
      * Generates the start cudId.
      */
     static generateStartCudId() : string {
         return 'S-' + uniqid();
     }

     static processSelector(selector : DbSelector) : DbProcessedSelector {
         if(Array.isArray(selector)) return selector.map((v) => typeof v === 'number' ? v.toString() : v);
         else if (typeof selector === 'string') return (selector === '' ? [] : selector.split('.'));
         return [typeof selector === 'number' ? selector.toString() : selector];
     }

     static buildInsert(selector : DbSelector, value : any, ifOption ?: IfOptionValue, potentialUpdate ?: boolean,
                        code ?: number | string, data ?: any) : CudOperation {
         return {
             t : CudType.insert,
             s : DataboxUtils.processSelector(selector),
             v : value,
             ...(ifOption !== undefined ? {i : Array.isArray(ifOption) ? ifOption : [ifOption]} : {}),
             ...(potentialUpdate !== undefined ? {p : potentialUpdate ? 1 : 0} : {}),
             ...(code !== undefined ? {c : code} : {}),
             ...(data !== undefined ? {d : data} : {})
         };
     }

    static buildUpdate(selector : DbSelector, value : any, ifOption ?: IfOptionValue, potentialInsert ?: boolean,
                       code ?: number | string, data ?: any) : CudOperation {
        return {
            t : CudType.update,
            s : DataboxUtils.processSelector(selector),
            v : value,
            ...(ifOption !== undefined ? {i : Array.isArray(ifOption) ? ifOption : [ifOption]} : {}),
            ...(potentialInsert !== undefined ? {p : potentialInsert ? 1 : 0} : {}),
            ...(code !== undefined ? {c : code} : {}),
            ...(data !== undefined ? {d : data} : {})
        };
    }

    static buildDelete(selector : DbSelector, ifOption ?: IfOptionValue,
                       code ?: number | string, data ?: any) : CudOperation {
        return {
            t : CudType.delete,
            s : DataboxUtils.processSelector(selector),
            ...(ifOption !== undefined ? {i : Array.isArray(ifOption) ? ifOption : [ifOption]} : {}),
            ...(code !== undefined ? {c : code} : {}),
            ...(data !== undefined ? {d : data} : {})
        };
    }

    static buildClientReloadPackage(code ?: number | string, data ?: any) : DbClientOutputReloadPackage {
        return {
            a : DbClientOutputEvent.reload,
            ...(code !== undefined ? {c : code} : {}),
            ...(data !== undefined ? {d : data} : {})
        };
    }

    static buildClientClosePackage(code ?: number | string, data ?: any) : DbClientOutputClosePackage {
        return {
            a : DbClientOutputEvent.close,
            ...(code !== undefined ? {c : code} : {}),
            ...(data !== undefined ? {d : data} : {})
        };
    }

    static buildClientSignalPackage(signal : string, data ?: any) : DbClientOutputSignalPackage {
        return {
            a : DbClientOutputEvent.signal,
            s : signal,
            ...(data !== undefined ? {d : data} : {})
        };
    }

    /**
     * This method loads the instance of the databox and returns it.
     * If the instance is not found, the method throws an error.
     * @param databox
     */
    static getDbInstance<T extends DataboxClass | DataboxFamilyClass>(databox : T) : T['prototype'] {
         const instance = databox[databoxInstanceSymbol];
         if(instance === undefined) {
             throw new DataboxNotFound(databox.name);
         }
         return instance;
    }

    /**
     * A method that will load the instances from Databox classes
     * and will return the correct container for it.
     * @param databoxes
     */
    static getDbContainer(databoxes : DataboxClass[] | DataboxFamilyClass[]) :  DataboxFamilyContainer | DataboxContainer {

        const databoxInstances : Databox[] = [];
        const databoxFamilyInstances : DataboxFamily[] = [];

        for(let i = 0; i < databoxes.length; i++){
            const instance = databoxes[i][databoxInstanceSymbol];
            if(instance !== undefined){
                if(instance instanceof Databox){
                    databoxInstances.push(instance);
                }
                else {
                    databoxFamilyInstances.push(instance);
                }
            }
            else {
                throw new DataboxNotFound(databoxes[i].name);
            }
        }

        if(databoxInstances.length>0){
            return new DataboxContainer(databoxInstances);
        }
        else {
            return new DataboxFamilyContainer(databoxFamilyInstances);
        }
    }

    /**
     * Creates a new Databox token.
     * @param rawInitData
     */
    static createDbToken(rawInitData : any) : DbToken {
        return {
            rawInitData: rawInitData,
            sessions : DataboxUtils.createDbSessionData()
        };
    }

    /**
     * Create db session data.
     */
    static createDbSessionData() : DbSessionData
    {
        return {
            main : {d:{},c:0},
            reload : {d:{},c:0}
        };
    }

    /**
     * This function is used to figure out the session that the client wants to use.
     * It can throw an error if the target is unknown.
     * @param dbSessionData
     * @param target
     */
    static getSession(dbSessionData : DbSessionData,target ?: DBClientInputSessionTarget) : DbSession
    {
        if(target === undefined){
            return dbSessionData.main;
        }
        switch (target) {
            case DBClientInputSessionTarget.mainSession:
                return dbSessionData.main;
            case DBClientInputSessionTarget.reloadSession:
                return dbSessionData.reload;
            default:
                const err : any = new Error(`Unknown session target.`);
                err.name = ClientErrorName.UNKNOWN_SESSION_TARGET;
                throw err;
        }
    }

    /**
     * Returns if the session target is the reload session.
     * @param target
     */
    static isReloadTarget(target ?: DBClientInputSessionTarget) : boolean {
        return target === DBClientInputSessionTarget.reloadSession;
    }

    /**
     * This function will copy the selected session in the other session.
     * @param dbSessionData
     * @param target
     */
    static copySession(dbSessionData : DbSessionData,target ?: DBClientInputSessionTarget) : void
    {
        const selectedSession = DataboxUtils.getSession(dbSessionData,target);
        if(dbSessionData.main !== selectedSession){
            dbSessionData.main = dbSessionData.reload;
        }
        else {
            dbSessionData.reload = dbSessionData.main;
        }
    }

    /**
     * This function will reset the selected session.
     * @param dbSessionData
     * @param target
     */
    static resetSession(dbSessionData : DbSessionData,target ?: DBClientInputSessionTarget) : void
    {
        const selectedSession = DataboxUtils.getSession(dbSessionData,target);
        if(dbSessionData.main === selectedSession){
            dbSessionData.main = {c:0,d:{}};
        }
        else {
            dbSessionData.reload = {c:0,d:{}};
        }
    }

    /**
     * Generates a unique channel input id.
     * @param inputChIds
     */
    static generateInputChId(inputChIds : Set<string>) : string {
        const id = uniqid.time();
        return inputChIds.has(id) ? DataboxUtils.generateInputChId(inputChIds) : id;
    }

    /**
     * Checker for checking the max socket input channel limit,
     * it will throw an error to deny access.
     * @param current
     * @param max
     */
    static maxInputChannelsCheck(current : number,max : number) : void {
        if(current >= max){
            const err : any = new Error('Maximum socket input channels reached.');
            err.name = ClientErrorName.MAX_INPUT_CHANNELS_REACHED;
            throw err;
        }
    }
}