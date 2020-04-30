/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import AuthEngine         from "../auth/authEngine";
import ZationTokenWrapper from "../internalApi/zationTokenWrapper";
import Bag                from "../../api/Bag";
import AccessUtils        from "../access/accessUtils";
import {NormalAuthAccessCustomFunction} from "../config/definitions/parts/configComponents";
import {AccessConfigValue}              from '../access/accessOptions';
import {getNotableValue, isNotableNot, Notable} from '../../api/Notable';

export type TokenStateAccessCheckFunction = (authEngine: AuthEngine) => Promise<boolean>;

export default class ControllerAccessHelper
{
    /**
     * Returns a closure for checking the token state access to a controller.
     * @param accessValue
     * @param bag
     * @param cName
     */
    static createAuthAccessChecker(accessValue: Notable<AccessConfigValue<NormalAuthAccessCustomFunction>> | undefined, bag: Bag,cName: string): TokenStateAccessCheckFunction {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,NormalAuthAccessCustomFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (authEngine) => {
                    const token = authEngine.socket.authToken;
                    return func(bag,token !== null ? new ZationTokenWrapper(token): null);
                };
            },`Controller: ${cName}`);
        }
        //access is not defined
        return async () => false;
    }
}