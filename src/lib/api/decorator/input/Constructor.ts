/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ConfigBuildError                          from "../../../main/config/manager/configBuildError";
import {InDecoratorMem, InDM_ConstructorMethods} from "./InDecoratorMem";

/**
 * A method decorator that will mark that the method
 * should be used as a constructor function.
 * That will give you also the possibility to create
 * async constructor functions and
 * register more than one constructor.
 * The constructor methods will automatically be invoked with a
 * Bag when the real class constructor was executed,
 * and the input data is assigned to the object.
 */
export const Constructor = () => {
    return (target : any,propertyName : string) => {
        target = (target as InDecoratorMem);
        if(!Array.isArray(target[InDM_ConstructorMethods])){
            target[InDM_ConstructorMethods] = [];
        }
        if(typeof target[propertyName] === 'function'){
           target[InDM_ConstructorMethods].push(target[propertyName]);
        }
        else {
            throw new ConfigBuildError(`Can not declare a property ('${propertyName}') as a constructor of an object when it is not a function.`);
        }
    }
};