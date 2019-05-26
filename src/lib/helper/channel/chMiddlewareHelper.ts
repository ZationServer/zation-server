/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket               from "../sc/socket";
import {ChannelPrepare}     from "./channelPrepare";
import SmallBag             from "../../api/SmallBag";
import ChUtils              from "./chUtils";
import Logger               from "../logger/logger";
import PubData              from "../infoObjects/pubData";

/**
 * Class for help in channel middleware by checking the
 * client publish and subscribe of a custom or custom id channel.
 */
export default class ChMiddlewareHelper
{
    private readonly channelPrepare : ChannelPrepare;
    private readonly smallBag : SmallBag;

    constructor(chConfigManager : ChannelPrepare, smallBag : SmallBag) {
        this.channelPrepare = chConfigManager;
        this.smallBag = smallBag;
    }

    /**
     * Middleware check for subscribe a custom id channel.
     * @param socket
     * @param trySubName
     */
    async checkAccessSubCustomIdCh(socket : UpSocket, trySubName : string) : Promise<any>
    {
        const {name,id} = ChUtils.getCustomIdChannelInfo(trySubName);

        if(name === undefined || name === '') {
            const err : any = new Error('You need an name, to sub an custom id channel!');
            err.code = 4592;
            return Error;
        }
        if(id === undefined || id === '') {
            const err : any = new Error('You need an id, to sub an custom id channel!');
            err.code = 4591;
            return Error;
        }

        if(!this.channelPrepare.existCustomIdCh(name)) {
            const err : any = new Error('Unknown custom id channel!');
            err.code = 4593;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to subscribe an unknown custom id channel. Name: '${name}',Id: '${id}'.`);
            return Error;
        }
        else {
            const preChInfo = this.channelPrepare.getSafeCustomIdChInfo(name);
            const chInfo = {name,id};

            if((await preChInfo.subscribeAccessChecker(
                socket.authEngine,
                socket.socketInfo,
                chInfo
            ))) {
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} subscribes custom id channel. Name: '${name}',Id: '${id}'.`);

                return undefined;
            }
            else {
                const err : any = new Error(`Socket with id: ${socket.id}: access denied to subscribe custom id channel. Name: '${name}',Id: '${id}'.`);
                err.code = 4594;
                return err;
            }
        }
    }

    /**
     * Middleware check and event emit for client publish in custom id channel.
     * @param socket
     * @param tryPubName
     * @param pubData
     */
    async checkAccessClientPubCustomIdCh(socket : UpSocket, tryPubName : string, pubData : PubData) : Promise<any>
    {
        const {name,id} = ChUtils.getCustomIdChannelInfo(tryPubName);

        if(name === undefined || name === '') {
            const err : any = new Error('You need an name, to pub in custom id channel!');
            err.code = 4595;
            return Error;
        }
        if(id === undefined || id === '') {
            const err : any = new Error('You need an id, to pub in custom id channel!');
            err.code = 4596;
            return Error;
        }

        if(!this.channelPrepare.existCustomIdCh(name)) {
            const err : any = new Error('Unknown custom id channel!');
            err.code = 4597;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to publish in unknown custom id channel. Name: '${name}',Id: '${id}'.`);
            return Error;
        }
        else {
            const preChInfo = this.channelPrepare.getSafeCustomIdChInfo(name);
            const chInfo = {name,id};

            if((await preChInfo.clientPublishAccessChecker(
                socket.authEngine,
                pubData,
                socket.socketInfo,
                chInfo
            ))) {
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} publish in custom id channel. Name: '${name}',Id: '${id}'.`);

                preChInfo.onClientPub(
                    this.smallBag,
                    pubData,
                    socket.socketInfo,
                    chInfo
                );

                return undefined;
            }
            else {
                const err : any = new Error('No access to publish in this custom id channel!');
                err.code = 4598;
                return err;
            }
        }
    }

    /**
     * Middleware check for subscribe a custom channel.
     * @param socket
     * @param trySubName
     */
    async middlewareSubCustomCh(socket, trySubName : string) : Promise<any>
    {
        const name = ChUtils.getCustomChannelName(trySubName);

        if(name === undefined || name === '') {
            const err : any = new Error('You need an channel name, to sub a custom channel!');
            err.code = 4582;
            return Error;
        }

        if(!this.channelPrepare.existCustomCh(name)) {
            const err : any = new Error('Unknown custom channel!');
            err.code = 4583;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to subscribe an unknown custom channel. Name: '${name}'.`);
            return Error;
        }
        else {
            const preChInfo = this.channelPrepare.getSafeCustomChInfo(name);
            const chInfo = {name};

            if((await preChInfo.subscribeAccessChecker(
                socket.authEngine,
                socket.socketInfo,
                chInfo
            ))) {
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} subscribes a custom channel: '${name}'.`);

                return undefined;
            }
            else {
                const err : any = new Error(`Socket with id: ${socket.id}: access denied to subscribe a custom channel: '${name}'.`);
                err.code = 4584;
                return err;
            }
        }
    }

    /**
     * Middleware check and event emit for client publish in custom channel.
     * @param socket
     * @param tryPubName
     * @param pubData
     */
    async middlewareClientPubCustomCh(socket : UpSocket, tryPubName : string, pubData : PubData) : Promise<any>
    {
        const name = ChUtils.getCustomChannelName(tryPubName);

        if(name === undefined || name === '') {
            const err : any = new Error('You need an channel name, to pub in custom channel!');
            err.code = 4585;
            return Error;
        }

        if(!this.channelPrepare.existCustomCh(name)) {
            const err : any = new Error('Unknown custom channel!');
            err.code = 4586;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to publish in an unknown custom channel. Name: '${name}'.`);
            return Error;
        }
        else {
            const preChInfo = this.channelPrepare.getSafeCustomChInfo(name);
            const chInfo = {name : name};

            if((await preChInfo.clientPublishAccessChecker(
                socket.authEngine,
                pubData,
                socket.socketInfo,
                chInfo
            ))) {
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} publish in a custom channel: '${name}'.`);

                preChInfo.onClientPub(
                    this.smallBag,
                    pubData,
                    socket.socketInfo,
                    chInfo
                );

                return undefined;
            }
            else {
                const err : any = new Error('No access to publish in this custom channel!');
                err.code = 4587;
                return err;
            }
        }

    }
}