/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationToken        from "../internalApi/zationToken";
import AccessUtils        from "../access/accessUtils";
import {NormalAuthAccessCustomFunction} from "../config/definitions/parts/accessConfigs";
import {AccessConfigValue}              from '../access/accessOptions';
import {getNotableValue, isNotableNot, Notable} from '../../api/Notable';
import Socket                                   from '../../api/Socket';

export type TokenStateAccessCheckFunction = (socket: Socket) => Promise<boolean>;

export default class ControllerAccessHelper
{
    /**
     * Returns a closure for checking the token state access to a controller.
     * @param accessValue
     * @param controller
     */
    static createAuthAccessChecker(accessValue: Notable<AccessConfigValue<NormalAuthAccessCustomFunction>> | undefined, controller: string): TokenStateAccessCheckFunction {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,NormalAuthAccessCustomFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (socket) => {
                    const token = socket.rawToken;
                    return func(token !== null ? new ZationToken(token): null);
                };
            },`Controller: ${controller}`);
        }
        //access is not defined
        return async () => false;
    }
}