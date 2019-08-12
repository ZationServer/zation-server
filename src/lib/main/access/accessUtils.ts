/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import AuthEngine     from "../auth/authEngine";
import {ZationAccess} from "../constants/internal";

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
     */
    static createAccessChecker<T extends MinAccessChecker,F extends (...args : any[]) => any>
    (
        value : any,
        accessProcess : AccessProcess,
        accessFunctionCallCreate : AccessFunctionCallCreate<T,F>) : MinAccessChecker
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
            return async (a) => {
                let found = false;
                for(let i = 0; i < value.length;i++) {
                    if((typeof value[i] === 'string' && value[i] === a.getUserGroup())
                        ||
                        (typeof value[i] === 'number' && value[i] == a.getUserId())) {
                        found = true;
                        break;
                    }
                }
                return accessProcess(found);
            }
        }
        else if(typeof value === 'function') {
            return accessFunctionCallCreate(value);
        }
        else if(typeof value === 'number') {
            return async (a) => {return accessProcess(a.getUserId() == value)};
        }
        else {
            return async () => {return false;}
        }
    }
}
