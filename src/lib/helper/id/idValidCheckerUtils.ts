/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag        from "../../api/SmallBag";
import {IdValidConfig} from "../configDefinitions/configComponents";
import {ErrorName}     from "../constants/errorName";

export type IdValidChecker = (id : string) => Promise<Error | void>;

export default class IdValidCheckerUtils {

    /**
     * Returns a Closures for checking if an id is valid.
     * @param idValidConfig
     * @param smallBag
     */
    static createIdValidChecker(idValidConfig : IdValidConfig, smallBag : SmallBag) : IdValidChecker {
        const func = idValidConfig.idValid;
        if(typeof func !== "function"){
            return async () => {}
        }
        else {
            return async (id) => {
                const res = await func(id,smallBag);
                const isObject = typeof res === 'object';
                if((typeof res === 'boolean' && !res) || isObject) {
                    const err : any = new Error(`The id: '${id}' is not valid.`);
                    err.code = 4845;
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