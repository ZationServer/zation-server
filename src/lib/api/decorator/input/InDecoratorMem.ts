/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const inDM_ConstructorMethodsSymbol = Symbol();
export const inDM_ModelsSymbol             = Symbol();

export interface InDecoratorMem {
    [inDM_ConstructorMethodsSymbol]?: Function[];
    [inDM_ModelsSymbol]?: Record<string,any>;
}