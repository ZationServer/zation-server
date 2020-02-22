/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import FunctionInitEngine, {FunctionInitFunction} from '../main/functionInit/functionInitEngine';
import ConfigBuildError from '../main/config/manager/configBuildError';

/**
 * With this function, you can prepare and initialize a function.
 * Usually, it is used to prepare stuff only once for
 * callback functions in the zation configs.
 * Notice that not every property that accepts a function
 * in the zation configs is compatible with the $init function.
 * @example
 * $init((bag) => {
 *    //prepare stuff
 *    const db = bag.databox(ProfileDataboxFamilyV1);
 *    return (bag,socket) => {
 *        //the callback
 *    }
 * })
 * @param initFunction
 */
export function $init<T>(initFunction: FunctionInitFunction<T>): (...args: any) => Promise<any>
export function $init(initValue: any): any {
    if (typeof initValue === 'function') {
        return FunctionInitEngine.initFunction(initValue);
    } else {
        throw new ConfigBuildError(`The init function not support values of type: ${typeof initValue}`);
    }
}