/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import AuthEngine         from "./authEngine";
import ZationTokenWrapper from "../internalApi/zationTokenWrapper";
import Bag                from "../../api/Bag";
import AccessUtils        from "../access/accessUtils";
import {NormalAuthAccessCustomFunction} from "../config/definitions/configComponents";
import {AccessConfigValue}              from '../access/accessOptions';
import {getNotableValue, isNotableNot, Notable} from '../../api/Notable';

export type TokenStateAccessCheckFunction = (authEngine: AuthEngine) => Promise<boolean>;

export default class AuthAccessChecker
{
    /**
     * Returns a closure for checking the token state access to a controller.
     * @param accessValue
     * @param bag
     */
    static createAuthAccessChecker(accessValue: Notable<AccessConfigValue<NormalAuthAccessCustomFunction>> | undefined, bag: Bag): TokenStateAccessCheckFunction {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,NormalAuthAccessCustomFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (authEngine) => {
                    const token = authEngine.getSHBridge().getToken();
                    return func(bag,token !== null ? new ZationTokenWrapper(token): null);
                };
            });
        }
        //access is not defined
        return async () => {
            return false;
        };
    }
}