/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag        from "../../api/SmallBag";
import {IdCheckConfig} from "../configDefinitions/extraConfig";
import {ErrorName}     from "../constants/errorName";

export type IdChecker = (id : string) => Promise<Error | void>;

export default class IdCheckerUtils {

    /**
     * Returns a Closures for checking an id.
     * @param idCheckConfig
     * @param smallBag
     */
    static createIdChecker(idCheckConfig : IdCheckConfig,smallBag : SmallBag) : IdChecker {
        const func = idCheckConfig.idCheck;
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