/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {InputConfigTranslatable}        from "../../ConfigTranslatable";
import {ParamInput as ParamInputConfig} from "../../../main/config/definitions/inputConfig";
import {InDecoratorMem, InDM_Models}    from "./InDecoratorMem";

/**
 * A class decorator that will mark the class as a param based input config.
 * That means you can use the class as an input config.
 */
export const ParamInput = () => {
    return (target : any) => {
        const prototype : InDecoratorMem = target.prototype;

        const paramInput : ParamInputConfig =
            typeof prototype[InDM_Models] === 'object' ? prototype[InDM_Models]! : {};

        (target as InputConfigTranslatable).__toInputConfig = () => {
            return paramInput;
        };
    }
};