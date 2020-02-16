/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InputConfigTranslatable, ModelConfigTranslatable} from "../../ConfigTranslatable";
import {ObjectModelConfig}       from "../../../main/config/definitions/inputConfig";
import CloneUtils                from "../../../main/utils/cloneUtils";
import Config                    from "../../Config";
import {InDecoratorMem, InDM_ConstructorMethods, InDM_Extends, InDM_Models} from "./InDecoratorMem";

/**
 * A class decorator that can be used to mark the class as an object model.
 * That means you can use the class in the input configuration directly,
 * and the object model will be registered to the models.
 * The constructor of the class will be called with the Bag but notice
 * that the input data is not available in the real class constructor.
 * But you can declare other methods and declare them as a constructor
 * with the constructor method decorator.
 * That will give you the possibility to use the input data and create async constructors.
 * @param register Indicates if the object model should be registered automatically.
 * @param name The name of the object model; if it is not provided, it will use the class name.
 */
export const ObjectModel = (register: boolean = true, name?: string) => {
    return (target: any) => {

        const prototype: InDecoratorMem = target.prototype;

        //constructorMethods
        const constructorMethods = Array.isArray(prototype[InDM_ConstructorMethods]) ?
            CloneUtils.deepClone(prototype[InDM_ConstructorMethods]!): [];

        const models = typeof prototype[InDM_Models] === 'object' ? prototype[InDM_Models]!: {};

        const objectModel: ObjectModelConfig = {
            properties: models,
            ...(prototype[InDM_Extends] !== undefined ? {extends: prototype[InDM_Extends]}: {}),
            construct: async function(bag)
            {
                let proto = this;
                let nextProto = Object.getPrototypeOf(proto);
                while (nextProto !== null && nextProto !== Object.prototype){
                    proto = nextProto;
                    nextProto = Object.getPrototypeOf(nextProto);
                }
                Object.setPrototypeOf(proto,Reflect.construct(target,[bag]));

                const promises: Promise<void>[] = [];
                for(let i = 0; i < constructorMethods.length; i++){
                    promises.push(constructorMethods[i].call(this,bag));
                }
                await Promise.all(promises);
            }
        };

        if(register) {
            const regName = typeof name === 'string' ? name: target.name;
            Config.defineModel(regName,objectModel);

            (target as ModelConfigTranslatable).__toModelConfig = () => {
                return regName;
            };

            (target as InputConfigTranslatable).__toInputConfig = () => {
                return [regName];
            };
        }
        else {
            (target as ModelConfigTranslatable).__toModelConfig = () => {
                return objectModel;
            };

            (target as InputConfigTranslatable).__toInputConfig = () => {
                return [objectModel];
            };
        }
    }
};