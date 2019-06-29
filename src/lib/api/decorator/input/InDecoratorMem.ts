/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ObjectModelConfig} from "../../../helper/config/definitions/inputConfig";
import {AnyClass, AnyModelConfigTranslatable} from "../../../helper/config/definitions/configComponents";

export interface InDecoratorMem {
    ___constructorMethods___ ?: Function[];
    ___extends___ ?: string | ObjectModelConfig | AnyClass | AnyModelConfigTranslatable;
    ___models___ ?: Record<string,any>;
}