/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {InputConfigTranslatable} from "../../ConfigTranslatable";
import {ParamInput as ParamInputConfig} from "../../../helper/configDefinitions/appConfig";

/**
 * A class decorator that will mark the class as a param based input config.
 * That means you can use the class as an input config.
 * @constructor
 */
export const ParamInput = () => {
    return (target : any) => {
        const prototype = target.prototype;

        const paramInput : ParamInputConfig =
            typeof prototype['___models___'] === 'object' ? prototype['___models___'] : {};

        (target as InputConfigTranslatable).__toInputConfig = () => {
            return paramInput;
        };
    }
};