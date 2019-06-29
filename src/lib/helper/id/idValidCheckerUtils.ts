/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag        from "../../api/SmallBag";
import {IdValid}       from "../config/definitions/configComponents";
import {ErrorName}     from "../constants/errorName";

export type IdValidChecker = (id : string) => Promise<void>;

export default class IdValidCheckerUtils {

    /**
     * Returns a Closures for checking if an id is valid.
     * @param idValidFunc
     * @param smallBag
     */
    static createIdValidChecker(idValidFunc : IdValid | undefined, smallBag : SmallBag) : IdValidChecker {
        if(typeof idValidFunc !== "function"){
            return async () => {}
        }
        else {
            return async (id) => {
                const res = await idValidFunc(id,smallBag);
                const isObject = typeof res === 'object';
                if((typeof res === 'boolean' && !res) || isObject) {
                    const err : any = new Error(`The id: '${id}' is not valid.`);
                    err.name = ErrorName.ID_IS_NOT_VALID;
                    if(isObject){err.info = res;}
                    return err;
                }
                else {
                    return;
                }
            }
        }
    }
}