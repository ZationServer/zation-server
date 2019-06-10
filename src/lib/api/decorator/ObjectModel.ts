/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {InputConfigTranslatable, ModelConfigTranslatable} from "../ConfigTranslatable";
import {ObjectModelConfig}       from "../../helper/configDefinitions/appConfig";
import CloneUtils                from "../../helper/utils/cloneUtils";
import Config                    from "../Config";

/**
 * A class decorator that can be used to mark the class as an object model.
 * That means you can use the class in the input configuration directly,
 * and the object model will be registered to the models.
 * @param register Indicates if the object model should be registered automatically.
 * @param name The name of the object model; if it is not provided, it will use the class name.
 * @constructor
 */
export const ObjectModel = (register : boolean = true, name ?: string) => {
    return (target : any) => {

        const prototype = target.prototype;

        const constructMethods = CloneUtils.deepClone(prototype['___methods___']);
        const constructMethodNames : string[] = [];

        if(typeof constructMethods === 'object'){
            for(let k in constructMethods){
                if(constructMethods.hasOwnProperty(k) &&
                    typeof constructMethods[k] === 'function'){
                    constructMethodNames.push(k);
                }
            }
        }

        const objectModel : ObjectModelConfig = {
            properties : typeof prototype['___models___'] === 'object' ? prototype['___models___'] : {},
            construct : function(smallBag) {
                this.smallBag = smallBag;
                for(let i = 0; i < constructMethodNames.length; i++){
                    this[constructMethodNames[i]] = constructMethods[constructMethodNames[i]].bind(this);
                }
            }
        };

        (target as ModelConfigTranslatable).__toModelConfig = () => {
            return objectModel;
        };

        (target as InputConfigTranslatable).__toInputConfig = () => {
            return [objectModel];
        };

        if(register) {
            const regName = typeof name === 'string' ? name : target.name;
            Config.defineModel(regName,objectModel);
        }
    }
};