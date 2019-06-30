/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import {ZationChannel}      from "../constants/internal";
import {ChannelPrepare}     from "./channelPrepare";
import SocketInfo           from "../infoObjects/socketInfo";
import SmallBag             from "../../api/SmallBag";
import CChInfo              from "../infoObjects/cChInfo";
import ChUtils              from "./chUtils";
import PubData              from "../infoObjects/pubData";
import AuthEngine           from "../auth/authEngine";
import AccessUtils, {AccessProcess} from "../access/accessUtils";
import {
    CChannelClientPubAccessFunction,
    CChannelSubAccessFunction,
} from "../config/definitions/channelsConfig";

export type ChSubAccessChecker =
    (authEngine : AuthEngine, socketInfo : SocketInfo, chInfo : CChInfo) => Promise<boolean>

export type ChPubAccessChecker =
    (authEngine : AuthEngine, pubData : PubData, socketInfo : SocketInfo, chInfo : CChInfo | string | undefined) => Promise<boolean>

/**
 * Helper class for channel access.
 */
export default class ChAccessHelper
{
    /**
     * Returns a Closures for checking the client publish access to a channel.
     * @param accessValue
     * @param invertResult
     * @param smallBag
     */
    static createPubChAccessChecker
    (
        accessValue : any,
        invertResult : boolean | undefined,
        smallBag : SmallBag)
        : ChPubAccessChecker
    {
        if(accessValue !== undefined) {
            const accessProcess : AccessProcess = invertResult ? (b) => !b : (b) => b;
            return AccessUtils.createAccessChecker<ChPubAccessChecker,CChannelClientPubAccessFunction>
            (accessValue,accessProcess,(f) => {
                return async (_a,pubData,socketInfo,chInfo) => {
                    return accessProcess((await f(smallBag,pubData,socketInfo,chInfo)));
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
     * @param smallBag
     */
    static createSubChAccessChecker
    (
        accessValue : any,
        invertResult : boolean | undefined,
        smallBag : SmallBag)
        : ChSubAccessChecker
    {
        if(accessValue !== undefined) {
            const accessProcess : AccessProcess = invertResult ? (b) => !b : (b) => b;
            return AccessUtils.createAccessChecker<ChSubAccessChecker,CChannelSubAccessFunction>
            (accessValue,accessProcess,(f) => {
                return async (_a,socketInfo,chInfo) => {
                    return accessProcess((await f(smallBag,socketInfo,chInfo)));
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

        for(let i = 0; i < subs.length; i++) {
            if(subs[i].indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1) {
                const chInfo = ChUtils.getCustomIdChannelInfo(subs[i]);
                const preChInfo = channelPrepare.getSafeCustomIdChInfo(chInfo.name);

                if(!(await preChInfo.subscribeAccessChecker(
                    authEngine,
                    socket.socketInfo,
                    chInfo
                ))) {
                    ChUtils.kickOut(socket,subs[i]);
                }
            }
            else if(subs[i].indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1) {
                const name = ChUtils.getCustomChannelName(subs[i]);
                const preChInfo = channelPrepare.getSafeCustomChInfo(name);

                if(!(await preChInfo.subscribeAccessChecker(
                    authEngine,
                    socket.socketInfo,
                    {name}
                ))) {
                    ChUtils.kickOut(socket,subs[i]);
                }
            }
        }
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
            else if(subs[i].indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1) {
                const authGroupSub = ChUtils.getUserAuthGroupFromCh(subs[i]);
                if(authGroupSub !== authEngine.getAuthUserGroup()) {
                    ChUtils.kickOut(socket,subs[i]);
                }
            }
            else if(subs[i].indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1) {
                //only onw '=' user id can also be a number.
                if(authEngine.getUserId() != ChUtils.getUserIdFromCh(subs[i])) {
                    ChUtils.kickOut(socket,subs[i]);
                }
            }
            else if(subs[i] === ZationChannel.PANEL_OUT && !authEngine.hasPanelAccess()) {
                ChUtils.kickOut(socket,subs[i]);
            }
        }
    }

}
