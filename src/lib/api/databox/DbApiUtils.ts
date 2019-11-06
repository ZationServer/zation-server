import {ForintQuery}   from "forint";
import {DbForintQuery, IfQuery} from "../../main/databox/dbDefinitions";

/**
 * @description
 * Util function for creating a value filter for databox cud actions.
 * @example
 * await db.update([$value({name : 'Luca'}),'name'],'luca');
 * @param query
 */
export function $value<T>(query : ForintQuery<T>) : DbForintQuery {
    return {value : query};
}

/**
 * @description
 * Util function for creating a key filter for databox cud actions.
 * @example
 * await db.update([$key({$gt : 45453}),'name'],'luca');
 * @param query
 */
export function $key<T>(query : ForintQuery<T>) : DbForintQuery {
    return {key : query};
}

/**
 * @description
 * Util function for creating a pair (key and value) filter for databox cud actions.
 * @example
 * await db.update([$pair({$gt : 45453},{age : {$gt : 18}}),'cool'],true);
 * @param keyQuery
 * @param valueQuery
 */
export function $pair<TK,TV>(keyQuery : ForintQuery<TK>,valueQuery : ForintQuery<TV>) : DbForintQuery {
    return {key : keyQuery,value : valueQuery};
}

/**
 * @description
 * Databox filter constant to select all values.
 * @example
 * await db.update([$all,'online'],true);
 */
export const $all = Object.freeze({});

/**
 * @description
 * Util function for creating an if condition for cud operations of databoxes.
 * It creates a condition that at least one item must match with the provided query.
 * @example
 * await db.update(['34','name'],'luca',{if : $contains($key('35'))});
 * @param query
 */
export function $contains<TK,TV>(query : DbForintQuery<TK,TV>) : IfQuery {
    return query;
}

/**
 * @description
 * Util function for creating an if condition for cud operations of databoxes.
 * It creates a condition that none of the items should match with the provided query.
 * @example
 * await db.update(['34','name'],'luca',{if : $notContains($key('39'))});
 * @param query
 */
export function $notContains<TK,TV>(query : DbForintQuery<TK,TV>) : IfQuery {
    return {...query,not : true};
}

/**
 * @description
 * Util constant for creating an if condition for cud operations of databoxes.
 * With this constant, you can check if any element or none element exists.
 * @example
 * await db.insert(['41'],{name : 'Max',age : 10},{if : $notContains($any)});
 */
export const $any = Object.freeze({});