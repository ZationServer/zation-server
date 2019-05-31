/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Controller, {ControllerClass} from "../Controller";
import Router                        from "../Router";
import ConfigBuildError               from "../../helper/configManager/configBuildError";

/**
 * Attach a controller to a router.
 * You can attach multiple controllers with the same id but different API levels.
 * @param id
 * @param router
 * @param apiLevel
 * @constructor
 */
export const AttachToRouter = (id : string, router : Router, apiLevel ?: number) => {
    return (target : ControllerClass) => {
        if(target.prototype instanceof Controller){
            router.attach(id,target,apiLevel);
        }
        else {
            throw new ConfigBuildError(`The attach to router decorator can only be used on classes that extend the Controller class.`);
        }
    }
};