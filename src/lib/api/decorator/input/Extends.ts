/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ConfigBuildError from "../../../helper/configManager/configBuildError";

/**
 * A class decorator that can be used to add a
 * native zation object extension to an object model.
 * Notice you also can extend other object model classes
 * by using the normal javascript inheritance.
 * @param objectModelName
 */
export const Extends = (objectModelName : string) => {
    return (target : any) => {
        const prototype = target.prototype;

        if(prototype['___extends___'] === undefined){
            prototype['___extends___'] = objectModelName;
        }
        else {
            throw new ConfigBuildError
            (`Can not add an extension (${objectModelName}) to object model when it already has an extension (${prototype['___extends___']}).`);
        }
    }
};