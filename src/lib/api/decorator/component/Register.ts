/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Config      from "../../Config";
import {Component} from "../../../helper/config/definitions/component";

/**
 * Register a component (Controllers, DataBoxes or DataIdBoxes) in the app config.
 * You only have to import the file in the app config.
 * You can register multiple components with the same id but different API levels.
 * @param id
 * @param apiLevel
 * @constructor
 */
export const Register = (id : string, apiLevel ?: number) => {
    return (target : Component) => {
        Config.registerComponent(id,target,apiLevel);
    }
};