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

class ChConfigManager {
    private zc: ZationConfig;
    private readonly cc: object;

    private infoUserCh: object = {};
    private infoAuthUserGroupCh: object = {};
    private infoDefaultUserGroupCh: object = {};
    private infoAllCh: object = {};

    private infoCustomCh: object = {};
    private infoCustomIdCh: object = {};

    constructor(zc: ZationConfig) {
        this.zc = zc;
        this.cc = this.zc.channelConfig;
        this.readConfig();
    }

    readConfig() {
        this.infoUserCh = this.processChannel(nameof<ChannelConfig>(s => s.userCh));
        this.infoAuthUserGroupCh = this.processChannel(nameof<ChannelConfig>(s => s.authUserGroupCh));
        this.infoDefaultUserGroupCh = this.processChannel(nameof<ChannelConfig>(s => s.defaultUserGroupCh));
        this.infoAllCh = this.processChannel(nameof<ChannelConfig>(s => s.allCh));
        this.infoCustomCh = this.processCustomChannel(nameof<ChannelConfig>(s => s.customChannels));
        this.infoCustomIdCh = this.processCustomChannel(nameof<ChannelConfig>(s => s.customIdChannels));
    }

    private processCustomChannel(key: string): object {
        const res = {};
        if (this.cc.hasOwnProperty(key)) {
            const channels = this.cc[key];
            for (let ch in channels) {
                if (channels.hasOwnProperty(ch) && ch !== nameof<ChannelDefault>(s => s.default)) {
                    const chConfig : CustomChannelConfig = channels[ch];
                    res[ch] = {};
                    res[ch]['sgop'] = this.getSgop(chConfig.socketGetOwnPublish);
                    if (chConfig.clientPublishAccess !== undefined) {
                        res[ch]['pa'] = chConfig.clientPublishAccess;
                        res[ch]['pak'] = 1;
                    }
                    else if (chConfig.clientPublishNotAccess !== undefined) {
                        res[ch]['pa'] = chConfig.clientPublishNotAccess;
                        res[ch]['pak'] = 2;
                    }
                    else {
                        res[ch]['pak'] = 0;
                    }

                    if (chConfig.subscribeAccess !== undefined) {
                        res[ch]['sa'] = chConfig.subscribeAccess;
                        res[ch]['sak'] = 1;
                    }
                    else if (chConfig.subscribeNotAccess !== undefined) {
                        res[ch]['sa'] = chConfig.subscribeNotAccess;
                        res[ch]['sak'] = 2;
                    }
                    else {
                        res[ch]['sak'] = 0;
                    }

                    res[ch]['onClientPub'] = chConfig.onClientPublish;
                    res[ch]['onBagPub'] = chConfig.onBagPublish;
                    res[ch]['onSub'] = chConfig.onSubscription;
                    res[ch]['onUnsub'] = chConfig.onUnsubscription;
                }
            }
        }
        return res;
    }

    private processChannel(key: string): object {
        const res = {};
        if (this.cc.hasOwnProperty(key)) {
            const channel : ZationChannelConfig = this.cc[key];
            res['sgop'] = this.getSgop(channel.socketGetOwnPublish);
            res['onSub'] = channel.onSubscription;
            res['onUnsub'] = channel.onUnsubscription;
            res['onBagPub'] = channel.onBagPublish;
        }
        return res;
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

    //sc get own pub fast
    getSocketGetOwnPubUserCh(): boolean {
        return this.infoUserCh['sgop'];
    }

    getSocketGetOwnPubAuthUserGroupCh(): boolean {
        return this.infoAuthUserGroupCh['sgop'];
    }

    getSocketGetOwnPubDefaultUserGroupCh(): boolean {
        return this.infoDefaultUserGroupCh['sgop'];
    }

    getSocketGetOwnPubAllCh(): boolean {
        return this.infoAllCh['sgop'];
    }

    getSocketGetOwnPubCustomCh(chName: string): boolean {
        return this.getCustomChInfo(chName).sgop;
    }

    getSocketGetOwnPubCustomIdCh(chName: string): boolean {
        return this.getCustomIdChInfo(chName).sgop;
    }

    //ch is there
    isCustomCh(chName: string): boolean {
        return this.infoCustomCh.hasOwnProperty(chName);
    }

    isCustomIdCh(chName: string): boolean {
        return this.infoCustomIdCh.hasOwnProperty(chName);
    }

    //ch is there
    getCustomChInfo(chName: string): any {
        return this.infoCustomCh.hasOwnProperty(chName) ?
            this.infoCustomCh[chName] : {};
    }

    getCustomIdChInfo(chName: string): any {
        return this.infoCustomIdCh.hasOwnProperty(chName) ?
            this.infoCustomIdCh[chName] : {};
    }

    //pub protocolAccess
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

    //sub protocolAccess
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

    //events
    getOnClientPubCustomCh(chName: string): any {
        return this.getCustomChInfo(chName)['onClientPub'];
    }

    getOnClientPubCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName)['onClientPub'];
    }

    getOnBagPubCustomCh(chName: string): any {
        return this.getCustomChInfo(chName)['onBagPub'];
    }

    getOnBagPubCustomIdCh(chName: string): any {

        return this.getCustomIdChInfo(chName)['onBagPub'];
    }

    getOnSubCustomCh(chName: string): any {
        return this.getCustomChInfo(chName)['onSub'];
    }

    getOnSubCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName)['onSub'];
    }

    getOnUnsubCustomCh(chName: string): any {
        return this.getCustomChInfo(chName)['onUnsub'];
    }

    getOnUnsubCustomIdCh(chName: string): any {
        return this.getCustomIdChInfo(chName)['onUnsub'];
    }

    getOnSubUserCh(): any {
        return this.infoUserCh['onSub'];
    }

    getOnUnsubUserCh(): any {
        return this.infoUserCh['onUnsub'];
    }

    getOnBagPubUserCh(): any {
        return this.infoUserCh['onBagPub'];
    }

    getOnSubAuthUserGroupCh(): any {
        return this.infoAuthUserGroupCh['onSub'];
    }

    getOnUnsubAuthUserGroupCh(): any {
        return this.infoAuthUserGroupCh['onUnsub'];
    }

    getOnBagPubAuthUserUserCh(): any {
        return this.infoAuthUserGroupCh['onBagPub'];
    }

    getOnSubDefaultUserGroupCh(): any {
        return this.infoDefaultUserGroupCh['onSub'];
    }

    getOnUnsubDefaultUserGroupCh(): any {
        return this.infoDefaultUserGroupCh['onUnsub'];
    }

    getOnBagPubDefaultUserUserCh(): any {
        return this.infoDefaultUserGroupCh['onBagPub'];
    }

    getOnSubAllCh(): any {
        return this.infoAllCh['onSub'];
    }

    getOnUnsubAllCh(): any {
        return this.infoAllCh['onUnsub'];
    }

    getOnBagPubAllCh(): any {
        return this.infoDefaultUserGroupCh['onBagPub'];
    }
}

export = ChConfigManager;
