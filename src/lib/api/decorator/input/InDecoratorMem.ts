/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ObjectModelConfig} from "../../../main/config/definitions/inputConfig";
import {AnyClass, AnyModelConfigTranslatable} from "../../../main/config/definitions/configComponents";

export interface InDecoratorMem {
    ___constructorMethods___ ?: Function[];
    ___extends___ ?: string | ObjectModelConfig | AnyClass | AnyModelConfigTranslatable;
    ___models___ ?: Record<string,any>;
}