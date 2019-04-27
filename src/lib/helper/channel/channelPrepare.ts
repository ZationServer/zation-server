/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
For performance speed in publish in channels, sub channels..
 */

import {ChannelConfig, ChannelDefault, CustomChannelConfig, ZationChannelConfig} from "../configDefinitions/channelConfig";
import ZationConfigFull from "../configManager/zationConfigFull";
import FuncUtils, {EventInvokerSync} from "../utils/funcUtils";
import AEPreparedPart from "../auth/aePreparedPart";

interface Events {
    onClientPub ?: EventInvokerSync,
    onBagPub ?: EventInvokerSync,
    onSub ?: EventInvokerSync,
    onUnsub ?: EventInvokerSync
}

interface CustomChStorage extends Events {
    socketGetOwnPub : boolean,
    clientPublishAccessChecker ?: Function,
    subscribeAccessChecker ?: Function,
}

interface ChStorage extends Events{
    socketGetOwnPub : boolean,
    allowClientPub : boolean
}

export class ChannelPrepare {
    private zc: ZationConfigFull;
    private readonly aePreparedPart : AEPreparedPart;
    private readonly chConfig: ChannelConfig;

    private infoUserCh: ChStorage = ChannelPrepare.getChStorageDefaults();
    private infoAuthUserGroupCh: ChStorage = ChannelPrepare.getChStorageDefaults();
    private infoDefaultUserGroupCh: ChStorage = ChannelPrepare.getChStorageDefaults();
    private infoAllCh: ChStorage = ChannelPrepare.getChStorageDefaults();

    private infoCustomCh: Record<string,CustomChStorage> = {};
    private infoCustomIdCh: Record<string,CustomChStorage> = {};

    constructor(zc: ZationConfigFull,aePreparedPart : AEPreparedPart) {
        this.zc = zc;
        this.aePreparedPart = aePreparedPart;
        this.chConfig = this.zc.channelConfig;
    }

    static getChStorageDefaults() : ChStorage {
        return {
            socketGetOwnPub : true,
            allowClientPub :  false
        };
    }

    prepare() {
        if(this.chConfig.hasOwnProperty(nameof<ChannelConfig>(s => s.userCh))) {
            this.infoUserCh = this.processChannel(this.chConfig[nameof<ChannelConfig>(s => s.userCh)]);
        }
        if(this.chConfig.hasOwnProperty(nameof<ChannelConfig>(s => s.authUserGroupCh))) {
            this.infoAuthUserGroupCh = this.processChannel(this.chConfig[nameof<ChannelConfig>(s => s.authUserGroupCh)]);
        }
        if(this.chConfig.hasOwnProperty(nameof<ChannelConfig>(s => s.defaultUserGroupCh))) {
            this.infoDefaultUserGroupCh = this.processChannel(this.chConfig[nameof<ChannelConfig>(s => s.defaultUserGroupCh)]);
        }
        if(this.chConfig.hasOwnProperty(nameof<ChannelConfig>(s => s.allCh))) {
            this.infoAllCh = this.processChannel(this.chConfig[nameof<ChannelConfig>(s => s.allCh)]);
        }
        this.infoCustomCh = this.processCustomChannel(nameof<ChannelConfig>(s => s.customChannels));
        this.infoCustomIdCh = this.processCustomChannel(nameof<ChannelConfig>(s => s.customIdChannels));
    }

    private processCustomChannel(key: string): Record<string,CustomChStorage> {
        const res : Record<string,CustomChStorage> = {};
        if (this.chConfig.hasOwnProperty(key)) {
            const channels = this.chConfig[key];
            for (let ch in channels) {
                if (channels.hasOwnProperty(ch) && ch !== nameof<ChannelDefault>(s => s.default)) {
                    const chConfig : CustomChannelConfig = channels[ch];

                    const cChStorage : CustomChStorage = this.processChannel(chConfig);

                    if (chConfig.clientPublishAccess !== undefined) {

                    }
                    else if (chConfig.clientPublishNotAccess !== undefined) {
                    }

                    if (chConfig.subscribeAccess !== undefined) {


                    }
                    else if (chConfig.subscribeNotAccess !== undefined) {


                    }
                    res[ch] = cChStorage;
                }
            }
        }
        return res;
    }

    // noinspection JSMethodCanBeStatic
    private processChannel(channel : ZationChannelConfig): ChStorage {
        return {
            socketGetOwnPub : ChannelPrepare.processSocketGetOwnPub(channel.socketGetOwnPublish),
            allowClientPub : !!channel.allowClientPublish,
            onClientPub : channel.onBagPublish ? FuncUtils.createEventSyncInvoker(channel.onBagPublish) : undefined,
            onBagPub : channel.onBagPublish ? FuncUtils.createEventSyncInvoker(channel.onBagPublish) : undefined,
            onSub : channel.onSubscription ? FuncUtils.createEventSyncInvoker(channel.onSubscription) : undefined,
            onUnsub : channel.onUnsubscription ? FuncUtils.createEventSyncInvoker(channel.onUnsubscription) : undefined,
        };
    }

    // noinspection JSMethodCanBeStatic
    private static processSocketGetOwnPub(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        else {
            //fallback
            return true;
        }
    }

    getUserChInfo() : ChStorage {
        return this.infoUserCh;
    }

    getAuthUserGroupChInfo() : ChStorage {
        return this.infoAuthUserGroupCh;
    }

    getDefaultUserGroupChInfo() : ChStorage {
        return this.infoDefaultUserGroupCh;
    }

    getAllChInfo() : ChStorage {
        return this.infoAllCh;
    }

    existCustomCh(chName : string) : boolean {
        return this.infoCustomCh.hasOwnProperty(chName);
    }

    getSafeCustomChInfo(chName : string) : CustomChStorage {
        return this.infoCustomCh[chName] || {socketGetOwnPub : false};
    }

    existCustomIdCh(chName : string) : boolean {
        return this.infoCustomIdCh.hasOwnProperty(chName);
    }

    getSafeCustomIdChInfo(chName : string) : CustomChStorage {
        return this.infoCustomIdCh[chName] || {socketGetOwnPub : false};
    }
}

