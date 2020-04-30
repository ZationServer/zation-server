/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Config           from "../../Config";
import {Component}      from "../../../main/config/definitions/parts/component";
import Controller       from "../../Controller";
import Databox          from "../../databox/Databox";
import DataboxFamily    from "../../databox/DataboxFamily";
import ConfigBuildError from "../../../main/config/manager/configBuildError";
import Router           from '../../Router';

type RegisterDecorator = {
    (target: Component): void,
    /**
     * Specifies the API level of the component.
     * @param apiLevel
     */
    withApiLevel(apiLevel?: number): RegisterDecorator;
    /**
     * Registers the component with a specific router.
     * @param router
     */
    withRouter(router?: Router): RegisterDecorator;
};
/**
 * Register a component (Controller or Databox).
 * You only have to import the file in the app config.
 * This decorator provides a fluent API to specify the API level, router,
 * or if it should register an auth controller.
 * You are able to register multiple components with the same identifier but different API levels.
 * The identifier of the component will be created with the routes and the provided name.
 * @param name
 * If not provided, it takes the class name.
 * Notice that "Controller" and "Databox" will be removed from the class name.
 * To specify more classes with different versions but the same name, you can use the '$' sign.
 * All characters behind the $ sign will be removed.
 */
export const Register = (name?: string): RegisterDecorator => {
    let targetApiLevel: number | undefined = undefined;
    let targetRouter: Router | undefined = undefined;

    const func = (target: Component) => {
        let targetName;
        if(name === undefined) {
            let className = target.name;
            const indexOfDollar = className.indexOf("$");
            if(indexOfDollar !== -1){
                className = className.slice(0,indexOfDollar);
            }
            targetName = className.replace(/Controller|Databox/g, '');
        }
        else {
            targetName = name;
        }
        if(target.prototype instanceof Controller || target.prototype instanceof Databox
            || target.prototype instanceof DataboxFamily){
            targetRouter ? targetRouter.register(targetName,target,targetApiLevel) :
                Config.registerComponent(targetName,target,targetApiLevel);
        }
        else {
            throw new ConfigBuildError(`The register decorator can only be used on classes that extend the Controller, Databox or DataboxFamily class.`);
        }
    };
    func.withApiLevel = (apiLevel?: number) => {
        targetApiLevel = apiLevel;
        return func;
    };
    func.withRouter = (router?: Router) => {
        targetRouter = router;
        return func;
    };
    return func;
};