/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ConfigBuildError from '../config/manager/configBuildError';

/**
 * Parse the API level and name from a component class name.
 * @param name
 */
export function parseComponentClassName(name: string): {name: string,apiLevel?: number}
{
    const typeIndex = Math.max(name.indexOf('Controller'),name.indexOf('Databox'),name.indexOf('Channel'));
    if(typeIndex <= 0){
        throw new ConfigBuildError(`Cannot parse component class name: '${name}'. Check syntax.`);
    }

    let resName = name.slice(0,typeIndex);
    resName = resName.charAt(0).toLowerCase() + resName.slice(1);


    let resApiLevel;
    const versionSplitterIndex = name.indexOf('_',typeIndex);
    if(versionSplitterIndex !== -1){
        if((versionSplitterIndex + 1) < name.length){
            resApiLevel = parseInt(name.slice(versionSplitterIndex + 1));
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
export function checkComponentName(name: string) {
    if(name.indexOf('/') !== -1)
        throw new ConfigBuildError(`The component class name: ${name} can not contain slashes.`);
}

/**
 * Returns the component name from the identifier.
 * @param identifier
 */
export function extractComponentName(identifier: string) {
    const parts = identifier.split('/');
    return parts[parts.length -1];
}