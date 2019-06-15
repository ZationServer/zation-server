/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Model as ModelConfig} from "../../../helper/configDefinitions/appConfig";
import {InDecoratorMem}       from "./InDecoratorMem";

/**
 * A decorator that will mark the property with a model config and
 * mark that zation should use it.
 * That means it will be used as a property of an object model
 * or as a param of a param based input config.
 * @param model
 */
export const Model = (model : ModelConfig) => {
    return (target : any,propertyName : string) => {
        target = (target as InDecoratorMem);
        if(typeof target.___models___ !== 'object'){
            target.___models___ = {};
        }
        target.___models___[propertyName] = model;
    }
};