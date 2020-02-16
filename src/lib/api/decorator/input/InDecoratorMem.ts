/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ObjectModelConfig}                    from "../../../main/config/definitions/inputConfig";
import {AnyClass, AnyModelConfigTranslatable} from "../../../main/config/definitions/configComponents";

export const InDM_ConstructorMethods = Symbol();
export const InDM_Extends            = Symbol();
export const InDM_Models             = Symbol();

export interface InDecoratorMem {
    [InDM_ConstructorMethods]?: Function[];
    [InDM_Extends]?: string | ObjectModelConfig | AnyClass | AnyModelConfigTranslatable;
    [InDM_Models]?: Record<string,any>;
}