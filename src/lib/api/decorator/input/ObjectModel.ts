/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {isModelConfigTranslatable, resolveModelConfigTranslatable, updateModelConfigTranslatable} from '../../configTranslatable/modelConfigTranslatable';
import {ObjectModel as ObjectModelConfig}                         from "../../../main/config/definitions/parts/inputConfig";
import CloneUtils                                                 from "../../../main/utils/cloneUtils";
import {InDecoratorMem, inDM_ConstructorMethodsSymbol, inDM_ModelsSymbol} from "./InDecoratorMem";
import {createReusableModel}                                              from '../../../main/models/reusableModelCreator';
// noinspection TypeScriptPreferShortImport
import {$extends}                                                         from '../../input/Extends';

export const classObjectModelSymbol = Symbol();

/**
 * Returns if a value is a class object model.
 * @param value
 */
export function isClassObjectModel(value: any): boolean {
    return typeof value === 'function' && value[classObjectModelSymbol];
}

/**
 * A class decorator that can be used to mark the class as an object model.
 * That means you can use the class in the input configuration directly.
 * The constructor of the class will be called with the Bag but notice
 * that the input data is not available in the real class constructor.
 * But you can declare other methods and declare them as a constructor
 * with the constructor method decorator.
 * That will give you the possibility to use the input data and create async constructors.
 * You also can add normal methods or properties to the class.
 * You can use these later because the prototype of
 * the input will be set to a new instance of this class.
 * It's also possible to extend another class that is marked as another object model.
 * That means the sub-model will inherit all properties,
 * with the possibility to overwrite them.
 * Also, the super-model constructor-decorator-functions will be called before
 * the constructor-decorator-functions of the sub-object model.
 * The rest behaves like the normal inheritance of es6 classes.
 * Means the constructor on the superclass is
 * called before the constructor on the subclass.
 * Also, the prototypes of the classes will be chained.
 * @param name The name of the object model; if it is not provided, it will use the class name.
 */
export const ObjectModel = (name?: string) => {
    return (target: any) => {
        target[classObjectModelSymbol] = true;

        const prototype: InDecoratorMem = target.prototype;

        //constructorMethods
        const constructorMethods = prototype.hasOwnProperty(inDM_ConstructorMethodsSymbol) &&
        Array.isArray(prototype[inDM_ConstructorMethodsSymbol]) ?
            CloneUtils.deepClone(prototype[inDM_ConstructorMethodsSymbol]!): [];
        const constructorMethodsLength = constructorMethods.length;

        const models = prototype.hasOwnProperty(inDM_ModelsSymbol) && typeof prototype[inDM_ModelsSymbol] === 'object' ?
            prototype[inDM_ModelsSymbol]!: {};

        const objectModel: ObjectModelConfig = createReusableModel({
            properties: models,
            baseConstruct: async function(bag) {
                Object.setPrototypeOf(this,Reflect.construct(target,[bag]));
            },
            construct: async function(bag) {
                const promises: Promise<void>[] = [];
                for(let i = 0; i < constructorMethodsLength; i++){
                    promises.push(constructorMethods[i].call(this,bag));
                }
                await Promise.all(promises);
            }
        },typeof name === 'string' ? name: target.name) as ObjectModelConfig;

        //extends
        const proto = Object.getPrototypeOf(target);
        if(isModelConfigTranslatable(proto) || typeof proto !== 'function') {
            $extends(objectModel,resolveModelConfigTranslatable(proto));
        }

        updateModelConfigTranslatable(target,() => objectModel);
    }
};