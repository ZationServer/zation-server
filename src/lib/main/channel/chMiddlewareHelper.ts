/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import {ChannelPrepare, CustomChFamilyStorage, CustomChStorage} from "./channelPrepare";
import Bag                  from "../../api/Bag";
import ChUtils              from "./chUtils";
import Logger               from "../log/logger";
import PubData              from "../internalApi/pubData";
import {ClientErrorName}    from "../constants/clientErrorName";

/**
 * Class for help in channel middleware by checking the
 * client publish and subscribe of a custom channel.
 */
export default class ChMiddlewareHelper
{
    private readonly channelPrepare: ChannelPrepare;
    private readonly bag: Bag;

    constructor(chConfigManager: ChannelPrepare, bag: Bag) {
        this.channelPrepare = chConfigManager;
        this.bag = bag;
    }

    /**
     * Util function to check the access to the channel
     * with the client system and version.
     * @param socket
     * @param preChInfo
     */
    static checkVersionSystemAccess(socket: UpSocket, preChInfo: CustomChStorage): void
    {
        if(!preChInfo.systemAccessCheck(socket)){
            const err: any = new Error(`Access to this channel with client system denied.`);
            err.name = ClientErrorName.NoAccessWithSystem;
            throw err;
        }
        if(!preChInfo.versionAccessCheck(socket)){
            const err: any = new Error(`Access to this channel with client version denied.`);
            err.name = ClientErrorName.NoAccessWithVersion;
            throw err;
        }
    }

    /**
     * Middleware check for subscribe a custom channel.
     * @param socket
     * @param trySubName
     */
    async checkAccessSubCustomCh(socket: UpSocket, trySubName: string): Promise<any>
    {
        const {identifier,member} = ChUtils.getCustomChannelInfo(trySubName);

        if(identifier === undefined){
            const err: any = new Error('The custom channel identifier is required to subscribe to a custom channel.');
            err.name = ClientErrorName.IdentifierMissing;
            return Error;
        }

        if(!this.channelPrepare.existCustomCh(identifier)){
            const err: any = new Error('Unknown custom channel identifier.');
            err.name = ClientErrorName.UnknownChannel;
            Logger.log.debug
            (`The socket with id: ${socket.id} cannot subscribe to an unknown custom channel identifier: '${identifier}'.`);
            return Error;
        }


        const isCustomChFamily = this.channelPrepare.isCustomChFamily(identifier);
        const memberProvided = member !== undefined;


        if(isCustomChFamily && !memberProvided){
            const err: any = new Error('The family member is required to subscribe to a custom channel family.');
            err.name = ClientErrorName.MemberMissing;
            return Error;
        }
        if(!isCustomChFamily && memberProvided){
            const err: any = new Error('Unnecessary member provided to subscribe to a normal custom channel.');
            err.name = ClientErrorName.UnnecessaryMember;
            return Error;
        }

        const preChInfo = this.channelPrepare.getCustomChPreInfo(identifier);

        try {
            ChMiddlewareHelper.checkVersionSystemAccess(socket,preChInfo);
            if(isCustomChFamily){
                await (preChInfo as CustomChFamilyStorage).memberValidChecker((member as string));
            }
        }
        catch (e) {
            return e;
        }

        if((await preChInfo.subscribeAccessChecker(
            socket.authEngine,
            socket.zSocket,
            {identifier,member}
        ))) {
            Logger.log.debug
            (`The socket with id: ${socket.id} subscribes a custom channel with identifier: '${identifier}'${memberProvided ? ` and member: '${member}'`:''}.`);
            return undefined;
        }
        else {
            const err: any = new Error(`Subscribe to this custom channel denied.`);
            err.name = ClientErrorName.AccessDenied;
            return err;
        }
    }

    /**
     * Middleware check and event emit for client publish in custom channel.
     * @param socket
     * @param tryPubName
     * @param pubData
     */
    async checkAccessClientPubCustomCh(socket: UpSocket, tryPubName: string, pubData: PubData): Promise<any>
    {
        const {identifier,member} = ChUtils.getCustomChannelInfo(tryPubName);

        if(identifier === undefined){
            const err: any = new Error('The custom channel identifier is required to publish in a custom channel.');
            err.name = ClientErrorName.IdentifierMissing;
            return Error;
        }

        if(!this.channelPrepare.existCustomCh(identifier)){
            const err: any = new Error('Unknown custom channel identifier.');
            err.name = ClientErrorName.UnknownChannel;
            Logger.log.debug
            (`The socket with id: ${socket.id} cannot publish in an unknown custom channel identifier: '${identifier}'.`);
            return Error;
        }


        const isCustomChFamily = this.channelPrepare.isCustomChFamily(identifier);
        const memberProvided = member !== undefined;


        if(isCustomChFamily && !memberProvided){
            const err: any = new Error('The family member is required to publish in a custom channel family.');
            err.name = ClientErrorName.MemberMissing;
            return Error;
        }
        if(!isCustomChFamily && memberProvided){
            const err: any = new Error('Unnecessary member provided to publish in a normal custom channel.');
            err.name = ClientErrorName.UnnecessaryMember;
            return Error;
        }

        const preChInfo = this.channelPrepare.getCustomChPreInfo(identifier);
        const chInfo = {identifier,member};

        try {
            ChMiddlewareHelper.checkVersionSystemAccess(socket,preChInfo);
            if(isCustomChFamily){
                await (preChInfo as CustomChFamilyStorage).memberValidChecker((member as string));
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
            Logger.log.debug
            (`The socket with id: ${socket.id} publishes in a custom channel with identifier: '${identifier}'${memberProvided ? ` and member: '${member}'`:''}.`);

            preChInfo.onClientPub(
                this.bag,
                pubData,
                socket.zSocket,
                chInfo
            );

            return undefined;
        }
        else {
            const err: any = new Error(`Publish in this custom channel denied.`);
            err.name = ClientErrorName.AccessDenied;
            return err;
        }
    }
}