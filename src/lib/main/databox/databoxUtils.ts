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
    DbSessions,
    DbToken,
    IfOptionValue,
    PreCudPackage
} from "./dbDefinitions";
import DataboxFamily, {DataboxFamilyClass} from "../../api/databox/DataboxFamily";
import DataboxFamilyContainer              from "../../api/databox/container/databoxFamilyContainer";
import Databox, {DataboxClass}             from "../../api/databox/Databox";
import DataboxContainer                    from "../../api/databox/container/databoxContainer";
import {ClientErrorName}                   from "../definitions/clientErrorName";
import ComponentUtils                      from '../component/componentUtils';
import DynamicSingleton                    from '../utils/dynamicSingleton';
const uniqid                             = require('uniqid');

export default class DataboxUtils {

    // noinspection JSMethodCanBeStatic
    /**
     * Creates a the PreCudPackage.
     */
     static buildPreCudPackage(...operations: CudOperation[]): PreCudPackage {
        return {
            ci: uniqid(),
            o: operations
        };
     }

     static buildCudPackage(preCudPackage: PreCudPackage,timestamp?: number): CudPackage {
         return {
             ...preCudPackage,
             t: timestamp !== undefined ? timestamp: Date.now()
         };
     }

     /**
      * Generates the start cudId.
      */
     static generateStartCudId(): string {
         return 'S-' + uniqid();
     }

     static processSelector(selector: DbSelector): DbProcessedSelector {
         if(Array.isArray(selector)) return selector.map((v) => typeof v === 'number' ? v.toString(): v);
         else if (typeof selector === 'string') return (selector === '' ? []: selector.split('.'));
         return [typeof selector === 'number' ? selector.toString(): selector];
     }

     static buildInsert(selector: DbSelector, value: any, ifOption?: IfOptionValue, potentialUpdate?: boolean,
                        code?: number | string, data?: any): CudOperation {
         return {
             t: CudType.insert,
             s: DataboxUtils.processSelector(selector),
             v: value,
             i: ifOption !== undefined ? (Array.isArray(ifOption) ? ifOption: [ifOption]) : undefined,
             p: potentialUpdate !== undefined ? (potentialUpdate ? 1 : 0) : undefined,
             c: code,
             d: data
         };
     }

    static buildUpdate(selector: DbSelector, value: any, ifOption?: IfOptionValue, potentialInsert?: boolean,
                       code?: number | string, data?: any): CudOperation {
        return {
            t: CudType.update,
            s: DataboxUtils.processSelector(selector),
            v: value,
            i: ifOption !== undefined ? (Array.isArray(ifOption) ? ifOption: [ifOption]) : undefined,
            p: potentialInsert !== undefined ? (potentialInsert ? 1 : 0) : undefined,
            c: code,
            d: data
        };
    }

    static buildDelete(selector: DbSelector, ifOption?: IfOptionValue,
                       code?: number | string, data?: any): CudOperation {
        return {
            t: CudType.delete,
            s: DataboxUtils.processSelector(selector),
            i: ifOption !== undefined ? (Array.isArray(ifOption) ? ifOption: [ifOption]) : undefined,
            c: code,
            d: data
        };
    }

    static buildClientReloadPackage(code?: number | string, data?: any): DbClientOutputReloadPackage {
        return {
            a: DbClientOutputEvent.reload,
            c: code,
            d: data
        };
    }

    static buildClientClosePackage(code?: number | string, data?: any): DbClientOutputClosePackage {
        return {
            a: DbClientOutputEvent.close,
            c: code,
            d: data
        };
    }

    static buildClientSignalPackage(signal: string, data?: any): DbClientOutputSignalPackage {
        return {
            a: DbClientOutputEvent.signal,
            s: signal,
            d: data
        };
    }

    /**
     * A method that will load the instances from Databox classes
     * and will return the correct container for it.
     * @param databoxes
     */
    static getDbContainer(databoxes: DataboxClass[] | DataboxFamilyClass[]): DataboxContainer | DataboxFamilyContainer {

        const databoxInstances: Databox[] = [];
        const databoxFamilyInstances: DataboxFamily[] = [];

        for(let i = 0; i < databoxes.length; i++){
            const instance = DynamicSingleton.getInstanceSafe(databoxes[i] as any);
            if(ComponentUtils.isFamily(instance)){
                databoxFamilyInstances.push(instance as DataboxFamily);
            }
            else {
                databoxInstances.push(instance as Databox);
            }
        }

        return databoxInstances.length > 0 ? (new DataboxContainer(databoxInstances))
            : (new DataboxFamilyContainer(databoxFamilyInstances));
    }

    /**
     * Creates a new Databox token.
     * @param rawOptions
     */
    static createDbToken(rawOptions: any): DbToken {
        return {
            rawOptions: rawOptions,
            sessions: DataboxUtils.createDbSessionData()
        };
    }

    /**
     * Create db session data.
     */
    static createDbSessionData(): DbSessions
    {
        return {
            main: {d:{},c:0},
            reload: {d:{},c:0}
        };
    }

    /**
     * This function is used to figure out the session that the client wants to use.
     * It can throw an error if the target is unknown.
     * @param dbSessionData
     * @param target
     */
    static getSession(dbSessionData: DbSessions, target?: DBClientInputSessionTarget): DbSession
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
                const err: any = new Error(`Unknown session target.`);
                err.name = ClientErrorName.UnknownSessionTarget;
                throw err;
        }
    }

    /**
     * Returns if the session target is the reload session.
     * @param target
     */
    static isReloadTarget(target?: DBClientInputSessionTarget): boolean {
        return target === DBClientInputSessionTarget.reloadSession;
    }

    /**
     * This function will copy the selected session in the other session.
     * @param dbSessionData
     * @param target
     */
    static copySession(dbSessionData: DbSessions, target?: DBClientInputSessionTarget): void
    {
        const selectedSession = DataboxUtils.getSession(dbSessionData,target);
        if(dbSessionData.main !== selectedSession){
            dbSessionData.main = {...dbSessionData.reload};
        }
        else {
            dbSessionData.reload = {...dbSessionData.main};
        }
    }

    /**
     * This function will reset the selected session.
     * @param dbSessionData
     * @param target
     */
    static resetSession(dbSessionData: DbSessions, target?: DBClientInputSessionTarget): void
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
    static generateInputChId(inputChIds: Set<string>): string {
        const id = uniqid.time();
        return inputChIds.has(id) ? DataboxUtils.generateInputChId(inputChIds): id;
    }

    /**
     * Checker for checking the max input channel limit,
     * it will throw an error to deny access.
     * @param current
     * @param max
     */
    static maxInputChannelsCheck(current: number,max: number): void {
        if(current >= max){
            const err: any = new Error('Maximum input channels reached.');
            err.name = ClientErrorName.MaxInputChannelsReached;
            throw err;
        }
    }

    /**
     * Checker for checking the max member limit,
     * it will throw an error to deny access.
     * @param current
     * @param max
     */
    static maxMembersCheck(current: number,max: number): void {
        if(current >= max){
            const err: any = new Error('Maximum members reached.');
            err.name = ClientErrorName.MaxMembersReached;
            throw err;
        }
    }
}