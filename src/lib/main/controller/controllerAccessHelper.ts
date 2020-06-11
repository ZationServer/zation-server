/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import AuthEngine         from "../auth/authEngine";
import ZationToken        from "../internalApi/zationToken";
import Bag                from "../../api/Bag";
import AccessUtils        from "../access/accessUtils";
import {NormalAuthAccessCustomFunction} from "../config/definitions/parts/accessConfigs";
import {AccessConfigValue}              from '../access/accessOptions';
import {getNotableValue, isNotableNot, Notable} from '../../api/Notable';

export type TokenStateAccessCheckFunction = (authEngine: AuthEngine) => Promise<boolean>;

export default class ControllerAccessHelper
{
    /**
     * Returns a closure for checking the token state access to a controller.
     * @param accessValue
     * @param bag
     * @param controller
     */
    static createAuthAccessChecker(accessValue: Notable<AccessConfigValue<NormalAuthAccessCustomFunction>> | undefined, bag: Bag,controller: string): TokenStateAccessCheckFunction {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,NormalAuthAccessCustomFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (authEngine) => {
                    const token = authEngine.socket.authToken;
                    return func(bag,token !== null ? new ZationToken(token): null);
                };
            },`Controller: ${controller}`);
        }
        //access is not defined
        return async () => false;
    }
}