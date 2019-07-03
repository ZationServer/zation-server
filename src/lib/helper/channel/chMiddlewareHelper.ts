/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import {ChannelPrepare, CustomChStorage} from "./channelPrepare";
import SmallBag             from "../../api/SmallBag";
import ChUtils              from "./chUtils";
import Logger               from "../logger/logger";
import PubData              from "../infoObjects/pubData";
import {ErrorName}          from "../constants/errorName";
import BaseSHBridge from "../bridges/baseSHBridge";

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
     * Util function to check the access to the channel
     * with the client system and version.
     * @param shBridge
     * @param preChInfo
     */
    static checkVersionSystemAccess(shBridge : BaseSHBridge, preChInfo : CustomChStorage) : void
    {
        if(!preChInfo.systemAccessCheck(shBridge)){
            const err : any = new Error(`Access to this channel with client system denied.`);
            err.name = ErrorName.NO_ACCESS_WITH_SYSTEM;
            throw err;
        }
        if(!preChInfo.versionAccessCheck(shBridge)){
            const err : any = new Error(`Access to this channel with client version denied.`);
            err.name = ErrorName.NO_ACCESS_WITH_VERSION;
            throw err;
        }
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
            const err : any = new Error('The custom id channel name is required to subscribe to a custom id channel.');
            err.name = ErrorName.NAME_MISSING;
            return Error;
        }
        if(id === undefined || id === '') {
            const err : any = new Error('The custom id channel id is required to subscribe to a custom id channel.');
            err.name = ErrorName.ID_MISSING;
            return Error;
        }

        if(!this.channelPrepare.existCustomIdCh(name)) {
            const err : any = new Error('Unknown custom id channel.');
            err.name = ErrorName.UNKNOWN_CHANNEL;
            Logger.printDebugInfo
            (`The socket with id: ${socket.id} cannot subscribe to an unknown custom id channel name: '${name}'.`);
            return Error;
        }
        else {
            const preChInfo = this.channelPrepare.getSafeCustomIdChInfo(name);
            const chInfo = {name,id};

            try {
                ChMiddlewareHelper.checkVersionSystemAccess(socket.baseSHBridge,preChInfo);
                await preChInfo.idValidChecker(id);
            }
            catch (e) {
                return e;
            }

            if((await preChInfo.subscribeAccessChecker(
                socket.authEngine,
                socket.socketInfo,
                chInfo
            ))) {
                Logger.printDebugInfo
                (`The socket with id: ${socket.id} subscribes the custom id channel: '${name}' with id: '${id}'.`);

                return undefined;
            }
            else {
                const err : any = new Error(`Subscribe to this custom id channel denied.`);
                err.name = ErrorName.ACCESS_DENIED;
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
            const err : any = new Error('The custom id channel name is required to publish in a custom id channel.');
            err.name = ErrorName.NAME_MISSING;
            return Error;
        }
        if(id === undefined || id === '') {
            const err : any = new Error('The custom id channel id is required to publish in a custom id channel.');
            err.name = ErrorName.ID_MISSING;
            return Error;
        }
        if(!this.channelPrepare.existCustomIdCh(name)) {
            const err : any = new Error('Unknown custom id channel.');
            err.name = ErrorName.UNKNOWN_CHANNEL;
            Logger.printDebugInfo
            (`The socket with id: ${socket.id} cannot publish in an unknown custom id channel name: '${name}'.`);
            return Error;
        }
        else {
            const preChInfo = this.channelPrepare.getSafeCustomIdChInfo(name);
            const chInfo = {name,id};

            try {
                ChMiddlewareHelper.checkVersionSystemAccess(socket.baseSHBridge,preChInfo);
                await preChInfo.idValidChecker(id);
            }
            catch (e) {
                return e;
            }

            if((await preChInfo.clientPublishAccessChecker(
                socket.authEngine,
                pubData,
                socket.socketInfo,
                chInfo
            ))) {
                Logger.printDebugInfo
                (`The socket with id: ${socket.id} publish in the custom id channel: '${name}' with id: '${id}'.`);

                preChInfo.onClientPub(
                    this.smallBag,
                    pubData,
                    socket.socketInfo,
                    chInfo
                );

                return undefined;
            }
            else {
                const err : any = new Error('Publish in this custom id channel denied.');
                err.name = ErrorName.ACCESS_DENIED;
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
            const err : any = new Error('The custom channel name is required to subscribe to a custom channel.');
            err.name = ErrorName.NAME_MISSING;
            return Error;
        }

        if(!this.channelPrepare.existCustomCh(name)) {
            const err : any = new Error('Unknown custom channel.');
            err.name = ErrorName.UNKNOWN_CHANNEL;
            Logger.printDebugInfo
            (`The socket with id: ${socket.id} cannot subscribe to an unknown custom channel name: '${name}'.`);
            return Error;
        }
        else {
            const preChInfo = this.channelPrepare.getSafeCustomChInfo(name);
            const chInfo = {name};

            try {
                ChMiddlewareHelper.checkVersionSystemAccess(socket.baseSHBridge,preChInfo);
            }
            catch (e) {
                return e;
            }

            if((await preChInfo.subscribeAccessChecker(
                socket.authEngine,
                socket.socketInfo,
                chInfo
            ))) {
                Logger.printDebugInfo
                (`The socket with id: ${socket.id} subscribes the custom channel: '${name}'.`);

                return undefined;
            }
            else {
                const err : any = new Error(`Subscribe to this custom channel denied.`);
                err.name = ErrorName.ACCESS_DENIED;
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
            const err : any = new Error('The custom channel name is required to publish in a custom channel.');
            err.name = ErrorName.NAME_MISSING;
            return Error;
        }

        if(!this.channelPrepare.existCustomCh(name)) {
            const err : any = new Error('Unknown custom channel.');
            err.name = ErrorName.UNKNOWN_CHANNEL;
            Logger.printDebugInfo
            (`The socket with id: ${socket.id} cannot publish in an unknown custom channel name: '${name}'.`);
            return Error;
        }
        else {
            const preChInfo = this.channelPrepare.getSafeCustomChInfo(name);
            const chInfo = {name : name};

            try {
                ChMiddlewareHelper.checkVersionSystemAccess(socket.baseSHBridge,preChInfo);
            }
            catch (e) {
                return e;
            }

            if((await preChInfo.clientPublishAccessChecker(
                socket.authEngine,
                pubData,
                socket.socketInfo,
                chInfo
            ))) {
                Logger.printDebugInfo
                (`The socket with id: ${socket.id} publish in the custom channel: '${name}'.`);

                preChInfo.onClientPub(
                    this.smallBag,
                    pubData,
                    socket.socketInfo,
                    chInfo
                );

                return undefined;
            }
            else {
                const err : any = new Error('Publish in this custom channel denied.');
                err.name = ErrorName.ACCESS_DENIED;
                return err;
            }
        }

    }
}