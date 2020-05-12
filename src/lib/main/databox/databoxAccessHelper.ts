/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import AccessUtils          from "../access/accessUtils";
import Bag                  from "../../api/Bag";
import {DataboxInfo}        from "./dbDefinitions";
import {DbAccessFunction}   from "../config/definitions/parts/databoxConfig";
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
     * @param databox
     */
    static createAccessChecker(accessValue: Notable<AccessConfigValue<DbAccessFunction>> | undefined, bag: Bag,databox: string): DbAccessCheckFunction
    {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<DbAccessCheckFunction,DbAccessFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (_a,socket,dbInfo) => {
                    return func(bag,socket,dbInfo);
                };
            },`Databox: ${databox}`);
        }
        //access is not defined
        return async () => {
            return false;
        };
    }
}