/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
For performance speed in publish in channels, sub channels..
 */

import ZationConfig      = require("../../main/zationConfig");
import {ChannelConfig, ChannelDefault, CustomChannelConfig, ZationChannelConfig} from "../configs/channelConfig";

export enum AccessKey {
    NOT_SET = 0,
    ACCESS = 1,
    NOT_ACCESS = 2
}

interface Events {
    onClientPub ?: Function | Function[],
    onBagPub ?: Function | Function[],
    onSub ?: Function | Function[],
    onUnsub ?: Function | Function[]
}

interface CustomChStorage extends Events {
    sgop : boolean,
    pa ?: Function,
    pak : AccessKey,
    sa ?: Function,
    sak : AccessKey
}

interface ChStorage extends Events{
    sgop : boolean,
    acp : boolean
}

export class ChConfigManager {
    private zc: ZationConfig;
    private readonly cc: object;

    private infoUserCh: ChStorage = {sgop : true,acp : false};
    private infoAuthUserGroupCh: ChStorage = {sgop : true,acp : false};
    private infoDefaultUserGroupCh: ChStorage = {sgop : true,acp : false};
    private infoAllCh: ChStorage = {sgop : true,acp : false};

    private infoCustomCh: Record<string,CustomChStorage> = {};
    private infoCustomIdCh: Record<string,CustomChStorage> = {};

    constructor(zc: ZationConfig) {
        this.zc = zc;
        this.cc = this.zc.channelConfig;
        this.readConfig();
    }

    readConfig() {

        if(this.cc.hasOwnProperty(nameof<ChannelConfig>(s => s.userCh))) {
            this.infoUserCh = this.processChannel(this.cc[nameof<ChannelConfig>(s => s.userCh)]);
        }
        if(this.cc.hasOwnProperty(nameof<ChannelConfig>(s => s.authUserGroupCh))) {
            this.infoAuthUserGroupCh = this.processChannel(this.cc[nameof<ChannelConfig>(s => s.authUserGroupCh)]);
        }
        if(this.cc.hasOwnProperty(nameof<ChannelConfig>(s => s.defaultUserGroupCh))) {
            this.infoDefaultUserGroupCh = this.processChannel(this.cc[nameof<ChannelConfig>(s => s.defaultUserGroupCh)]);
        }
        if(this.cc.hasOwnProperty(nameof<ChannelConfig>(s => s.allCh))) {
            this.infoAllCh = this.processChannel(this.cc[nameof<ChannelConfig>(s => s.allCh)]);
        }
        this.infoCustomCh = this.processCustomChannel(nameof<ChannelConfig>(s => s.customChannels));
        this.infoCustomIdCh = this.processCustomChannel(nameof<ChannelConfig>(s => s.customIdChannels));
    }

    private processCustomChannel(key: string): Record<string,CustomChStorage> {
        const res : Record<string,CustomChStorage> = {};
        if (this.cc.hasOwnProperty(key)) {
            const channels = this.cc[key];
            for (let ch in channels) {
                if (channels.hasOwnProperty(ch) && ch !== nameof<ChannelDefault>(s => s.default))
                {
                    const chConfig : CustomChannelConfig = channels[ch];

                    let pubAccess;
                    let pubAccessKey = AccessKey.NOT_SET;
                    let subAccess;
                    let subAccessKey = AccessKey.NOT_SET;

                    if (chConfig.clientPublishAccess !== undefined) {
                        pubAccess = chConfig.clientPublishAccess;
                        pubAccessKey = AccessKey.ACCESS;
                    }
                    else if (chConfig.clientPublishNotAccess !== undefined) {
                        pubAccess = chConfig.clientPublishNotAccess;
                        pubAccessKey = AccessKey.NOT_ACCESS;
                    }

                    if (chConfig.subscribeAccess !== undefined) {
                        subAccess = chConfig.subscribeAccess;
                        subAccessKey = AccessKey.ACCESS;
                    }
                    else if (chConfig.subscribeNotAccess !== undefined) {
                        subAccess = chConfig.subscribeNotAccess;
                        subAccessKey = AccessKey.NOT_ACCESS;
                    }

                    res[ch] = {
                        sgop : this.getSgop(chConfig.socketGetOwnPublish),
                        onClientPub : chConfig.onClientPublish,
                        onBagPub : chConfig.onBagPublish,
                        onSub : chConfig.onSubscription,
                        onUnsub : chConfig.onUnsubscription,
                        pa : pubAccess,
                        pak : pubAccessKey,
                        sa : subAccess,
                        sak : subAccessKey
                    };
                }
            }
        }
        return res;
    }

    private processChannel(channel : ZationChannelConfig): ChStorage {
        return {
            sgop : this.getSgop(channel.socketGetOwnPublish),
            acp : !!channel.allowClientPublish,
            onClientPub : channel.onClientPublish,
            onBagPub : channel.onBagPublish,
            onSub : channel.onSubscription,
            onUnsub : channel.onUnsubscription,
        };
    }

    // noinspection JSMethodCanBeStatic
    private getSgop(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        else {
            //fallback
            return true;
        }
    }

    //sc normal ch allow client pub
    getAllowClientPubUserCh(): boolean {
        return this.infoUserCh.acp;
    }

    getAllowClientAuthUserGroupCh(): boolean {
        return this.infoAuthUserGroupCh.acp;
    }

    getAllowClientDefaultUserGroupCh(): boolean {
        return this.infoAuthUserGroupCh.acp;
    }

    getAllowClientAllCh(): boolean {
        return this.infoAllCh.acp;
    }

    //sc get own pub fast
    getSocketGetOwnPubUserCh(): boolean {
        return this.infoUserCh.sgop;
    }

    getSocketGetOwnPubAuthUserGroupCh(): boolean {
        return this.infoAuthUserGroupCh.sgop;
    }

    getSocketGetOwnPubDefaultUserGroupCh(): boolean {
        return this.infoAuthUserGroupCh.sgop;
    }

    getSocketGetOwnPubAllCh(): boolean {
        return this.infoAllCh.sgop;
    }

    getSocketGetOwnPubCustomCh(chName: string): boolean {
        return this.getCustomChInfo(chName).sgop;
    }

    getSocketGetOwnPubCustomIdCh(chName: string): boolean {
        return this.getCustomIdChInfo(chName).sgop
    }

    //ch is there
    isCustomCh(chName: string): boolean {
        return this.infoCustomCh.hasOwnProperty(chName);
    }

    isCustomIdCh(chName: string): boolean {
        return this.infoCustomIdCh.hasOwnProperty(chName);
    }

    //ch get info with default fallback
    getCustomChInfo(chName: string): CustomChStorage {
        return this.infoCustomCh.hasOwnProperty(chName) ?
            this.infoCustomCh[chName] : {pak : AccessKey.NOT_SET,sak : AccessKey.NOT_SET,sgop : true};
    }

    getCustomIdChInfo(chName: string): CustomChStorage {
        return this.infoCustomIdCh.hasOwnProperty(chName) ?
            this.infoCustomIdCh[chName] : {pak : AccessKey.NOT_SET,sak : AccessKey.NOT_SET,sgop : true};
    }

    //pub access
    getPubAccessValueCustomCh(chName: string): any {
        return this.getCustomChInfo(chName).pa;
    }

    getPubAccessValueCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName).pa;
    }

    getPubAccessKeyCustomCh(chName: string): number {
        return this.getCustomChInfo(chName).pak;
    }

    getPubAccessKeyCustomIdCh(chName: string): number {
        return this.getCustomIdChInfo(chName).pak;
    }

    //sub access
    getSubAccessValueCustomCh(chName: string): any {
        return this.getCustomChInfo(chName).sa;
    }

    getSubAccessValueCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName).sa;
    }

    getSubAccessKeyCustomCh(chName: string): number {
        return this.getCustomChInfo(chName).sak;
    }

    getSubAccessKeyCustomIdCh(chName: string): number {
        return this.getCustomIdChInfo(chName).sak;
    }

    //events custom/id channel
    getOnClientPubCustomCh(chName: string): any {
        return this.getCustomChInfo(chName).onClientPub;
    }

    getOnClientPubCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName).onClientPub;
    }

    getOnBagPubCustomCh(chName: string): any {
        return this.getCustomChInfo(chName).onBagPub;
    }

    getOnBagPubCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName).onBagPub;
    }

    getOnSubCustomCh(chName: string): any {
        return this.getCustomChInfo(chName).onSub;
    }

    getOnSubCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName).onSub;
    }

    getOnUnsubCustomCh(chName: string): any {
        return this.getCustomChInfo(chName).onUnsub;
    }

    getOnUnsubCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName).onUnsub;
    }


    //events user,authUserGroup,defaultUserGroup and all channel

    getOnClientPubUserCh(): any {
        return this.infoUserCh.onClientPub;
    }

    getOnBagPubUserCh(): any {
        return this.infoUserCh.onBagPub;
    }

    getOnSubUserCh(): any {
        return this.infoUserCh.onSub;
    }

    getOnUnsubUserCh(): any {
        return this.infoUserCh.onUnsub;
    }


    getOnClientPubAuthUserUserCh(): any {
        return this.infoAuthUserGroupCh.onClientPub;
    }

    getOnBagPubAuthUserUserCh(): any {
        return this.infoAuthUserGroupCh.onBagPub;
    }

    getOnSubAuthUserGroupCh(): any {
        return this.infoAuthUserGroupCh.onSub;
    }

    getOnUnsubAuthUserGroupCh(): any {
        return this.infoAuthUserGroupCh.onUnsub;
    }


    getOnClientPubDefaultUserUserCh(): any {
        return this.infoDefaultUserGroupCh.onClientPub;
    }

    getOnBagPubDefaultUserUserCh(): any {
        return this.infoDefaultUserGroupCh.onBagPub;
    }

    getOnSubDefaultUserGroupCh(): any {
        return this.infoDefaultUserGroupCh.onSub;
    }

    getOnUnsubDefaultUserGroupCh(): any {
        return this.infoDefaultUserGroupCh.onUnsub;
    }


    getOnClientPubAllCh(): any {
        return this.infoAllCh.onClientPub;
    }

    getOnBagPubAllCh(): any {
        return this.infoAllCh.onBagPub;
    }

    getOnSubAllCh(): any {
        return this.infoAllCh.onSub;
    }

    getOnUnsubAllCh(): any {
        return this.infoAllCh.onUnsub;
    }
}

