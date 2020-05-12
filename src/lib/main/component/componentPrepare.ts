/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfigFull                                         from "../config/manager/zationConfigFull";
import Bag                                                      from "../../api/Bag";
import {ApiLevelSwitchFunction}                                 from "../apiLevel/apiLevelUtils";
import ZationWorker                                           = require("../../core/zationWorker");
import Component                                                from '../../api/Component';

export default abstract class ComponentPrepare<T>
{
    protected readonly zc: ZationConfigFull;
    protected readonly worker: ZationWorker;
    protected readonly bag: Bag;

    protected readonly components: Record<string,ApiLevelSwitchFunction<T>>;
    protected readonly componentInits: ((bag: Bag) => Promise<void> | void)[] = [];

    protected constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag) {
        this.zc = zc;
        this.worker = worker;
        this.bag = bag;

        this.components = {};
    }

    /**
     * It will return the Component instance.
     * If no Component with the API level is found,
     * it will throw an API level incompatible error,
     * and when the Component does not exist, it also throws an error.
     * @param identifier
     * @param apiLevel
     */
    get(identifier: string, apiLevel: number): T {
        //throws if not exists
        this.checkExist(identifier);

        const component = this.components[identifier](apiLevel);
        if(component !== undefined){
            return component;
        }
        else {
            throw this.createIncompatibleAPILevelError(identifier, apiLevel);
        }
    }

    /**
     * Is used to create a specific: IncompatibleAPILevelError.
     */
    protected abstract createIncompatibleAPILevelError(identifier: string,apiLevel: number): Error;

    /**
     * Is used to create a specific: ComponentNotExistsError.
     */
    protected abstract createComponentNotExistsError(identifier: string): Error;

    /**
     * Returns a boolean that indicates if the Component exists.
     * @param identifier
     */
    isExist(identifier: string): boolean {
        return this.components.hasOwnProperty(identifier);
    }

    /**
     * Checks if the Component exists.
     * It will throw a error if the Component is not found.
     * @param identifier
     */
    checkExist(identifier: string): void {
        if(!this.isExist(identifier)) {
            throw this.createComponentNotExistsError(identifier);
        }
    }

    /**
     * Prepare all Components.
     */
    abstract prepare(): void;

    /**
     * Adds initialize of a component.
     * @param component
     */
    protected addInit(component: Component) {
        this.componentInits.push(component.initialize.bind(component));
    }

    /**
     * Init all Components (after prepare)
     */
    async init(): Promise<void> {
        const length = this.componentInits.length;
        const promises: (Promise<void> | void)[] = [];
        for(let i = 0; i < length; i++){
            promises.push(this.componentInits[i](this.bag));
        }
        await Promise.all(promises);
    }
}