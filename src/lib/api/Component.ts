/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {extractComponentName} from '../main/utils/componentUtils';
import {ControllerClass}      from './Controller';
import {AnyDataboxClass}      from './databox/AnyDataboxClass';
import Bag                    from './Bag';

export default class Component {

    /**
     * @description
     * The identifier of the Component from the app config.
     */
    protected readonly identifier: string;

    /**
     * @description
     * The name of the Component.
     */
    protected readonly name: string;

    /**
     * @description
     * The prepared bag from the worker.
     */
    protected readonly bag: Bag;

    /**
     * @description
     * The API level of the Component from the app config.
     * It can be undefined if no API level is defined.
     */
    protected readonly apiLevel: number | undefined;

    constructor(identifier: string, apiLevel: number | undefined, bag: Bag) {
        this.identifier = identifier;
        this.name = extractComponentName(identifier);
        this.apiLevel = apiLevel;
        this.bag = bag;
    }

    /**
     * **Can be overridden.**
     * @description
     * Gets once invoked at the start of the worker
     * after an instance is created of this Component.
     * @param bag
     */
    initialize(bag: Bag): Promise<void> | void {
    }
}

export type ComponentClass = ControllerClass | AnyDataboxClass;