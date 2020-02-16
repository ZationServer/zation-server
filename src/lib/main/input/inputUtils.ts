/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyOfModelConfig, ObjectModelConfig} from "../config/definitions/inputConfig";

export default class InputUtils
{
    /**
     * Returns the input model at the path.
     * @param path
     * @param input
     * @param paramBased
     */
    static getModelAtPath(path: string[], input: object, paramBased: boolean): object | undefined
    {
        let tempConfig = input;
        let i = 0;
        while (i < path.length) {
            const k = path[i];
            if(!paramBased && tempConfig.hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties))) {
                //if not paramBase return the properties of the object
                tempConfig = tempConfig[nameof<ObjectModelConfig>(s => s.properties)];
            }
            else if(!paramBased && tempConfig.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf))) {
                //if not paramBase return the anyOf of the object
                tempConfig = tempConfig[nameof<AnyOfModelConfig>(s => s.anyOf)];
            }
            else {
                if(tempConfig.hasOwnProperty(k) && typeof tempConfig[k] === 'object') {
                    tempConfig = tempConfig[k];
                }
                else {
                    return undefined;
                }
                i++;
            }
            paramBased = false;
        }
        return tempConfig;
    }

    /**
     * Processes information about the controller path and
     * returns the keyPath (string array) and path (string).
     * @param path
     */
    static processPathInfo(path: string | string[]): {path: string,keyPath: string[]}
    {
        let keyPath: string[];
        //convert path to an array
        // noinspection SuspiciousTypeOfGuard
        if(typeof path === 'string') {
            if(path === '') {
                keyPath = [];
            }
            else{
                keyPath = path.split('.');
            }
        }
        else{
            keyPath = path;
            path = keyPath.join('.');
        }
        return {keyPath,path};
    }
}