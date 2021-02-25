/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export type AnyFunction = (...args: any[]) => any;

export type AnyReadonly = {
    readonly [k: string]: AnyReadonly
    readonly [i: number]: AnyReadonly
}

export type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

export interface AnyClass {
    prototype: object,
    new (): any
    [key: string]: any;
}

export type Prototype<T> = T extends AnyClass ? T['prototype'] : never;

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type Primitive = undefined | null | boolean | string | number | Function

export type DeepReadonly<T> =
    T extends Primitive ? T :
        T extends Array<infer U> ? DeepReadonlyArray<U> :
            T extends Map<infer K, infer V> ? DeepReadonlyMap<K, V> : DeepReadonlyObject<T>
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
interface DeepReadonlyMap<K, V> extends ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> {}
type DeepReadonlyObject<T> = {
    readonly [K in keyof T]: DeepReadonly<T[K]>
}