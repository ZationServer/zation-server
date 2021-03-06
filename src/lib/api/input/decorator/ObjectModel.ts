/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {isModelTranslatable, modelTranslateSymbol, resolveIfModelTranslatable} from '../../configTranslatable/modelTranslatable';
// noinspection TypeScriptPreferShortImport
import {$extends}                                                         from '../Extends';
import {$model}                                                           from '../Model';
import {MetaModelProp, setReturnMetaPropModelMode}                        from '../ModelProp';

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
 * To define properties with a model on the Object Model, you can use the ModelProp function or the Model decorator.
 * Zation will create an instance at start and analysis all properties to create the object model.
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

        //process options
        const constructorMethods: Function[] = [];
        let models = {};

        let tmpProto = prototype;
        do {
            if(tmpProto.hasOwnProperty(classObjModelConstructorMethodsSymbol) &&
                Array.isArray(tmpProto[classObjModelConstructorMethodsSymbol])) {
                constructorMethods.push(...(tmpProto[classObjModelConstructorMethodsSymbol] as Function[]))
            }
            if(tmpProto.hasOwnProperty(classObjModelPropertiesSymbol) &&
                typeof tmpProto[classObjModelPropertiesSymbol] === 'object') {
                models = Object.assign({},tmpProto[classObjModelPropertiesSymbol],models);
            }
        } while((tmpProto = Object.getPrototypeOf(tmpProto)) && tmpProto !== Object.prototype);
        const constructorMethodsLength = constructorMethods.length;

        //analyse props with ModelProp
        setReturnMetaPropModelMode(true);
        const instance = Reflect.construct(target, [true]);
        setReturnMetaPropModelMode(false);
        for(const k in instance) {
            // noinspection JSUnfilteredForInLoop
            const v = instance[k];
            if(v instanceof MetaModelProp) models[k] = v.model;
        }

        const objectModel = $model({
            properties: models,
            baseConstruct: async function() {
                Object.setPrototypeOf(this, Reflect.construct(target, []));
            },
            ...(constructorMethodsLength > 0 ? {
                construct: async function() {
                    const promises: Promise<void>[] = [];
                    for (let i = 0; i < constructorMethodsLength; i++) {
                        promises.push(constructorMethods[i].call(this));
                    }
                    await Promise.all(promises);
                }
            } : {})
        },typeof name === 'string' ? name : target.name)

        //extends
        const proto = Object.getPrototypeOf(target);
        if(isModelTranslatable(proto) || typeof proto !== 'function') {
            $extends(objectModel,resolveIfModelTranslatable(proto));
        }

        target[modelTranslateSymbol] = () => objectModel;
    }
};