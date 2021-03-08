/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ControllerClass}      from '../Controller';
import {ReceiverClass}        from '../Receiver';
import {AnyDataboxClass}      from '../databox/AnyDataboxClass';
import {AnyChannelClass}      from '../channel/AnyChannelClass';
import ComponentUtils, {componentSymbol, componentTypeSymbol, familyTypeSymbol} from '../../main/component/componentUtils';

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
     * The API level of the Component from the app config.
     * It can be undefined if no API level is defined.
     */
    protected readonly apiLevel: number | undefined;

    constructor(identifier: string, apiLevel: number | undefined) {
        this.identifier = identifier;
        this.name = ComponentUtils.extractName(identifier);
        this.apiLevel = apiLevel;
    }

    toString(): string   {
        return `${ComponentUtils.getComponentType(this)}: '${
            this.identifier}'${this.apiLevel !== undefined ? ` with API level: '${this.apiLevel}'` : ''}`;
    }

    /**
     * **Can be overridden.**
     * @description
     * Gets once invoked at the start of the worker
     * after an instance is created of this Component.
     */
    initialize(): Promise<void> | void {
    }
}

Component[familyTypeSymbol] = false;
Component.prototype[familyTypeSymbol] = false;
Component.prototype[componentSymbol] = true;
Component.prototype[componentTypeSymbol] = 'Unknown';

export type ComponentClass = ControllerClass | ReceiverClass | AnyDataboxClass | AnyChannelClass;