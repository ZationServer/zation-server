/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import InitializerManager from '../main/initializer/initializerManager';

/**
 * @description
 * The Initializer decorator can be used to mark a method as an initializer.
 * All initializer methods will be called before the components will
 * be initialized but after injections were processed.
 * Notice that initializer methods can not access the this-context.
 * The only exception is when you use the initializer decorator on a non-static
 * method of a singleton class, then the this-context refers to the singleton instance.
 * @param target
 * @param propertyKey
 * @param descriptor
 * @example
 *   @Initializer
 *   static async init() {
 *      //do some stuff
 *   }
 */
export default function Initializer(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    InitializerManager.get().addInitializer(target,descriptor.value);
}