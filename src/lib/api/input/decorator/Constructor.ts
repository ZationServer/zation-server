/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ConfigBuildError                                       from "../../../main/config/manager/configBuildError";
import {ClassObjModel, classObjModelConstructorMethodsSymbol} from './ObjectModel';

/**
 * A method decorator that will mark that the
 * method should be used as a constructor function.
 * That will give you the possibility to create async constructor
 * functions and register more than one constructor.
 * The constructor methods will automatically be invoked when the
 * real class constructor was executed,
 * and the input data was assigned to the object.
 */
export const Constructor = () => {
    return (target: any,propertyName: string) => {
        target = (target as ClassObjModel);
        if(!target.hasOwnProperty(classObjModelConstructorMethodsSymbol)){
            target[classObjModelConstructorMethodsSymbol] = [];
        }
        if(typeof target[propertyName] === 'function'){
           target[classObjModelConstructorMethodsSymbol].push(target[propertyName]);
        }
        else {
            throw new ConfigBuildError(`Can not declare a property ('${propertyName}') as a constructor of an object when it is not a function.`);
        }
    }
};