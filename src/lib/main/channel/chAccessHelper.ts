/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZSocket              from "../internalApi/zSocket";
import Bag                  from "../../api/Bag";
import AuthEngine           from "../auth/authEngine";
import AccessUtils          from "../access/accessUtils";
import {ChannelInfo}        from './channelDefinitions';
import {AccessConfigValue}  from '../access/accessOptions';
import {getNotableValue, isNotableNot, Notable} from '../../api/Notable';
import {ChSubAccessFunction} from '../config/definitions/parts/channelConfig';

export type ChSubAccessCheckFunction = (authEngine: AuthEngine, socket: ZSocket, info: ChannelInfo) => Promise<boolean>

/**
 * Helper class for channel access.
 */
export default class ChAccessHelper
{
    /**
     * Returns a closure for checking the subscribe access to the Channel.
     * @param accessValue
     * @param bag
     * @param channelIdentifier
     */
    static createSubAccessChecker(accessValue: Notable<AccessConfigValue<ChSubAccessFunction>> | undefined, bag: Bag, channelIdentifier: string): ChSubAccessCheckFunction
    {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<ChSubAccessCheckFunction,ChSubAccessFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (_a,socket,info) => {
                    return func(bag,socket,info);
                };
            },`Channel: ${channelIdentifier}`);
        }
        //access is not defined
        return async () => {
            return false;
        };
    }
}
