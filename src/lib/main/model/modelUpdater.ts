/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ModelConfig}             from '../config/definitions/parts/inputConfig';
// noinspection TypeScriptPreferShortImport
import {resolveModelConfigTranslatable} from '../../api/configTranslatable/modelConfigTranslatable';

/**
 * Use this function carefully.
 * You only can change the optional and default
 * value of reusable models when flatClone is true.
 * @param model
 * @param update
 * @param flatClone
 */
export function updateModel(model: Model,update: (modelConfig:  ModelConfig) => void, flatClone: boolean): ModelConfig {
    model = resolveModelConfigTranslatable(model);
    if(flatClone){
        model = {...model};
    }
    update(model);
    return model;
}