/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Bag                from "../../api/Bag";
import {ClientErrorName}  from "../definitions/clientErrorName";

export type IsMember = (value: string, bag: Bag) => Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void;
export type IsMemberChecker = (value: string) => Promise<void>;

export default class MemberCheckerUtils {

    /**
     * Returns a Closures for checking if the value is a member.
     * @param memberValidFunc
     * @param bag
     */
    static createIsMemberChecker(memberValidFunc: IsMember | undefined, bag: Bag): IsMemberChecker {
        if(typeof memberValidFunc !== "function"){
            return async () => {}
        }
        else {
            return async (value) => {
                let res;
                try {
                    res = await memberValidFunc(value,bag);
                }
                catch (e) {
                    res = false;
                }
                const isObject = typeof res === 'object';
                if((typeof res === 'boolean' && !res) || isObject) {
                    const err: any = new Error(`'${value}' is not a member.`);
                    err.name = ClientErrorName.InvalidMember;
                    if(isObject){err.info = res;}
                    throw err;
                }
            }
        }
    }
}