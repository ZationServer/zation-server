/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Config           from "../../Config";
import {Component}      from "../../../helper/config/definitions/component";
import Controller       from "../../Controller";
import DataBox          from "../../dataBox/DataBox";
import DataBoxFamily        from "../../dataBox/DataBoxFamily";
import ConfigBuildError from "../../../helper/config/manager/configBuildError";

/**
 * Register a component (Controller or DataBox) in the app config.
 * You only have to import the file in the app config.
 * You can register multiple components with the same id but different API levels.
 * @param id
 * @param apiLevel
 * @constructor
 */
export const Register = (id : string, apiLevel ?: number) => {
    return (target : Component) => {
        if(target.prototype instanceof Controller || target.prototype instanceof DataBox
            || target.prototype instanceof DataBoxFamily){
            Config.registerComponent(id,target,apiLevel);
        }
        else {
            throw new ConfigBuildError(`The register decorator can only be used on classes that extend the Controller, DataBox or DataIdBox class.`);
        }
    }
};