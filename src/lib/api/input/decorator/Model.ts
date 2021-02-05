/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model as AnyModel}                  from '../../../main/models/model';
import {ClassObjModel, classObjModelPropertiesSymbol} from './ObjectModel';

/**
 * A decorator that will attach a model to a property.
 * All properties that have a model attached will be
 * considered as properties for the object model.
 * @param model
 */
export const Model = (model: AnyModel) => {
    return (target: any,propertyName: string) => {
        target = (target as ClassObjModel);
        if(!target.hasOwnProperty(classObjModelPropertiesSymbol)){
            target[classObjModelPropertiesSymbol] = {};
        }
        target[classObjModelPropertiesSymbol][propertyName] = model;
    }
};