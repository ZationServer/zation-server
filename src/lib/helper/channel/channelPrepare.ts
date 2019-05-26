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

    private readonly defaultChStorage : ChStorage
        = ChannelPrepare.getChStorageDefaults();

    private infoCustomCh: Record<string,CustomChStorage> = {};
    private infoCustomIdCh: Record<string,CustomChStorage> = {};

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

        this.infoCustomCh = this.processCustomChannel(nameof<ChannelConfig>(s => s.customChannels),smallBag);
        this.infoCustomIdCh = this.processCustomChannel(nameof<ChannelConfig>(s => s.customIdChannels),smallBag);
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
     * Prepare process for a custom channel.
     * @param key
     * @param smallBag
     */
    private processCustomChannel(key: string,smallBag : SmallBag): Record<string,CustomChStorage> {
        const res : Record<string,CustomChStorage> = {};
        if (this.chConfig.hasOwnProperty(key)) {
            const channels = this.chConfig[key];
            for (let ch in channels) {
                if (channels.hasOwnProperty(ch) && ch !== nameof<ChannelDefault<CustomIdCh>>(s => s.default)) {
                    const chConfig : CustomChannelConfig = channels[ch];
                    const cChStorage : ChStorage = this.processChannel(chConfig,smallBag);


                    const subAccessInfo = ChannelPrepare.processAccessInvert(chConfig,
                        nameof<CustomChannelConfig>(s => s.subscribeAccess),
                        nameof<CustomChannelConfig>(s => s.subscribeNotAccess)
                    );

                    res[ch] = {
                        ...cChStorage,
                        subscribeAccessChecker : ChAccessHelper.createSubChAccessChecker
                        (subAccessInfo.value,subAccessInfo.inverted,smallBag)
                    };
                }
            }
        }
        return res;
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

    getSafeCustomIdChInfo(chName : string) : CustomChStorage {
        return this.infoCustomIdCh[chName] || this.defaultCustomChStorage;
    }
}

