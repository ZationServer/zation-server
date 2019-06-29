/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Config                        from "../../Config";
import Controller, {ControllerClass} from "../../Controller";
import ConfigBuildError               from "../../../helper/config/manager/configBuildError";

/**
 * Register a controller in the app config.
 * You only have to import the file in the app config.
 * You can register multiple controllers with the same id but different API levels.
 * @param id
 * @param apiLevel
 * @constructor
 */
export const Register = (id : string, apiLevel ?: number) => {
    return (target : ControllerClass) => {
        if(target.prototype instanceof Controller){
            Config.registerController(id,target,apiLevel);
        }
        else {
            throw new ConfigBuildError(`The register decorator can only be used on classes that extend the Controller class.`);
        }
    }
};