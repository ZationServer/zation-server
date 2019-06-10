/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ConfigBuildError from "../../helper/configManager/configBuildError";

/**
 * A method decorator that will mark that
 * the method should be added to the object model by using the construct function.
 * @constructor
 */
export const Method = () => {
    return (target : object,propertyName : string) => {
        if(typeof target['___methods___'] !== 'object'){
            target['___methods___'] = {};
        }
        if(typeof target[propertyName] === 'function'){
            target['___methods___'][propertyName] = target[propertyName];
        }
        else {
            throw new ConfigBuildError(`Can not declare a property ('${propertyName}') as a method of an object when it is not a function.`);
        }
    }
};