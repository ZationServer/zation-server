/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ConfigBuildError    from "../../../helper/configManager/configBuildError";
import {InDecoratorMem}    from "./InDecoratorMem";
import {ObjectModelConfig} from "../../../helper/configDefinitions/appConfig";
import {AnyClass, AnyModelConfigTranslatable} from "../../../helper/configDefinitions/configComponents";

/**
 * A class decorator that can be used to add a
 * native zation object extension to an object model.
 * Notice you also can extend other object model classes
 * by using the normal javascript inheritance.
 * @param extension
 */
export const Extends = (extension : ObjectModelConfig | string | AnyClass | AnyModelConfigTranslatable) => {
    return (target : any) => {
        const prototype : InDecoratorMem = target.prototype;

        if(prototype.___extends___ === undefined){
            prototype.___extends___ = extension;
        }
        else {
            throw new ConfigBuildError
            (`Can not add an extension (${extension}) to object model when it already has an extension (${prototype.___extends___}).`);
        }
    }
};