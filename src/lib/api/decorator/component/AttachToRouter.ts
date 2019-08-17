/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Controller                    from "../../Controller";
import Router                        from "../../Router";
import ConfigBuildError              from "../../../main/config/manager/configBuildError";
import {Component}                   from "../../../main/config/definitions/component";
import DataBox                       from "../../dataBox/DataBox";
import DataBoxFamily                     from "../../dataBox/DataBoxFamily";

/**
 * Attach a component (Controller or DataBox) to a router.
 * You can attach multiple components with the same id but different API levels.
 * @param id
 * @param router
 * @param apiLevel
 * @constructor
 */
export const AttachToRouter = (id : string, router : Router, apiLevel ?: number) => {
    return (target : Component) => {
        if(target.prototype instanceof Controller || target.prototype instanceof DataBox
            || target.prototype instanceof DataBoxFamily){
            router.attach(id,target,apiLevel);
        }
        else {
            throw new ConfigBuildError(`The attach to router decorator can only be used on classes that extend the Controller, DataBox or DataIdBox class.`);
        }
    }
};