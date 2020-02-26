/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ConfigBuildError                       from "../../../main/config/manager/configBuildError";
import {InDecoratorMem, InDM_Extends}         from "./InDecoratorMem";
import {ObjectModelConfig}                    from "../../../main/config/definitions/parts/inputConfig";
import {AnyClass, AnyModelConfigTranslatable} from "../../../main/config/definitions/parts/configComponents";

/**
 * A class decorator that can be used to add a
 * native zation object extension to an object model.
 * Notice you also can extend other object model classes
 * by using the normal javascript inheritance.
 * @param extension
 */
export const Extends = (extension: ObjectModelConfig | string | AnyClass | AnyModelConfigTranslatable) => {
    return (target: any) => {
        const prototype: InDecoratorMem = target.prototype;

        if(prototype[InDM_Extends] === undefined){
            prototype[InDM_Extends] = extension;
        }
        else {
            throw new ConfigBuildError
            (`Can not add an extension (${extension}) to object model when it already has an extension (${prototype[InDM_Extends]}).`);
        }
    }
};