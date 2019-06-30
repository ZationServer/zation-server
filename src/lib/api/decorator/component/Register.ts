/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Config            from "../../Config";
import {ControllerClass} from "../../Controller";
import {DataBoxClassDef} from "../../../helper/config/definitions/dataBoxConfig";

/**
 * Register a component (Controllers, DataBoxes or DataIdBoxes) in the app config.
 * You only have to import the file in the app config.
 * You can register multiple components with the same id but different API levels.
 * @param id
 * @param apiLevel
 * @constructor
 */
export const Register = (id : string, apiLevel ?: number) => {
    return (target : ControllerClass | DataBoxClassDef) => {
        Config.registerComponent(id,target,apiLevel);
    }
};