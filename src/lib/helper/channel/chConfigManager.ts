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

    private sgopUserCh: boolean = true;
    private sgopAuthUserGroupCh: boolean = true;
    private sgopDefaultUserGroupCh: boolean = true;
    private sgopAllCh: boolean = true;

    private infoCustomCh: object = {};
    private infoCustomIdCh: object = {};

    constructor(zc: ZationConfig) {
        this.zc = zc;
        this.cc = this.zc.getChannelConfig();
        this.readConfig();
    }

    readConfig() {
        this.sgopUserCh = this.processChannelKey(Const.Channel.KEYS.USER_CH);
        this.sgopAuthUserGroupCh = this.processChannelKey(Const.Channel.KEYS.AUTH_USER_GROUP_CH);
        this.sgopDefaultUserGroupCh = this.processChannelKey(Const.Channel.KEYS.DEFAULT_USER_GROUP_CH);
        this.sgopAllCh = this.processChannelKey(Const.Channel.KEYS.ALL_CH);
        this.infoCustomCh = this.processCustomChannel(Const.Channel.KEYS.CUSTOM_CHANNELS);
        this.infoCustomIdCh = this.processCustomChannel(Const.Channel.KEYS.CUSTOM_ID_CHANNELS);
    }

    private processCustomChannel(key: string) : object
    {
        const res = {};
        if(this.cc.hasOwnProperty(key))
        {
            const channels = this.cc[key];
            for(let ch in channels)
            {
                if(channels.hasOwnProperty(ch) && ch !== Const.Channel.CHANNEL_DEFAULT.DEFAULT)
                {
                    const chConfig = channels[ch];
                    res['sgop'] = this.getSgop(chConfig[Const.Channel.CHANNEL_SETTINGS.SOCKET_GET_OWN_PUBLISH]);

                    if(chConfig.hasOwnProperty(Const.Channel.CHANNEL.PUBLISH_ACCESS)) {
                        res['pa'] = chConfig[Const.Channel.CHANNEL.PUBLISH_ACCESS];
                        res['pak'] = 1;
                    }
                    else if(chConfig.hasOwnProperty(Const.Channel.CHANNEL.PUBLISH_NOT_ACCESS)) {
                        res['pa'] = chConfig[Const.Channel.CHANNEL.PUBLISH_NOT_ACCESS];
                        res['pak'] = 2;
                    }
                    else {
                        res['pak'] = 0;
                    }

                    if(chConfig.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_ACCESS)) {
                        res['sa'] = chConfig[Const.Channel.CHANNEL.PUBLISH_ACCESS];
                        res['sak'] = 1;
                    }
                    else if(chConfig.hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS)) {
                        res['sa'] = chConfig[Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS];
                        res['sak'] = 2;
                    }
                    else {
                        res['sak'] = 0;
                    }

                }
            }
        }
        return res;
    }

    private processChannelKey(key : string) : boolean
    {
        if(this.cc.hasOwnProperty(key)) {
            return this.getSgop(this.cc[key][Const.Channel.CHANNEL_SETTINGS.SOCKET_GET_OWN_PUBLISH]);
        }
        else {
            return true;
        }
    }

    // noinspection JSMethodCanBeStatic
    private getSgop(value)
    {
        if(typeof value === 'boolean') {
            return value;
        }
        else {
            //fallback
            return true;
        }
    }

    //socket get own pub fast
    getSocketGetOwnPubUserCh() : boolean{
        return this.sgopUserCh;
    }

    getSocketGetOwnPubAuthUserGroupCh() : boolean {
        return this.sgopAuthUserGroupCh;
    }

    getSocketGetOwnPubDefaultUserGroupCh() : boolean {
        return this.sgopDefaultUserGroupCh;
    }

    getSocketGetOwnPubAllCh() : boolean {
        return this.sgopAllCh;
    }

    getSocketGetOwnPubCustomCh(chName : string) : boolean {
        return this.infoCustomCh[chName].sgop;
    }

    getSocketGetOwnPubCustomIdCh(chName : string) : boolean {
        return this.infoCustomIdCh[chName].sgop;
    }

    //ch is there
    isCustomCh(chName : string) : boolean {
        return this.infoCustomCh.hasOwnProperty(chName);
    }

    isCustomIdCh(chName : string) : boolean {
        return this.infoCustomIdCh.hasOwnProperty(chName);
    }

    //pub access
    getPubAccessValueCustomCh(chName : string) : any {
        return this.infoCustomCh[chName].pa;
    }

    getPubAccessValueCustomIdCh(chName : string) : any {
        return this.infoCustomIdCh[chName].pa;
    }

    getPubAccessKeyCustomCh(chName : string) : number {
        return this.infoCustomCh[chName].pak;
    }

    getPubAccessKeyCustomIdCh(chName : string) : number {
        return this.infoCustomIdCh[chName].pak;
    }

    //sub access
    getSubAccessValueCustomCh(chName : string) : any {
        return this.infoCustomCh[chName].sa;
    }

    getSubAccessValueCustomIdCh(chName : string) : any {
        return this.infoCustomIdCh[chName].sa;
    }

    getSubAccessKeyCustomCh(chName : string) : number {
        return this.infoCustomCh[chName].sak;
    }

    getSubAccessKeyCustomIdCh(chName : string) : number {
        return this.infoCustomIdCh[chName].sak;
    }

    //Access func fast

}

export = ChConfigManager;
