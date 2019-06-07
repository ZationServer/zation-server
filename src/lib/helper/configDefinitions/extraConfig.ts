/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag from "../../api/SmallBag";

export type IdCheck = (id : string,smallBag : SmallBag) => Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void;

export interface IdCheckConfig {

    /**
     * Check if the id is valid or not.
     * To block the id, you only need to return an object (that can be error information) or false.
     * If you want to allow the id, you have to return nothing or a true.
     */
    idCheck ?: IdCheck
}