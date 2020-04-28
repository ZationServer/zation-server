/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag                from "../../api/Bag";
import {ClientErrorName}  from "../constants/clientErrorName";

export type MemberValid = (id: string, bag: Bag) => Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void;
export type MemberValidChecker = (id: string) => Promise<void>;

export default class MemberValidCheckerUtils {

    /**
     * Returns a Closures for checking if an member is valid.
     * @param memberValidFunc
     * @param bag
     */
    static createMemberValidChecker(memberValidFunc: MemberValid | undefined, bag: Bag): MemberValidChecker {
        if(typeof memberValidFunc !== "function"){
            return async () => {}
        }
        else {
            return async (member) => {
                let res;
                try {
                    res = await memberValidFunc(member,bag);
                }
                catch (e) {
                    res = false;
                }
                const isObject = typeof res === 'object';
                if((typeof res === 'boolean' && !res) || isObject) {
                    const err: any = new Error(`The member: '${member}' is not valid.`);
                    err.name = ClientErrorName.MemberIsNotValid;
                    if(isObject){err.info = res;}
                    throw err;
                }
            }
        }
    }
}