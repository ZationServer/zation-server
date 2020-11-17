/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DefinitionModel, ObjectModel, ValueModel} from './definitionModel';
import {DirectModel, Model}                       from './model';
import {MetaModel}                                from './metaModel';
import {ModelTranslatable, modelTranslateSymbol}  from '../../api/configTranslatable/modelTranslatable';
import {extractNonStrictValidationType, extractStrictValidationType} from './validator/validationType';

type extractMultiType<T,ST extends boolean> = T extends string ?
    (ST extends true ? extractStrictValidationType<T> : extractNonStrictValidationType<T>) : never

type extractType<T,ST extends boolean> =
    T extends string[] ? extractMultiType<T[keyof T],ST> :
        T extends string ?
            (ST extends true ? extractStrictValidationType<T> : extractNonStrictValidationType<T>) : any;

type extractValueModelType<T extends ValueModel> =
    T["convertType"] extends false ?
        T["strictType"] extends false ? extractType<T['type'],false> :
            extractType<T['type'],true> :
                extractType<T['type'],true>;

type extractObjectModelType<T extends Record<string,Model>> = {
    [key in keyof T]: extractModelType<T[key]>
}

type extractArrayModelType<T extends {"0": Model}> = (extractModelType<T["0"]>)[];

type extractMetaModelType<T extends MetaModel> =
    T['optional'] extends true ?
        T['canBeNull'] extends true ? undefined | null | extractDefinitionModelType<T["definitionModel"]> :
            undefined | extractDefinitionModelType<T["definitionModel"]> :
        T['canBeNull'] extends true ? null | extractDefinitionModelType<T["definitionModel"]> :
            extractDefinitionModelType<T["definitionModel"]>;

type extractDefinitionModelType<T extends DefinitionModel> =
    T extends {"0": Model} ? extractArrayModelType<T> :
        T extends ObjectModel ? extractObjectModelType<T["properties"]> :
            T extends ValueModel ? extractValueModelType<T> : any

type extractDirectModelType<T extends DirectModel> =
    T extends DefinitionModel ? extractDefinitionModelType<T> :
        T extends MetaModel ? extractMetaModelType<T> : any;

export type extractModelType<T extends Model> =
    T extends DirectModel ? extractDirectModelType<T> :
        T extends ModelTranslatable ? extractDirectModelType<ReturnType<T[typeof modelTranslateSymbol]>> :
            T extends { new(): any, prototype: {} } ? T["prototype"] : any;