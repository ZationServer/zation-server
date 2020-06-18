/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ParamInput as ParamInputConfig}       from "../../../main/config/definitions/parts/inputConfig";
import {InDecoratorMem, inDM_ModelsSymbol}    from "./InDecoratorMem";
// noinspection TypeScriptPreferShortImport
import {updateInputConfigTranslatable}        from '../../configTranslatable/inputConfigTranslatable';

/**
 * A class decorator that will mark the class as a param based input config.
 * That means you can use the class as an input config.
 * Notice that the constructor or any other methods not be called.
 * Only the properties marked with $Model will be transformed.
 * @example
 * @ParamInput()
 * class SendMessageParameter {
 *
 *  @Model({type: 'string'})
 *  content: string;
 *
 *  @Model(userId)
 *  receiver: string;
 *
 * }
 */
export const ParamInput = () => {
    return (target: any) => {
        const prototype: InDecoratorMem = target.prototype;

        const paramInput: ParamInputConfig =
            typeof prototype[inDM_ModelsSymbol] === 'object' ? prototype[inDM_ModelsSymbol]!: {};

        updateInputConfigTranslatable(target,() => paramInput);
    }
};