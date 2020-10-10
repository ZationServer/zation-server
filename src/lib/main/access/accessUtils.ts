/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AccessRules, AccessKeywordRecord}        from './accessOptions';
import Logger                                    from '../log/logger';
import {ErrorEventHolder}                        from '../error/errorEventHolder';
import Socket                                    from '../../api/Socket';
import {isRelationAndArray}                      from '../../api/RelationArrays';
import {getNotValue, isNot}                      from '../../api/Not';

type MinAccessChecker = (socket: Socket,...otherArgs: any[]) => Promise<boolean> | boolean;

export default class AccessUtils
{
    /**
     * Creates a closure for checking the access.
     * @param value
     * @param target
     * A string that indicates on what target the created access checker is used.
     */
    static createAccessChecker<T extends MinAccessChecker>
        (value: AccessRules<T> | undefined, target: string): T
    {
        const errorEvent = ErrorEventHolder.get();
        const checker = AccessUtils.createAccessCheckerCore<T>(value);
        const errorLogMessage = `An error was thrown on the: '${target}', access check:`;
        return (async (...args) => {
            try {return await checker(...args);}
            catch (e) {
                Logger.log.error(errorLogMessage,e);
                errorEvent(e);
                return false;
            }
        }) as T;
    }

    /**
     * Creates a closure for checking the access.
     * @param value
     */
    private static createAccessCheckerCore<T extends MinAccessChecker>
        (value: AccessRules<T> | undefined): MinAccessChecker
    {
        if(typeof value === 'boolean') return () => value;
        else if(typeof value === 'string') {
            switch (value) {
                case nameof<AccessKeywordRecord>(s => s.all):
                    return () => true;
                case nameof<AccessKeywordRecord>(s => s.allAuth):
                    return s => s.isAuthenticated();
                case nameof<AccessKeywordRecord>(s => s.allNotAuth):
                    return s => s.isNotAuthenticated();
                default:
                    return s => s.userGroup === value;
            }
        }
        else if(isNot(value)){
            const check = this.createAccessCheckerCore(getNotValue(value));
            return async (...args) => !(await check(...args));
        }
        else if(Array.isArray(value)) {
            const preparedChecks: MinAccessChecker[] = [];
            const preparedChecksLength = value.length;
            for(let i = 0; i < preparedChecksLength; i++)
                preparedChecks[i] = AccessUtils.createAccessCheckerCore(value[i]);
            if(isRelationAndArray(value)){
                //AndConnection
                return async (...args) => {
                    for(let i = 0; i < preparedChecksLength; i++) {
                        if(!(await preparedChecks[i](...args))) return false;
                    }
                    return true;
                }
            }
            else {
                //OrConnection
                return async (...args) => {
                    for(let i = 0; i < preparedChecksLength; i++) {
                        if(await preparedChecks[i](...args)) return true;
                    }
                    return false;
                }
            }
        }
        else if(typeof value === 'function') return value;
        else if(typeof value === 'object') {
            if(value.strictTypeCheck) return s => s.userId === value.id;
            else return s => s.userId == value.id;
        }
        else return () => false;
    }
}
