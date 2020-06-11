/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

export type DeepReadonly<T> =
// tslint:disable-next-line: ban-types
    T extends  AnyFunction | Primitive ? T :
        T extends ReadonlyArray<infer R> ? IDRArray<R> :
            T extends ReadonlyMap<infer K, infer V> ? IDRMap<K, V> :
                T extends ReadonlySet<infer ItemType>? ReadonlySetDeep<ItemType>:
                    T extends object ? DRObject<T> :
                        T
export type Primitive =
    | null
    | undefined
    | string
    | number
    | boolean
    | symbol
    | bigint
export type AnyFunction = (...args: any[]) => any
export interface IDRArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
export type DRObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
}
export interface IDRMap<K, V> extends ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> {}
export interface ReadonlySetDeep<ItemType>
    extends ReadonlySet<DeepReadonly<ItemType>> {}