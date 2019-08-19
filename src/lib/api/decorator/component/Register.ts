/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Config           from "../../Config";
import {Component}      from "../../../main/config/definitions/component";
import Controller       from "../../Controller";
import Databox          from "../../databox/Databox";
import DataboxFamily        from "../../databox/DataboxFamily";
import ConfigBuildError from "../../../main/config/manager/configBuildError";

/**
 * Register a component (Controller or Databox) in the app config.
 * You only have to import the file in the app config.
 * You can register multiple components with the same id but different API levels.
 * @param id
 * @param apiLevel
 * @constructor
 */
export const Register = (id : string, apiLevel ?: number) => {
    return (target : Component) => {
        if(target.prototype instanceof Controller || target.prototype instanceof Databox
            || target.prototype instanceof DataboxFamily){
            Config.registerComponent(id,target,apiLevel);
        }
        else {
            throw new ConfigBuildError(`The register decorator can only be used on classes that extend the Controller, Databox or DataIdBox class.`);
        }
    }
};