/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Socket               from "../../api/Socket";
import AccessUtils          from "../access/accessUtils";
import {ChannelInfo}        from './channelDefinitions';
import {AccessConfigValue}  from '../access/accessOptions';
import {getNotableValue, isNotableNot, Notable} from '../../api/Notable';
import {ChSubAccessFunction} from '../config/definitions/parts/channelConfig';

export type ChSubAccessCheckFunction = (socket: Socket, info: ChannelInfo) => Promise<boolean>

/**
 * Helper class for channel access.
 */
export default class ChAccessHelper
{
    /**
     * Returns a closure for checking the subscribe access to the Channel.
     * @param accessValue
     * @param channelIdentifier
     */
    static createSubAccessChecker(accessValue: Notable<AccessConfigValue<ChSubAccessFunction>> | undefined, channelIdentifier: string): ChSubAccessCheckFunction
    {
        const rawValue = getNotableValue(accessValue);
        if(rawValue !== undefined){
            return AccessUtils.createAccessChecker<ChSubAccessCheckFunction,ChSubAccessFunction>
            (rawValue,isNotableNot(accessValue),(func) => {
                return async (socket,info) => {
                    return func(socket,info);
                };
            },`Channel: ${channelIdentifier}`);
        }
        //access is not defined
        return async () => {
            return false;
        };
    }
}
