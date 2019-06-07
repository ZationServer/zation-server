/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
For performance speed in publish in channels, sub channels..
 */

import {
    ChannelConfig,
    ChannelDefault,
    CustomChannelConfig,
    CustomIdCh,
    ZationChannelConfig
} from "../configDefinitions/channelConfig";
import ZationConfigFull              from "../configManager/zationConfigFull";
import FuncUtils, {EventInvokerSync} from "../utils/funcUtils";
import SmallBag                      from "../../api/SmallBag";
import IdCheckerUtils, {IdChecker}   from "../id/idCheckerUtils";
import ChAccessHelper, {ChPubAccessChecker, ChSubAccessChecker} from "./chAccessHelper";

interface Events {
    onClientPub : EventInvokerSync,
    onBagPub : EventInvokerSync,
    onSub : EventInvokerSync,
    onUnsub : EventInvokerSync
}

interface CustomChStorage extends Events, ChStorage {
    subscribeAccessChecker : ChSubAccessChecker,
}

interface CustomIdChStorage extends CustomChStorage {
    idChecker : IdChecker
}

interface ChStorage extends Events {
    clientPublishAccessChecker : ChPubAccessChecker,
    socketGetOwnPub : boolean,
}

export class ChannelPrepare {
    private zc: ZationConfigFull;
    private readonly chConfig: ChannelConfig;

    private infoUserCh: ChStorage;
    private infoAuthUserGroupCh: ChStorage;
    private infoDefaultUserGroupCh: ChStorage;
    private infoAllCh: ChStorage;

    private readonly defaultCustomChStorage : CustomChStorage
        = ChannelPrepare.getCustomChStorageDefaults();

    private readonly defaultCustomIdChStorage : CustomIdChStorage
        = ChannelPrepare.getCustomIdChStorageDefaults();

    private readonly defaultChStorage : ChStorage
        = ChannelPrepare.getChStorageDefaults();

    private infoCustomCh: Record<string,CustomChStorage> = {};
    private infoCustomIdCh: Record<string,CustomIdChStorage> = {};

    constructor(zc: ZationConfigFull) {
        this.zc = zc;
        this.chConfig = this.zc.channelConfig;
    }

    /**
     * Create defaults for an channel storage.
     */
    static getChStorageDefaults() : ChStorage {
        return {
            socketGetOwnPub : true,
            clientPublishAccessChecker : async () => {return false},
            onBagPub : () => {},
            onUnsub : () => {},
            onSub : () => {},
            onClientPub : () => {}
        };
    }

    /**
     * Create defaults an for custom channel storage.
     */
    static getCustomChStorageDefaults() : CustomChStorage  {
        return {
            ...ChannelPrepare.getChStorageDefaults(),
            subscribeAccessChecker : async () => {return  false}
        };
    }

    /**
     * Create defaults an for custom id channel storage.
     */
    static getCustomIdChStorageDefaults() : CustomIdChStorage  {
        return {
            ...ChannelPrepare.getCustomChStorageDefaults(),
            idChecker : async () => {}
        };
    }

    /**
     * Prepare a channel with the configuration.
     * @param name
     * @param smallBag
     */
    private prepareChannel(name : string,smallBag : SmallBag) : ChStorage {
        return this.chConfig.hasOwnProperty(name) ? this.processChannel(this.chConfig[name],smallBag) :
            this.defaultChStorage;
    }

    /**
     * Prepare all channels.
     */
    prepare(smallBag : SmallBag) {
        this.infoUserCh = this.prepareChannel(nameof<ChannelConfig>(s => s.userCh),smallBag);
        this.infoAuthUserGroupCh = this.prepareChannel(nameof<ChannelConfig>(s => s.authUserGroupCh),smallBag);
        this.infoDefaultUserGroupCh = this.prepareChannel(nameof<ChannelConfig>(s => s.defaultUserGroupCh),smallBag);
        this.infoAllCh = this.prepareChannel(nameof<ChannelConfig>(s => s.allCh),smallBag);

        this.infoCustomCh = this.processCustomChannels(smallBag);
        this.infoCustomIdCh = this.processCustomIdChannels(smallBag);
    }

    /**
     * Process the access/not access key and value.
     * @param config
     * @param accessKey
     * @param notAccessKey
     */
    private static processAccessInvert(config : Record<string,any>, accessKey : string, notAccessKey : string) :
        {value : any,inverted : boolean}
    {
        let value : any = undefined;
        let inverted = false;

        if (config[notAccessKey] !== undefined) {
           value = config[notAccessKey];
           inverted = true;
        }
        else  {
            value = config[accessKey];
        }

        return {value, inverted};
    }

    /**
     * Prepare process for a custom id channels.
     * @param smallBag
     */
    private processCustomIdChannels(smallBag : SmallBag): Record<string,CustomIdChStorage> {
        const res : Record<string,CustomIdChStorage> = {};
        if (typeof this.chConfig.customIdChannels === 'object') {
            const channels = this.chConfig.customIdChannels;
            for (let ch in channels) {
                if (channels.hasOwnProperty(ch) && ch !== nameof<ChannelDefault<CustomIdCh>>(s => s.default)) {
                    res[ch] = {
                        ...this.processCustomChannel(channels[ch],smallBag),
                        idChecker : IdCheckerUtils.createIdChecker(channels[ch],smallBag)
                    }
                }
            }
        }
        return res;
    }

    /**
     * Prepare process for a custom channels.
     * @param smallBag
     */
    private processCustomChannels(smallBag : SmallBag): Record<string,CustomChStorage> {
        const res : Record<string,CustomChStorage> = {};
        if (typeof this.chConfig.customChannels === 'object') {
            const channels = this.chConfig.customChannels;
            for (let ch in channels) {
                if (channels.hasOwnProperty(ch) && ch !== nameof<ChannelDefault<CustomIdCh>>(s => s.default)) {
                    res[ch] = this.processCustomChannel(channels[ch],smallBag);
                }
            }
        }
        return res;
    }

    /**
     * Prepare process for a custom channel.
     * @param chConfig
     * @param smallBag
     */
    private processCustomChannel(chConfig : CustomChannelConfig,smallBag : SmallBag): CustomChStorage {
        const cChStorage : ChStorage = this.processChannel(chConfig,smallBag);

        const subAccessInfo = ChannelPrepare.processAccessInvert(chConfig,
            nameof<CustomChannelConfig>(s => s.subscribeAccess),
            nameof<CustomChannelConfig>(s => s.subscribeNotAccess)
        );

        return {
            ...cChStorage,
            subscribeAccessChecker : ChAccessHelper.createSubChAccessChecker
            (subAccessInfo.value,subAccessInfo.inverted,smallBag)
        };
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Prepare process for a channel.
     * @param channel
     * @param smallBag
     */
    private processChannel(channel : ZationChannelConfig,smallBag : SmallBag): ChStorage {
        const pubAccessInfo = ChannelPrepare.processAccessInvert(channel,
            nameof<ZationChannelConfig>(s => s.clientPublishAccess),
            nameof<CustomChannelConfig>(s => s.clientPublishNotAccess)
        );
        return {
            clientPublishAccessChecker : ChAccessHelper.createPubChAccessChecker
            (pubAccessInfo.value,pubAccessInfo.inverted,smallBag),
            socketGetOwnPub : ChannelPrepare.processSocketGetOwnPub(channel.socketGetOwnPublish),
            onClientPub : channel.onBagPublish ? FuncUtils.createEventSyncInvoker(channel.onBagPublish) : () => {},
            onBagPub : channel.onBagPublish ? FuncUtils.createEventSyncInvoker(channel.onBagPublish) : () => {},
            onSub : channel.onSubscription ? FuncUtils.createEventSyncInvoker(channel.onSubscription) : () => {},
            onUnsub : channel.onUnsubscription ? FuncUtils.createEventSyncInvoker(channel.onUnsubscription) : () => {},
        };
    }

    /**
     * Process the socket get own publish from config.
     * @param value
     */
    private static processSocketGetOwnPub(value) {
        return typeof value === 'boolean' ? value : true;
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
        return this.infoCustomCh[chName] || this.defaultCustomChStorage;
    }

    existCustomIdCh(chName : string) : boolean {
        return this.infoCustomIdCh.hasOwnProperty(chName);
    }

    getSafeCustomIdChInfo(chName : string) : CustomIdChStorage {
        return this.infoCustomIdCh[chName] || this.defaultCustomIdChStorage;
    }
}

