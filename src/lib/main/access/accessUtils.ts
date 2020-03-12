/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import AuthEngine                                from "../auth/authEngine";
import {ZationAccess}                            from "../constants/internal";
import {AccessConfigValue, isTokenCheckFunction} from "./accessOptions";

type AccessFunctionCallCreate<T extends MinAccessChecker,F> = (func: Function) => T;
type MinAccessChecker = (authEngine: AuthEngine,...otherArgs: any[]) => Promise<boolean>;

export default class AccessUtils
{
    /**
     * Creates a closure for checking the access.
     * @param value
     * @param invertResult
     * @param accessFunctionCallCreate
     * @param useArrayOrConditions
     */
    static createAccessChecker<T extends MinAccessChecker,F extends (...args: any[]) => any>
    (
        value: AccessConfigValue<F> | undefined,
        invertResult: boolean = false,
        accessFunctionCallCreate: AccessFunctionCallCreate<T,F>,
        useArrayOrConditions: boolean = true
        ): MinAccessChecker
    {
        if(!invertResult){
            return AccessUtils.createAccessCheckerCore(value,accessFunctionCallCreate,true);
        }
        else {
            const checker = AccessUtils.createAccessCheckerCore(value,accessFunctionCallCreate,true);
            return async (...args) => !(await checker(...args));
        }
    }

    /**
     * Creates a closure for checking the access.
     * @param value
     * @param accessFunctionCallCreate
     * @param useArrayOrConditions
     */
    private static createAccessCheckerCore<T extends MinAccessChecker,F extends (...args: any[]) => any>
    (
        value: AccessConfigValue<F> | undefined,
        accessFunctionCallCreate: AccessFunctionCallCreate<T,F>,
        useArrayOrConditions: boolean = true
    ): MinAccessChecker
    {
        if(typeof value === 'boolean') {
            return async () => value;
        }
        else if(typeof value === 'string') {
            switch (value) {
                case ZationAccess.All :
                    return async () => true;
                case ZationAccess.AllAuth :
                    return async (a) => a.isAuth();
                case ZationAccess.AllNotAuth :
                    return async (a) => a.isDefault();
                default :
                    return async (a) => a.getUserGroup() === value;
            }
        }
        else if(Array.isArray(value)) {
            const preparedChecks: MinAccessChecker[] = [];
            const preparedChecksLength = value.length;
            for(let i = 0; i < value.length; i++){
                preparedChecks[i] = AccessUtils.createAccessCheckerCore(value[i],accessFunctionCallCreate,false);
            }
            if(useArrayOrConditions){
                //OrConnection
                return async (...args) => {
                    for(let i = 0; i < preparedChecksLength;i++) {
                        if((await preparedChecks[i](...args))){
                            return true;
                        }
                    }
                    return false;
                }
            }
            else {
                //AndConnection
                return async (...args) => {
                    for(let i = 0; i < preparedChecksLength;i++) {
                        if(!(await preparedChecks[i](...args))){
                            return false;
                        }
                    }
                    return true;
                }
            }
        }
        else if(typeof value === 'function') {
            if(isTokenCheckFunction(value)){
                return async (a) => value(a.getSHBridge().getToken());
            }
            else {
                return accessFunctionCallCreate(value);
            }
        }
        else if(typeof value === 'object') {
            if(value.strictTypeCheck){
                return async (a) => a.getUserId() === value.id;
            }
            else {
                return async (a) => a.getUserId() == value.id;
            }
        }
        else {
            return async () => false;
        }
    }
}
