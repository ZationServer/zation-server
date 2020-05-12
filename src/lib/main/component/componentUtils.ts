/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import DynamicSingleton  from '../utils/dynamicSingleton';
import ComponentNotFound from '../error/componentNotFound';
import {ComponentClass}  from '../../api/Component';

export const componentTypeSymbol = Symbol();
export const familyTypeSymbol = Symbol();

export default class ComponentUtils {

    static getComponentType(component: ComponentClass): string {
        return component[componentTypeSymbol];
    }

    /**
     * This method loads the instance of the component and returns it.
     * If the instance is not found, the method throws an error.
     *
     * @param component
     */
    static getInstanceSafe<T extends ComponentClass>(component: T): T['prototype'] {
        const instance = DynamicSingleton.getInstance<T,T['prototype']>(component);
        if(instance === undefined) {
            throw new ComponentNotFound(component.name,ComponentUtils.getComponentType(component));
        }
        return instance;
    }
}