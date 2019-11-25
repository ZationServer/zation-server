/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import AuthEngine                                from "../auth/authEngine";
import {ZationAccess}                            from "../constants/internal";
import {AccessConfigValue, isTokenCheckFunction} from "./accessOptions";

export type AccessProcess = (boolean) => boolean;

type AccessFunctionCallCreate<T extends MinAccessChecker,F> = (func : Function) => T;
type MinAccessChecker = (authEngine : AuthEngine,...otherArgs : any[]) => Promise<boolean>;

export default class AccessUtils
{
    /**
     * Creates a closure for checking the access.
     * @param value
     * @param accessProcess
     * @param accessFunctionCallCreate
     * @param useArrayOrConditions
     */
    static createAccessChecker<T extends MinAccessChecker,F extends (...args : any[]) => any>
    (
        value : AccessConfigValue<F> | undefined,
        accessProcess : AccessProcess,
        accessFunctionCallCreate : AccessFunctionCallCreate<T,F>,
        useArrayOrConditions : boolean = true
        ) : MinAccessChecker
    {
        if(typeof value === 'boolean') {
            return async () => {return accessProcess((value))};
        }
        else if(typeof value === 'string') {
            switch (value) {
                case ZationAccess.ALL :
                    return async () => {return accessProcess(true)};
                case ZationAccess.ALL_AUTH :
                    return async (a) => {return accessProcess(a.isAuth())};
                case ZationAccess.ALL_NOT_AUTH :
                    return async (a) => {return accessProcess(a.isDefault())};
                default :
                    return async (a) => {return accessProcess(a.getUserGroup() === value)};
            }
        }
        else if(Array.isArray(value)) {
            const preparedChecks : MinAccessChecker[] = [];
            const preparedChecksLength = value.length;
            for(let i = 0; i < value.length; i++){
                preparedChecks[i] = AccessUtils.createAccessChecker(value[i],accessProcess,accessFunctionCallCreate,false);
            }
            if(useArrayOrConditions){
                //OrConnection
                return async (a) => {
                    for(let i = 0; i < preparedChecksLength;i++) {
                       if(preparedChecks[i](a)){
                           return accessProcess(true);
                       }
                    }
                    return accessProcess(false);
                }
            }
            else {
                //AndConnection
                return async (a) => {
                    for(let i = 0; i < preparedChecksLength;i++) {
                        if(!preparedChecks[i](a)){
                            return accessProcess(false);
                        }
                    }
                    return accessProcess(true);
                }
            }
        }
        else if(typeof value === 'function') {
            if(isTokenCheckFunction(value)){
                return async (a) => {return accessProcess(value(a.getSHBridge().getToken()))};
            }
            else {
                return accessFunctionCallCreate(value);
            }
        }
        else if(typeof value === 'object') {
            if(value.strictTypeCheck){
                return async (a) => {return accessProcess(a.getUserId() === value.id)};
            }
            else {
                return async (a) => {return accessProcess(a.getUserId() == value.id)};
            }
        }
        else {
            return async () => {return false;}
        }
    }
}
