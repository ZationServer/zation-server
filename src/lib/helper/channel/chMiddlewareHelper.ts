/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import {ChannelPrepare, CustomChFamilyStorage, CustomChStorage} from "./channelPrepare";
import Bag                  from "../../api/Bag";
import ChUtils              from "./chUtils";
import Logger               from "../logger/logger";
import PubData              from "../internalApi/pubData";
import {ErrorName}          from "../constants/errorName";
import BaseSHBridge         from "../bridges/baseSHBridge";

/**
 * Class for help in channel middleware by checking the
 * client publish and subscribe of a custom or custom id channel.
 */
export default class ChMiddlewareHelper
{
    private readonly channelPrepare : ChannelPrepare;
    private readonly bag : Bag;

    constructor(chConfigManager : ChannelPrepare, bag : Bag) {
        this.channelPrepare = chConfigManager;
        this.bag = bag;
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
     * Middleware check for subscribe a custom channel.
     * @param socket
     * @param trySubName
     */
    async checkAccessSubCustomCh(socket : UpSocket, trySubName : string) : Promise<any>
    {
        const {name,id} = ChUtils.getCustomChannelInfo(trySubName);

        if(name === undefined){
            const err : any = new Error('The custom channel name is required to subscribe to a custom channel.');
            err.name = ErrorName.NAME_MISSING;
            return Error;
        }

        if(!this.channelPrepare.existCustomCh(name)){
            const err : any = new Error('Unknown custom channel.');
            err.name = ErrorName.UNKNOWN_CHANNEL;
            Logger.printDebugInfo
            (`The socket with id: ${socket.id} cannot subscribe to an unknown custom channel name: '${name}'.`);
            return Error;
        }


        const isCustomChFamily = this.channelPrepare.isCustomChFamily(name);
        const idProvided = id !== undefined;


        if(isCustomChFamily && !idProvided){
            const err : any = new Error('The family member id is required to subscribe to a custom channel family.');
            err.name = ErrorName.ID_MISSING;
            return Error;
        }
        if(!isCustomChFamily && idProvided){
            const err : any = new Error('Unknown member id provided to subscribe to a normal custom channel.');
            err.name = ErrorName.UNKNOWN_ID;
            return Error;
        }

        const preChInfo = this.channelPrepare.getCustomChPreInfo(name);

        try {
            ChMiddlewareHelper.checkVersionSystemAccess(socket.baseSHBridge,preChInfo);
            if(isCustomChFamily){
                await (preChInfo as CustomChFamilyStorage).idValidChecker((id as string));
            }
        }
        catch (e) {
            return e;
        }

        if((await preChInfo.subscribeAccessChecker(
            socket.authEngine,
            socket.zSocket,
            {name,id}
        ))) {
            Logger.printDebugInfo
            (`The socket with id: ${socket.id} subscribes the custom channel: '${name}'${idProvided ? ` with member id: '${id}'`:''}.`);
            return undefined;
        }
        else {
            const err : any = new Error(`Subscribe to this custom channel denied.`);
            err.name = ErrorName.ACCESS_DENIED;
            return err;
        }
    }

    /**
     * Middleware check and event emit for client publish in custom channel.
     * @param socket
     * @param tryPubName
     * @param pubData
     */
    async checkAccessClientPubCustomCh(socket : UpSocket, tryPubName : string, pubData : PubData) : Promise<any>
    {
        const {name,id} = ChUtils.getCustomChannelInfo(tryPubName);

        if(name === undefined){
            const err : any = new Error('The custom channel name is required to publish in a custom channel.');
            err.name = ErrorName.NAME_MISSING;
            return Error;
        }

        if(!this.channelPrepare.existCustomCh(name)){
            const err : any = new Error('Unknown custom channel.');
            err.name = ErrorName.UNKNOWN_CHANNEL;
            Logger.printDebugInfo
            (`The socket with id: ${socket.id} cannot publish in an unknown custom channel name: '${name}'.`);
            return Error;
        }


        const isCustomChFamily = this.channelPrepare.isCustomChFamily(name);
        const idProvided = id !== undefined;


        if(isCustomChFamily && !idProvided){
            const err : any = new Error('The family member id is required to publish in a custom channel family.');
            err.name = ErrorName.ID_MISSING;
            return Error;
        }
        if(!isCustomChFamily && idProvided){
            const err : any = new Error('Unknown member id provided to publish in a normal custom channel.');
            err.name = ErrorName.UNKNOWN_ID;
            return Error;
        }

        const preChInfo = this.channelPrepare.getCustomChPreInfo(name);
        const chInfo = {name,id};

        try {
            ChMiddlewareHelper.checkVersionSystemAccess(socket.baseSHBridge,preChInfo);
            if(isCustomChFamily){
                await (preChInfo as CustomChFamilyStorage).idValidChecker((id as string));
            }
        }
        catch (e) {
            return e;
        }

        if((await preChInfo.clientPublishAccessChecker(
            socket.authEngine,
            pubData,
            socket.zSocket,
             chInfo
        ))) {
            Logger.printDebugInfo
            (`The socket with id: ${socket.id} publishes in the custom channel: '${name}'${idProvided ? ` with member id: '${id}'`:''}.`);

            preChInfo.onClientPub(
                this.bag,
                pubData,
                socket.zSocket,
                chInfo
            );

            return undefined;
        }
        else {
            const err : any = new Error(`Publish in this custom channel denied.`);
            err.name = ErrorName.ACCESS_DENIED;
            return err;
        }
    }
}