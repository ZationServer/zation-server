/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationConfigFull                                         from "../config/manager/zationConfigFull";
import Bag                                                      from "../../api/Bag";
import {ApiLevelSwitch, ApiLevelSwitchFunction}                 from '../apiLevel/apiLevelUtils';
import ZationWorker                                           = require("../../core/zationWorker");
import Component                                                from '../../api/Component';
import ComponentUtils                                           from './componentUtils';

export type ComponentInfo = {apiLevels: number[] | null,family: boolean};

export default abstract class ComponentPrepare<T extends Object>
{
    protected readonly zc: ZationConfigFull;
    protected readonly worker: ZationWorker;
    protected readonly bag: Bag;

    protected readonly componentType: string;
    protected readonly config: Record<string,any | ApiLevelSwitch<any>>;
    protected readonly components: Record<string,ApiLevelSwitchFunction<T>>;
    protected readonly componentInits: ((bag: Bag) => Promise<void> | void)[] = [];

    protected constructor(zc: ZationConfigFull,worker: ZationWorker,bag: Bag,type: string,config: Record<string,any | ApiLevelSwitch<any>>) {
        this.zc = zc;
        this.worker = worker;
        this.bag = bag;

        this.componentType = type;
        this.components = {};
        this.config = config;
    }

    /**
     * Prepare all Components.
     */
    prepare(): void {
        for(const identifier in this.config) {
            if(this.config.hasOwnProperty(identifier)) {
                this._prepare(identifier,this.config[identifier]);
            }
        }
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
     * Prepare a component.
     */
    protected abstract _prepare(identifier: string, definition: any): void;

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

    getComponentType(): string {
        return this.componentType;
    }

    getComponentsInfo(): Record<string,ComponentInfo> {
        const componentsInfo: Record<string,ComponentInfo> = {};
        let tmpDefinition;
        for(const identifier in this.config) {
            if(this.config.hasOwnProperty(identifier)) {
                tmpDefinition = this.config[identifier];
                if(typeof tmpDefinition === 'function') {
                    componentsInfo[identifier] = {apiLevels: null,family: ComponentUtils.isFamily(tmpDefinition)};
                }
                else {
                    const levels = Object.keys(tmpDefinition);
                    componentsInfo[identifier] = {apiLevels: levels.map((a) => parseInt(a)),
                        family: levels.length > 0 ? ComponentUtils.isFamily(tmpDefinition[levels[0]]) : false}
                }
            }
        }
        return componentsInfo;
    }
}