/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Component, {ComponentClass}       from '../../api/component/Component';
import ComponentPrepare, {ComponentInfo} from './componentPrepare';
import * as ObjectPath                   from 'object-path';
import ConfigBuildError                  from '../config/manager/configBuildError';

export const componentSymbol = Symbol();
export const componentTypeSymbol = Symbol();
export const familyTypeSymbol = Symbol();

export default class ComponentUtils {

    static getComponentType(component: Component): string {
        return component[componentTypeSymbol];
    }

    static isFamily(component: ComponentClass | Component): boolean {
        return component[familyTypeSymbol];
    }

    /**
     * Parse the API level and name from a component class name.
     * @param name
     */
    static parseClassName(name: string): {name: string,apiLevel?: number}
    {
        const typeIndex = Math.max(name.indexOf('Controller'),name.indexOf('Receiver'),
            name.indexOf('Databox'),name.indexOf('Channel'));
        const versionSplitterIndex = name.lastIndexOf('_');

        let resName
        if(typeIndex <= 0){
            resName = versionSplitterIndex !== -1 ? (name.slice(0,versionSplitterIndex)) : name;
        }
        else {
            resName = name.slice(0,typeIndex);
        }
        resName = resName.charAt(0).toLowerCase() + resName.slice(1);


        let resApiLevel;
        if(versionSplitterIndex !== -1){
            if((versionSplitterIndex + 1) < name.length){
                resApiLevel = parseInt(name.slice(versionSplitterIndex + 1));
                if(isNaN(resApiLevel)){
                    throw new ConfigBuildError(`Cannot parse component class name: '${name
                    }'. API level must be a number. Check syntax.`);
                }
            }
            else {
                throw new ConfigBuildError(`Cannot parse component class name: '${name
                }'. API level not defined but marked with an underscore. Check syntax.`);
            }
        }

        return {
            name: resName,
            apiLevel: resApiLevel
        }
    }

    /**
     * Checks the component class name.
     * @param name
     */
    static checkName(name: string) {
        if(name.indexOf('/') !== -1)
            throw new ConfigBuildError(`The component class name: ${name} can not contain slashes.`);
    }

    /**
     * Returns the component name from the identifier.
     * @param identifier
     */
    static extractName(identifier: string) {
        const parts = identifier.split('/');
        return parts[parts.length -1];
    }

    static buildTreeInfoStructure(includeSystemComp: boolean, ...compPrepares: ComponentPrepare<any,any>[]) {
        const structure = {};
        let tmpSplit;
        let tmpInfo: ComponentInfo;
        let tmpApiLevels: number[] | null;
        for(let i = 0; i < compPrepares.length; i++) {
            const componentsInfo = compPrepares[i].getComponentsInfo();
            for(const identifier in componentsInfo) {
                if(componentsInfo.hasOwnProperty(identifier)){
                    if(!includeSystemComp && identifier.startsWith('#')) continue;

                    tmpSplit = identifier.split('/');
                    tmpInfo = componentsInfo[identifier];
                    tmpApiLevels = tmpInfo.apiLevels;
                    ObjectPath.set(structure,tmpSplit,
                        `(${compPrepares[i].getComponentType()}${tmpInfo.family ? 'Family' : ''})` +
                        `${tmpApiLevels !== null ? ` (API-Level${tmpApiLevels.length > 1 ? 's' : ''}: ${
                            tmpApiLevels.sort((a,b) => (a - b)).join(', ')})` : ''
                    }`);
                }
            }
        }
        return structure;
    }

}