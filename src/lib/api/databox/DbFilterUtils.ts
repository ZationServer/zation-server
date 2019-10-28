import {ForintQuery}   from "forint";
import {DbForintQuery} from "../../main/databox/dbDefinitions";

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