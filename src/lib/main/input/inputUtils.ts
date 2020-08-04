/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyOfModel, ObjectModel, DefinitionModel} from '../models/definitionModel';
import {unwrapIfMetaModel}                        from '../models/metaModel';

export default class InputUtils
{
    /**
     * Returns the input model at the path.
     * @param path
     * @param input
     */
    static getModelAtPath(path: string[], input: DefinitionModel): object | undefined {

        if(path.length <= 0) return input;

        let tempConfig: any = input;
        let i = 0;
        let k: string;

        while (i < path.length) {
            k = path[i];
            tempConfig = unwrapIfMetaModel(tempConfig);
            if(tempConfig.hasOwnProperty(nameof<ObjectModel>(s => s.properties))){
                tempConfig = tempConfig[nameof<ObjectModel>(s => s.properties)];
                continue;
            }
            else if(tempConfig.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))){
                tempConfig = tempConfig[nameof<AnyOfModel>(s => s.anyOf)];
                continue;
            }
            else if(Array.isArray(tempConfig)){
                if(k === 'type'){
                    tempConfig = tempConfig[0];
                    i++;
                    continue;
                }
                else return undefined;
            }
            if(typeof tempConfig[k] === 'object') {
                tempConfig = tempConfig[k];
            }
            else return undefined;
            i++;
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