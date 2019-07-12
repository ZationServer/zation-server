/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
For performance speed in publish in channels, sub channels..
 */

import {
    BaseCustomChannelConfig, CustomCh, CustomChFamily, PreCompiledCustomChannelConfig,
    ZationChannelConfig, ZationChannelsConfig
} from "../config/definitions/channelsConfig";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import FuncUtils, {EventInvokerSync} from "../utils/funcUtils";
import SmallBag                      from "../../api/SmallBag";
import IdValidCheckerUtils, {IdValidChecker}                    from "../id/idValidCheckerUtils";
import ChAccessHelper, {ChPubAccessChecker, ChSubAccessChecker} from "./chAccessHelper";
import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../systemVersion/systemVersionChecker";

export interface Events {
    onClientPub : EventInvokerSync,
    onBagPub : EventInvokerSync,
    onSub : EventInvokerSync,
    onUnsub : EventInvokerSync
}

export interface CustomChStorage extends Events, ChStorage {
    subscribeAccessChecker : ChSubAccessChecker,
    versionAccessCheck : VersionSystemAccessCheckFunction,
    systemAccessCheck : VersionSystemAccessCheckFunction
}

export interface CustomChFamilyStorage extends CustomChStorage {
    idValidChecker : IdValidChecker
}

export interface ChStorage extends Events {
    clientPublishAccessChecker : ChPubAccessChecker,
    socketGetOwnPub : boolean,
}

export class ChannelPrepare {
    private zc: ZationConfigFull;
    private readonly zationChConfig: ZationChannelsConfig;
    private readonly customChannels : Record<string,PreCompiledCustomChannelConfig>;

    private infoUserCh: ChStorage;
    private infoAuthUserGroupCh: ChStorage;
    private infoDefaultUserGroupCh: ChStorage;
    private infoAllCh: ChStorage;

    private readonly defaultChStorage : ChStorage
        = ChannelPrepare.getChStorageDefaults();

    private readonly defaultCustomChStorage : CustomChStorage
        = ChannelPrepare.getCustomChStorageDefaults();

    private infoCustomCh: Record<string,CustomChStorage> = {};
    private infoCustomChFamilies: Record<string,CustomChFamilyStorage> = {};

    constructor(zc: ZationConfigFull) {
        this.zc = zc;
        this.zationChConfig = this.zc.appConfig.zationChannels || {};
        this.customChannels = this.zc.appConfig.customChannels || {};
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
            subscribeAccessChecker : async () => {return  false},
            versionAccessCheck : () => true,
            systemAccessCheck : () => true
        };
    }

    /**
     * Prepare a zation channel with the configuration.
     * @param name
     * @param smallBag
     */
    private prepareZationChannel(name : string,smallBag : SmallBag) : ChStorage {
        return this.zationChConfig.hasOwnProperty(name) ? this.processChannel(this.zationChConfig[name],smallBag) :
            this.defaultChStorage;
    }

    /**
     * Prepare all channels.
     */
    prepare(smallBag : SmallBag) {
        this.infoUserCh = this.prepareZationChannel(nameof<ZationChannelsConfig>(s => s.userCh),smallBag);
        this.infoAuthUserGroupCh = this.prepareZationChannel(nameof<ZationChannelsConfig>(s => s.authUserGroupCh),smallBag);
        this.infoDefaultUserGroupCh = this.prepareZationChannel(nameof<ZationChannelsConfig>(s => s.defaultUserGroupCh),smallBag);
        this.infoAllCh = this.prepareZationChannel(nameof<ZationChannelsConfig>(s => s.allCh),smallBag);
        this.processCustomChannels(smallBag);
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
    private processCustomChannels(smallBag : SmallBag) {
        if (typeof this.customChannels === 'object') {
            for (let chName in this.customChannels) {
                if(this.customChannels.hasOwnProperty(chName)) {
                    let config : CustomChFamily | CustomCh;
                    if(Array.isArray(this.customChannels[chName])){
                        config = this.customChannels[chName][0];
                        this.infoCustomChFamilies[chName] = {
                            ...this.processCustomChannel(config,smallBag),
                            idValidChecker : IdValidCheckerUtils.createIdValidChecker((config as CustomChFamily).idValid,smallBag)
                        }
                    }
                    else {
                        config = (this.customChannels[chName] as CustomCh);
                        this.infoCustomCh[chName] = this.processCustomChannel(config, smallBag);
                    }
                }
            }
        }
    }

    /**
     * Prepare process for a custom channel.
     * @param chConfig
     * @param smallBag
     */
    private processCustomChannel(chConfig : BaseCustomChannelConfig, smallBag : SmallBag): CustomChStorage {
        const cChStorage : ChStorage = this.processChannel(chConfig,smallBag);

        const subAccessInfo = ChannelPrepare.processAccessInvert(chConfig,
            nameof<BaseCustomChannelConfig>(s => s.subscribeAccess),
            nameof<BaseCustomChannelConfig>(s => s.subscribeNotAccess)
        );

        return {
            ...cChStorage,
            subscribeAccessChecker : ChAccessHelper.createSubChAccessChecker
            (subAccessInfo.value,subAccessInfo.inverted,smallBag),
            versionAccessCheck : SystemVersionChecker.createVersionChecker(chConfig),
            systemAccessCheck : SystemVersionChecker.createSystemChecker(chConfig)
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
            nameof<BaseCustomChannelConfig>(s => s.clientPublishNotAccess)
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
        return this.infoCustomCh.hasOwnProperty(chName) ||
            this.infoCustomChFamilies.hasOwnProperty(chName);
    }

    isCustomChFamily(chName : string) : boolean {
        return this.infoCustomChFamilies.hasOwnProperty(chName);
    }

    getCustomChPreInfo(chName : string) : CustomChStorage | CustomChFamilyStorage {
        return this.infoCustomCh[chName] || this.infoCustomChFamilies[chName] || this.defaultCustomChStorage;
    }
}

