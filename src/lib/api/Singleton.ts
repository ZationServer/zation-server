/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import DynamicSingleton       from '../main/utils/dynamicSingleton';
import Process, {ProcessType} from './Process';

export const singletonSymbol = Symbol();

/**
 * @description
 * The Singleton decorator can be used to mark a class as a singleton.
 * Zation will create the singleton instance internally and you
 * can access it with the bag get method or inject it with the inject decorator.
 * Notice that the constructor should not take any arguments.
 * It is also possible to mark a non-static method with the initializer decorator.
 * By that, this method will be called with a this-context that is bound
 * to the singleton instance.
 * This is useful to do async operations to initialize the instance.
 * @param target
 * @example
 *   @Singleton
 *   class NavigatorManager {
 *   }
 */
export default function Singleton(target: any) {
    if(Process.type !== ProcessType.Worker) return;
    target[singletonSymbol] = true;
    DynamicSingleton.create(target);
}