/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AnyOfModel, ObjectModel, ParamInput, SingleModelInput} from '../config/definitions/parts/inputConfig';
import {unwrapIfOptionalModel}                                 from '../models/optionalModel';

export default class InputUtils
{
    /**
     * Returns the input model at the path.
     * @param path
     * @param input
     * @param paramBased
     */
    static getModelAtPath(path: string[], input: SingleModelInput | ParamInput, paramBased: boolean): object | undefined {
        let tempConfig: any = input;
        let i = 0;

        if(path.length > 0){
            if(!paramBased){
                //resolve single input
                tempConfig = tempConfig[0];
            }
            while (i < path.length) {
                const k = path[i];
                if(!paramBased){
                    tempConfig = unwrapIfOptionalModel(tempConfig);
                    if(tempConfig.hasOwnProperty(nameof<ObjectModel>(s => s.properties))){
                        //if not paramBase return the properties of the object
                        tempConfig = tempConfig[nameof<ObjectModel>(s => s.properties)];
                        continue;
                    }
                    else if(tempConfig.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))){
                        //if not paramBase return the anyOf of the object
                        tempConfig = tempConfig[nameof<AnyOfModel>(s => s.anyOf)];
                        continue;
                    }
                    else if(Array.isArray(tempConfig)){
                        if(k === 'type'){
                            //resolve array
                            tempConfig = tempConfig[0];
                            i++;
                            //param based already false.
                            continue;
                        }
                        else {
                            return undefined;
                        }
                    }
                }
                if(typeof tempConfig[k] === 'object') {
                    tempConfig = tempConfig[k];
                }
                else {
                    return undefined;
                }
                i++;
                paramBased = false;
            }
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