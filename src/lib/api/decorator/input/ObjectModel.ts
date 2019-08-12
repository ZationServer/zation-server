/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InputConfigTranslatable, ModelConfigTranslatable} from "../../ConfigTranslatable";
import {ObjectModelConfig}       from "../../../main/config/definitions/inputConfig";
import CloneUtils                from "../../../main/utils/cloneUtils";
import Config                    from "../../Config";
import {InDecoratorMem}          from "./InDecoratorMem";

/**
 * A class decorator that can be used to mark the class as an object model.
 * That means you can use the class in the input configuration directly,
 * and the object model will be registered to the models.
 * The constructor of the class will be called with the SmallBag but notice
 * that the input data is not available in the real class constructor.
 * But you can declare other methods and declare them as a constructor
 * with the constructor method decorator.
 * That will give you the possibility to use the input data and create async constructors.
 * @param register Indicates if the object model should be registered automatically.
 * @param name The name of the object model; if it is not provided, it will use the class name.
 */
export const ObjectModel = (register : boolean = true, name ?: string) => {
    return (target : any) => {

        const prototype : InDecoratorMem = target.prototype;

        //constructorMethods
        const constructorMethods = Array.isArray(prototype.___constructorMethods___) ?
            CloneUtils.deepClone(prototype.___constructorMethods___) : [];

        const models = typeof prototype.___models___ === 'object' ? prototype.___models___ : {};

        const objectModel : ObjectModelConfig = {
            properties : models,
            ...(prototype.___extends___ !== undefined ? {extends : prototype.___extends___} : {}),
            construct : async function(smallBag)
            {
                let proto = this;
                let nextProto = Object.getPrototypeOf(proto);
                while (nextProto !== null && nextProto !== Object.prototype){
                    proto = nextProto;
                    nextProto = Object.getPrototypeOf(nextProto);
                }
                Object.setPrototypeOf(proto,Reflect.construct(target,[smallBag]));

                const promises : Promise<void>[] = [];
                for(let i = 0; i < constructorMethods.length; i++){
                    promises.push(constructorMethods[i].call(this,smallBag));
                }
                await Promise.all(promises);
            }
        };

        if(register) {
            const regName = typeof name === 'string' ? name : target.name;
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