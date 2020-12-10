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

type TypeofMultiValueType<T,ST extends boolean> = T extends string ?
    (ST extends true ? ExtractStrictValidationType<T> : ExtractNonStrictValidationType<T>) : never

type TypeofValueType<T,ST extends boolean> =
    T extends string[] ? TypeofMultiValueType<T[keyof T],ST> :
        T extends string ?
            (ST extends true ? ExtractStrictValidationType<T> : ExtractNonStrictValidationType<T>) : any;

type TypeofValueTypes<T extends any[] | Record<string,any>> = T extends any[] ? T[number] : T[keyof T];

type TypeofAnyOfModelValue<T extends Model[] | Record<string,Model>> = {
    [key in keyof T]: TypeofModel<T[key]>;
};

type TypeofAnyOfModel<T extends AnyOfModel> = TypeofValueTypes<TypeofAnyOfModelValue<T['anyOf']>>;

type TypeofValueModel<T extends ValueModel> =
    T["convertType"] extends false ?
        T["strictType"] extends false ? TypeofValueType<T['type'],false> :
            TypeofValueType<T['type'],true> :
                TypeofValueType<T['type'],true>;

type TypeofObjectModel<T extends Record<string,Model>> = {
    [key in keyof T]: TypeofModel<T[key]>
}

type TypeofArrayModel<T extends {"0": Model}> = (TypeofModel<T["0"]>)[];

type TypeofMetaModel<T extends MetaModel> =
    T['optional'] extends true ?
        T['canBeNull'] extends true ? undefined | null | TypeofDefinitionModel<T["definitionModel"]> :
            undefined | TypeofDefinitionModel<T["definitionModel"]> :
        T['canBeNull'] extends true ? null | TypeofDefinitionModel<T["definitionModel"]> :
            TypeofDefinitionModel<T["definitionModel"]>;

type TypeofDefinitionModel<T extends DefinitionModel> =
    T extends {"0": Model} ? TypeofArrayModel<T> :
        T extends ObjectModel ? TypeofObjectModel<T["properties"]> :
            T extends ValueModel ? TypeofValueModel<T> :
                T extends AnyOfModel ? TypeofAnyOfModel<T> : any;

type TypeofDirectModel<T extends DirectModel> =
    T extends DefinitionModel ? TypeofDefinitionModel<T> :
        T extends MetaModel ? TypeofMetaModel<T> : any;

export type TypeofModel<T extends Model> =
    T extends DirectModel ? TypeofDirectModel<T> :
        T extends ModelTranslatable ? TypeofDirectModel<ReturnType<T[typeof modelTranslateSymbol]>> :
            T extends { new(): any, prototype: {} } ? T["prototype"] : any;