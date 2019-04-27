/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ObjectModelConfig} from "../configDefinitions/appConfig";

export default class InputUtils
{
    /**
     * Returns the input model at the path.
     * @param path
     * @param input
     */
    static getModelAtPath(path : string[], input : object) : object | undefined
    {
        let tempConfig = input;
        let lastIrritate = path.length -1;
        for(let i = 0; i < path.length; i++)
        {
            const k = path[i];
            if(tempConfig.hasOwnProperty(k) && typeof tempConfig[k] === 'object')
            {
                if(tempConfig[k].hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties))
                    && i < lastIrritate) {
                    //if not end of inputPath return the properties of the object
                    tempConfig = tempConfig[k][nameof<ObjectModelConfig>(s => s.properties)];
                }
                else {
                    tempConfig = tempConfig[k];
                }
            }
            else {
                return undefined;
            }
        }
        return tempConfig;
    }
}