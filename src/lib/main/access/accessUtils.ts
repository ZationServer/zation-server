/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ZationAccessRecord}                      from '../constants/internal';
import {AccessConfigValue, isTokenCheckFunction} from "./accessOptions";
import Logger                                    from '../log/logger';
import {ErrorEventHolder}                        from '../error/errorEventHolder';
import Socket                                    from '../../api/Socket';

type AccessFunctionCallCreate<T extends MinAccessChecker,F> = (func: Function) => T;
type MinAccessChecker = (socket: Socket,...otherArgs: any[]) => Promise<boolean>;

export default class AccessUtils
{
    /**
     * Creates a closure for checking the access.
     * @param value
     * @param invertResult
     * @param accessFunctionCallCreate
     * @param target
     * A string that indicates on what target the created access checker is used.
     */
    static createAccessChecker<T extends MinAccessChecker,F extends (...args: any[]) => any>
    (
        value: AccessConfigValue<F> | undefined,
        invertResult: boolean = false,
        accessFunctionCallCreate: AccessFunctionCallCreate<T,F>,
        target: string
        ): MinAccessChecker
    {
        const errorEvent = ErrorEventHolder.get();
        const checker = AccessUtils.createAccessCheckerCore(value,accessFunctionCallCreate,true);
        const errorLogMessage = `An error was thrown on the: '${target}', access check:`;
        if(!invertResult){
            return async (...args) => {
                try {
                    return await checker(...args);
                }
                catch (e) {
                    Logger.log.error(errorLogMessage,e);
                    errorEvent(e);
                    return false;
                }
            };
        }
        else {
            return async (...args) => {
                try {
                    return !(await checker(...args));
                }
                catch (e) {
                    Logger.log.error(errorLogMessage,e);
                    errorEvent(e);
                    return false;
                }
            };
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
                case nameof<ZationAccessRecord>(s => s.all):
                    return async () => true;
                case nameof<ZationAccessRecord>(s => s.allAuth):
                    return async (s) => s.isAuthenticated();
                case nameof<ZationAccessRecord>(s => s.allNotAuth):
                    return async (s) => s.isNotAuthenticated();
                default:
                    return async (s) => s.userGroup === value;
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
                return async (s) => value(s.rawToken);
            }
            else {
                return accessFunctionCallCreate(value);
            }
        }
        else if(typeof value === 'object') {
            if(value.strictTypeCheck){
                return async (s) => s.userId === value.id;
            }
            else {
                return async (s) => s.userId == value.id;
            }
        }
        else {
            return async () => false;
        }
    }
}
