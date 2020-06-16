/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationToken        from "../internalApi/zationToken";
import AccessUtils        from "../access/accessUtils";
import Socket             from '../../api/Socket';
import {NormalAuthAccessCustomFunction} from "../config/definitions/parts/accessConfigs";
import {AccessConfigValue}              from '../access/accessOptions';
import {getNotableValue, isNotableNot, Notable} from '../../api/Notable';

export type TokenStateAccessCheckFunction = (socket: Socket) => Promise<boolean>;

export default class ReceiverAccessHelper
{
    /**
     * Returns a closure for checking the token state access to a receiver.
     * @param accessValue
     * @param receiver
     */
    static createAuthAccessChecker(accessValue: Notable<AccessConfigValue<NormalAuthAccessCustomFunction>> | undefined, receiver: string): TokenStateAccessCheckFunction {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<TokenStateAccessCheckFunction,NormalAuthAccessCustomFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (socket) => {
                    const token = socket.rawToken;
                    return func(token !== null ? new ZationToken(token): null);
                };
            },`Receiver: ${receiver}`);
        }
        //access is not defined
        return async () => false;
    }
}