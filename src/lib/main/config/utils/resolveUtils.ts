/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {isModelConfigTranslatable} from "../../../api/ConfigTranslatable";

export default class ResolveUtils
{
    /**
     * Will resolve model config translatable object and returns the target object.
     */
    static modelResolveCheck(obj) {
        const resolvedObjects : object[] = [];
        while (isModelConfigTranslatable(obj) && !resolvedObjects.includes(obj)){
            resolvedObjects.push(obj);
            obj = obj.__toModelConfig();
        }
        return obj;
    }

}