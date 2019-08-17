/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import {ChannelPrepare}     from "./channelPrepare";
import ZSocket              from "../internalApi/ZSocket";
import Bag                  from "../../api/Bag";
import CChInfo              from "../internalApi/cChInfo";
import ChUtils              from "./chUtils";
import PubData              from "../internalApi/pubData";
import AuthEngine           from "../auth/authEngine";
import AccessUtils, {AccessProcess} from "../access/accessUtils";
import {
    CChannelClientPubAccessFunction,
    CChannelSubAccessFunction,
} from "../config/definitions/channelsConfig";
import CChFamilyInfo   from "../internalApi/cChFamilyInfo";
import {ZationChannel} from "./channelDefinitions";

export type ChSubAccessChecker =
    (authEngine : AuthEngine, socketInfo : ZSocket, chInfo : CChInfo | CChFamilyInfo) => Promise<boolean>

export type ChPubAccessChecker =
    (authEngine : AuthEngine, pubData : PubData, socketInfo : ZSocket, chInfo : CChInfo | CChFamilyInfo | string | undefined) => Promise<boolean>

/**
 * Helper class for channel access.
 */
export default class ChAccessHelper
{
    /**
     * Returns a Closures for checking the client publish access to a channel.
     * @param accessValue
     * @param invertResult
     * @param bag
     */
    static createPubChAccessChecker
    (
        accessValue : any,
        invertResult : boolean | undefined,
        bag : Bag)
        : ChPubAccessChecker
    {
        if(accessValue !== undefined) {
            const accessProcess : AccessProcess = invertResult ? (b) => !b : (b) => b;
            return AccessUtils.createAccessChecker<ChPubAccessChecker,CChannelClientPubAccessFunction>
            (accessValue,accessProcess,(f) => {
                return async (_a,pubData,socketInfo,chInfo) => {
                    return accessProcess((await f(bag,pubData,socketInfo,chInfo)));
                };
            });
        }
        else {
            return async () => {return false;}
        }
    }

    /**
     * Returns a Closures for checking the subscribe access to a channel.
     * @param accessValue
     * @param invertResult
     * @param bag
     */
    static createSubChAccessChecker
    (
        accessValue : any,
        invertResult : boolean | undefined,
        bag : Bag)
        : ChSubAccessChecker
    {
        if(accessValue !== undefined) {
            const accessProcess : AccessProcess = invertResult ? (b) => !b : (b) => b;
            return AccessUtils.createAccessChecker<ChSubAccessChecker,CChannelSubAccessFunction>
            (accessValue,accessProcess,(f) => {
                return async (_a,socketInfo,chInfo) => {
                    return accessProcess((await f(bag,socketInfo,chInfo)));
                };
            });
        }
        else {
            return async () => {return false;}
        }
    }

    //Part Check Access auto
    //(When the token changed)

    /**
     * Checks the socket subscribe access to custom and custom id channels.
     * @param socket
     * @param channelPrepare
     */
    static async checkSocketCustomChAccess(socket : UpSocket, channelPrepare : ChannelPrepare) : Promise<void>
    {
        const subs = socket.subscriptions();
        const authEngine = socket.authEngine;

        try {
            for(let i = 0; i < subs.length; i++) {
                if(subs[i].indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) === 0){
                    const chInfo = ChUtils.getCustomChannelInfo(subs[i]);
                    const preChInfo = channelPrepare.getCustomChPreInfo(chInfo.name);
                    if(!(await preChInfo.subscribeAccessChecker(
                        authEngine,
                        socket.zSocket,
                        chInfo
                    ))) {
                        ChUtils.kickOut(socket,subs[i]);
                    }
                }
            }
        }
        catch (e) {}
    }

    /**
     * Checks the socket subscribe access to main zation channels.
     * @param socket
     */
    static checkSocketZationChAccess(socket : UpSocket) : void
    {
        const subs = socket.subscriptions();
        const authEngine = socket.authEngine;

        for(let i = 0; i < subs.length; i++) {
            if(subs[i] === ZationChannel.DEFAULT_USER_GROUP && authEngine.isAuth()) {
                ChUtils.kickOut(socket,ZationChannel.DEFAULT_USER_GROUP);
            }
            else if(subs[i].indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) === 0) {
                if(ZationChannel.AUTH_USER_GROUP_PREFIX + authEngine.getAuthUserGroup() !== subs[i]) {
                    ChUtils.kickOut(socket,subs[i]);
                }
            }
            else if(subs[i].indexOf(ZationChannel.USER_CHANNEL_PREFIX) === 0) {
                if(ZationChannel.USER_CHANNEL_PREFIX + authEngine.getUserId() !== subs[i]) {
                    ChUtils.kickOut(socket,subs[i]);
                }
            }
            else if(subs[i] === ZationChannel.PANEL_OUT && !authEngine.hasPanelAccess()) {
                ChUtils.kickOut(socket,subs[i]);
            }
        }
    }

}
