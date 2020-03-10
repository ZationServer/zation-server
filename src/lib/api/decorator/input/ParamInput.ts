/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ParamInput as ParamInputConfig}       from "../../../main/config/definitions/parts/inputConfig";
import {InDecoratorMem, inDM_ModelsSymbol}    from "./InDecoratorMem";
// noinspection TypeScriptPreferShortImport
import {updateInputConfigTranslatable}        from '../../../api/configTranslatable/inputConfigTranslatable';

/**
 * A class decorator that will mark the class as a param based input config.
 * That means you can use the class as an input config.
 */
export const ParamInput = () => {
    return (target: any) => {
        const prototype: InDecoratorMem = target.prototype;

        const paramInput: ParamInputConfig =
            typeof prototype[inDM_ModelsSymbol] === 'object' ? prototype[inDM_ModelsSymbol]!: {};

        updateInputConfigTranslatable(target,() => paramInput);
    }
};