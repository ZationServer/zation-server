/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model as ModelConfig}        from "../../../main/config/definitions/inputConfig";
import {InDecoratorMem, InDM_Models} from "./InDecoratorMem";

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
        if(typeof target[InDM_Models] !== 'object'){
            target[InDM_Models] = {};
        }
        target[InDM_Models][propertyName] = model;
    }
};