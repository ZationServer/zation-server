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

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };