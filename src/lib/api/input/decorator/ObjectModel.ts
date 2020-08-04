/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {isModelTranslatable, resolveIfModelTranslatable, updateModelTranslatable} from '../../configTranslatable/modelTranslatable';
import CloneUtils                                                         from "../../../main/utils/cloneUtils";
// noinspection TypeScriptPreferShortImport
import {$extends}                                                         from '../Extends';
import {$model}                                                           from '../Model';

export const classObjModelConstructorMethodsSymbol = Symbol();
export const classObjModelPropertiesSymbol         = Symbol();
export const classObjectModelSymbol                = Symbol();

export interface ClassObjModel {
    /**
     * @internal
     */
    [classObjectModelSymbol]: true
    [classObjModelConstructorMethodsSymbol]?: Function[];
    [classObjModelPropertiesSymbol]?: Record<string,any>;
}

/**
 * Returns if a value is a class object model.
 * @param value
 */
export function isClassObjectModel(value: any): boolean {
    return typeof value === 'function' && value[classObjectModelSymbol];
}

/**
 * A class decorator that can be used to build a class object model.
 * After applying the decorator, you can use the class as a normal
 * model because the class is model translatable.
 * The constructor of the class will be called whenever a valid object value for
 * the model is received but notice that the input data is not available in the real class constructor.
 * But you can mark other methods as a constructor with the constructor method decorator.
 * That will give you the possibility to use the input data and create async constructors.
 * You also can add normal methods or properties to the class.
 * You can use them later because the prototype of the input will
 * be set to a new instance of this class.
 * It's also possible to extend another class that is marked as an object model.
 * That means the sub-model will inherit all properties, with the possibility to overwrite them.
 * Also, the super-model constructor-decorator-functions will be called before
 * the constructor-decorator-functions of the sub-object model.
 * The rest behaves like the normal inheritance of es6 classes.
 * Means the constructor on the superclass is called before the constructor on the subclass.
 * Also, the prototypes of the classes will be chained.
 * @param name The name of the object model; if it is not provided, it will use the class name.
 */
export const ObjectModel = (name?: string) => {
    return (target: any) => {
        target[classObjectModelSymbol] = true;

        const prototype: ClassObjModel = target.prototype;

        //constructorMethods
        const constructorMethods = prototype.hasOwnProperty(classObjModelConstructorMethodsSymbol) &&
        Array.isArray(prototype[classObjModelConstructorMethodsSymbol]) ?
            CloneUtils.deepClone(prototype[classObjModelConstructorMethodsSymbol]!): [];
        const constructorMethodsLength = constructorMethods.length;

        const models = prototype.hasOwnProperty(classObjModelPropertiesSymbol) && typeof prototype[classObjModelPropertiesSymbol] === 'object' ?
            prototype[classObjModelPropertiesSymbol]!: {};

        const objectModel = $model({
            properties: models,
            baseConstruct: async function() {
                Object.setPrototypeOf(this, Reflect.construct(target, []));
            },
            construct: async function() {
                const promises: Promise<void>[] = [];
                for (let i = 0; i < constructorMethodsLength; i++) {
                    promises.push(constructorMethods[i].call(this));
                }
                await Promise.all(promises);
            }
        },typeof name === 'string' ? name : target.name)

        //extends
        const proto = Object.getPrototypeOf(target);
        if(isModelTranslatable(proto) || typeof proto !== 'function') {
            $extends(objectModel,resolveIfModelTranslatable(proto));
        }

        updateModelTranslatable(target,() => objectModel);
    }
};