/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DirectModel, Model}                       from './model';
import {MetaModel}                                from './metaModel';
// noinspection ES6PreferShortImport
import {ModelTranslatable, modelTranslateSymbol}  from '../../api/configTranslatable/modelTranslatable';
import {AnyOfModel, DefinitionModel, ObjectModel, ValueModel}        from './definitionModel';
import {ExtractNonStrictValidationType, ExtractStrictValidationType} from './validator/validationType';

type ExtractMultiType<T,ST extends boolean> = T extends string ?
    (ST extends true ? ExtractStrictValidationType<T> : ExtractNonStrictValidationType<T>) : never

type ExtractType<T,ST extends boolean> =
    T extends string[] ? ExtractMultiType<T[keyof T],ST> :
        T extends string ?
            (ST extends true ? ExtractStrictValidationType<T> : ExtractNonStrictValidationType<T>) : any;

type ExtractValueTypes<T extends any[] | Record<string,any>> = T extends any[] ? T[number] : T[keyof T];

type ExtractAnyOfModelTypes<T extends Model[] | Record<string,Model>> = {
    [key in keyof T]: ExtractModelType<T[key]>;
};

type ExtractAnyOfModelType<T extends AnyOfModel> = ExtractValueTypes<ExtractAnyOfModelTypes<T['anyOf']>>;

type ExtractValueModelType<T extends ValueModel> =
    T["convertType"] extends false ?
        T["strictType"] extends false ? ExtractType<T['type'],false> :
            ExtractType<T['type'],true> :
                ExtractType<T['type'],true>;

type ExtractObjectModelType<T extends Record<string,Model>> = {
    [key in keyof T]: ExtractModelType<T[key]>
}

type ExtractArrayModelType<T extends {"0": Model}> = (ExtractModelType<T["0"]>)[];

type ExtractMetaModelType<T extends MetaModel> =
    T['optional'] extends true ?
        T['canBeNull'] extends true ? undefined | null | ExtractDefinitionModelType<T["definitionModel"]> :
            undefined | ExtractDefinitionModelType<T["definitionModel"]> :
        T['canBeNull'] extends true ? null | ExtractDefinitionModelType<T["definitionModel"]> :
            ExtractDefinitionModelType<T["definitionModel"]>;

type ExtractDefinitionModelType<T extends DefinitionModel> =
    T extends {"0": Model} ? ExtractArrayModelType<T> :
        T extends ObjectModel ? ExtractObjectModelType<T["properties"]> :
            T extends ValueModel ? ExtractValueModelType<T> :
                T extends AnyOfModel ? ExtractAnyOfModelType<T> : any;

type ExtractDirectModelType<T extends DirectModel> =
    T extends DefinitionModel ? ExtractDefinitionModelType<T> :
        T extends MetaModel ? ExtractMetaModelType<T> : any;

export type ExtractModelType<T extends Model> =
    T extends DirectModel ? ExtractDirectModelType<T> :
        T extends ModelTranslatable ? ExtractDirectModelType<ReturnType<T[typeof modelTranslateSymbol]>> :
            T extends { new(): any, prototype: {} } ? T["prototype"] : any;