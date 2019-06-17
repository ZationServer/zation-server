/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ObjectModelConfig} from "../../../helper/configDefinitions/appConfig";
import {AnyClass, AnyModelConfigTranslatable} from "../../../helper/configDefinitions/configComponents";

export interface InDecoratorMem {
    ___constructorMethods___ ?: Function[];
    ___extends___ ?: string | ObjectModelConfig | AnyClass | AnyModelConfigTranslatable;
    ___models___ ?: Record<string,any>;
}