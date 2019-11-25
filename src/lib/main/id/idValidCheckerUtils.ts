/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag                from "../../api/Bag";
import {ClientErrorName}  from "../constants/clientErrorName";

export type IdValid = (id : string, bag : Bag) => Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void;
export type IdValidChecker = (id : string) => Promise<void>;

export default class IdValidCheckerUtils {

    /**
     * Returns a Closures for checking if an id is valid.
     * @param idValidFunc
     * @param bag
     */
    static createIdValidChecker(idValidFunc : IdValid | undefined, bag : Bag) : IdValidChecker {
        if(typeof idValidFunc !== "function"){
            return async () => {}
        }
        else {
            return async (id) => {
                const res = await idValidFunc(id,bag);
                const isObject = typeof res === 'object';
                if((typeof res === 'boolean' && !res) || isObject) {
                    const err : any = new Error(`The id: '${id}' is not valid.`);
                    err.name = ClientErrorName.ID_IS_NOT_VALID;
                    if(isObject){err.info = res;}
                    throw err;
                }
            }
        }
    }
}