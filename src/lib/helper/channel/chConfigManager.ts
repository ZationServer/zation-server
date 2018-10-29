/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
For performance speed in publish in channels, sub channels..
 */

import Const             = require('../constants/constWrapper');
import ZationConfig      = require("../../main/zationConfig");

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
        this.cc = this.zc.getChannelConfig();
        this.readConfig();
    }

    readConfig() {
        this.infoUserCh = this.processChannel(Const.Channel.KEYS.USER_CH);
        this.infoAuthUserGroupCh = this.processChannel(Const.Channel.KEYS.AUTH_USER_GROUP_CH);
        this.infoDefaultUserGroupCh = this.processChannel(Const.Channel.KEYS.DEFAULT_USER_GROUP_CH);
        this.infoAllCh = this.processChannel(Const.Channel.KEYS.ALL_CH);
        this.infoCustomCh = this.processCustomChannel(Const.Channel.KEYS.CUSTOM_CHANNELS);
        this.infoCustomIdCh = this.processCustomChannel(Const.Channel.KEYS.CUSTOM_ID_CHANNELS);
    }

    private processCustomChannel(key: string): object {
        const res = {};
        if (this.cc.hasOwnProperty(key)) {
            const channels = this.cc[key];
            for (let ch in channels) {
                if (channels.hasOwnProperty(ch) && ch !== Const.Channel.CHANNEL_DEFAULT.DEFAULT) {
                    const chConfig = channels[ch];

                    res[ch] = {};
                    res[ch]['sgop'] = this.getSgop(chConfig[Const.Channel.CHANNEL_SETTINGS.SOCKET_GET_OWN_PUBLISH]);
                    if (chConfig.hasOwnProperty(Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS)) {
                        res[ch]['pa'] = chConfig[Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS];
                        res[ch]['pak'] = 1;
                    }
                    else if (chConfig.hasOwnProperty(Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS)) {
                        res[ch]['pa'] = chConfig[Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS];
                        res[ch]['pak'] = 2;
                    }
                    else {
                        res[ch]['pak'] = 0;
                    }

                    if (chConfig.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_ACCESS)) {
                        res[ch]['sa'] = chConfig[Const.Channel.CHANNEL.SUBSCRIBE_ACCESS];
                        res[ch]['sak'] = 1;
                    }
                    else if (chConfig.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS)) {
                        res[ch]['sa'] = chConfig[Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS];
                        res[ch]['sak'] = 2;
                    }
                    else {
                        res[ch]['sak'] = 0;
                    }

                    res[ch]['onClientPub'] = chConfig[Const.Channel.CHANNEL.ON_CLIENT_PUBLISH];
                    res[ch]['onBagPub'] = chConfig[Const.Channel.CHANNEL.ON_BAG_PUBLISH];
                    res[ch]['onSub'] = chConfig[Const.Channel.CHANNEL.ON_SUBSCRIPTION];
                    res[ch]['onUnsub'] = chConfig[Const.Channel.CHANNEL.ON_UNSUBSCRIPTION];
                }
            }
        }
        return res;
    }

    private processChannel(key: string): object {
        const res = {};
        if (this.cc.hasOwnProperty(key)) {
            res['sgop'] = this.getSgop(this.cc[key][Const.Channel.CHANNEL_SETTINGS.SOCKET_GET_OWN_PUBLISH]);
            res['onSub'] = (this.cc[key][Const.Channel.CHANNEL.ON_SUBSCRIPTION]);
            res['onUnsub'] = (this.cc[key][Const.Channel.CHANNEL.ON_UNSUBSCRIPTION]);
            res['onBagPub'] = (this.cc[key][Const.Channel.CHANNEL.ON_BAG_PUBLISH]);
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
