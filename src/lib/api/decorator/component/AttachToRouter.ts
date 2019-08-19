/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Controller                    from "../../Controller";
import Router                        from "../../Router";
import ConfigBuildError              from "../../../main/config/manager/configBuildError";
import {Component}                   from "../../../main/config/definitions/component";
import Databox                       from "../../databox/Databox";
import DataboxFamily                     from "../../databox/DataboxFamily";

/**
 * Attach a component (Controller or Databox) to a router.
 * You can attach multiple components with the same name but different API levels.
 * @param name
 * @param router
 * @param apiLevel
 * @constructor
 */
export const AttachToRouter = (name : string, router : Router, apiLevel ?: number) => {
    return (target : Component) => {
        if(target.prototype instanceof Controller || target.prototype instanceof Databox
            || target.prototype instanceof DataboxFamily){
            router.attach(name,target,apiLevel);
        }
        else {
            throw new ConfigBuildError(`The attach to router decorator can only be used on classes that extend the Controller, Databox or DataIdBox class.`);
        }
    }
};