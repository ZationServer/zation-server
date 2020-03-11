/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {isModelConfigTranslatable, updateModelConfigTranslatable} from '../../configTranslatable/modelConfigTranslatable';
import {ObjectModel as ObjectModelConfig}                         from "../../../main/config/definitions/parts/inputConfig";
import CloneUtils                                                 from "../../../main/utils/cloneUtils";
import {InDecoratorMem, inDM_ConstructorMethodsSymbol, inDM_ModelsSymbol} from "./InDecoratorMem";
import ObjectUtils                                                        from '../../../main/utils/objectUtils';
import {createReusableModel}                                              from '../../../main/model/reusableModelCreator';
// noinspection TypeScriptPreferShortImport
import {$extends}                                                         from '../../input/Extends';

/**
 * A class decorator that can be used to mark the class as an object model.
 * That means you can use the class in the input configuration directly.
 * The constructor of the class will be called with the Bag but notice
 * that the input data is not available in the real class constructor.
 * But you can declare other methods and declare them as a constructor
 * with the constructor method decorator.
 * That will give you the possibility to use the input data and create async constructors.
 * It's also possible to extend another class that is marked as another object model.
 * Zation will handle it as an object model extension.
 * That means the sub-model will inherit all properties,
 * with the possibility to overwrite them.
 * It also affects the prototype because the sub-object model prototype
 * will get the super-model prototype as a prototype.
 * Also, the super-model constructor-functions will be called before
 * the constructor-functions of the sub-object model.
 * In addition, the convert-function will also be
 * called with the result of the super convert function.
 * @param name The name of the object model; if it is not provided, it will use the class name.
 */
export const ObjectModel = (name?: string) => {
    return (target: any) => {
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
            construct: async function(bag) {
                ObjectUtils.setPrototypeAtTheEnd(this,Reflect.construct(target,[bag]));

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
            $extends(objectModel,proto);
        }

        updateModelConfigTranslatable(target,() => objectModel);
    }
};