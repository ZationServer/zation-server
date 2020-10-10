/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export type RelationOrArray<T = any> = T[];

// noinspection JSUnusedGlobalSymbols
/**
 * Creates a RelationOrArray means that
 * all items in the array are related with or.
 * @param items
 */
export function $or(...items: any[]): RelationOrArray {
    return items;
}

const relationAndArraySymbol = Symbol();

export type RelationAndArray<T = any> = T[] & {[relationAndArraySymbol]: true};

// noinspection JSUnusedGlobalSymbols
/**
 * Creates a RelationAndArray means that all
 * items in the array are related with and.
 * @param items
 */
export function $and(...items: any[]): RelationAndArray {
    items[relationAndArraySymbol] = true;
    return items as RelationAndArray;
}

export function isRelationAndArray(value: any): boolean {
    return Array.isArray(value) && value[relationAndArraySymbol];
}
