/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {Model, ModelConfig} from '../config/definitions/parts/inputConfig';
import {isModelConfigTranslatable, modelConfigTranslateSymbol, updateModelConfigTranslatable} from '../../api/configTranslatable/modelConfigTranslatable';

export function updateModel(model: Model,update: (modelConfig:  ModelConfig) => void, flatClone: boolean) {
    if(isModelConfigTranslatable(model)) {
        let resolvedModel = model[modelConfigTranslateSymbol]();
        if(flatClone){
            model = {...model};
            resolvedModel = {...resolvedModel};
        }
        update(resolvedModel);

        updateModelConfigTranslatable(model,() => resolvedModel);
        return model;
    }
    else {
        let resolvedModel: ModelConfig = model as ModelConfig;
        if(flatClone){
            resolvedModel = {...resolvedModel};
        }
        update(resolvedModel);
        return resolvedModel;
    }
}