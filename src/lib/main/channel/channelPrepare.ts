/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/*
For performance speed in publish in channels, sub channels..
 */

import {
    BaseCustomChannelConfig, CustomCh, CustomChFamily, PreCompiledCustomChannelConfig,
    ZationChannelConfig, ZationChannelsConfig
} from "../config/definitions/parts/channelsConfig";
import ZationConfigFull              from "../config/manager/zationConfigFull";
import FuncUtils, {EventInvokerSync} from "../utils/funcUtils";
import Bag                           from "../../api/Bag";
import MemberCheckerUtils, {IsMemberChecker}                    from "../member/memberCheckerUtils";
import ChAccessHelper, {ChPubAccessChecker, ChSubAccessChecker} from "./chAccessHelper";
import SystemVersionChecker, {VersionSystemAccessCheckFunction} from "../systemVersion/systemVersionChecker";
import {ErrorEventSingleton}                                    from '../error/errorEventSingleton';

export interface Events {
    onClientPub: EventInvokerSync,
    onBagPub: EventInvokerSync,
    onSub: EventInvokerSync,
    onUnsub: EventInvokerSync
}

export interface CustomChStorage extends Events, ChStorage {
    subscribeAccessChecker: ChSubAccessChecker,
    versionAccessCheck: VersionSystemAccessCheckFunction,
    systemAccessCheck: VersionSystemAccessCheckFunction
}

export interface CustomChFamilyStorage extends CustomChStorage {
    isMemberChecker: IsMemberChecker
}

export interface ChStorage extends Events {
    clientPublishAccessChecker: ChPubAccessChecker,
    socketGetOwnPub: boolean,
}

export class ChannelPrepare {
    private zc: ZationConfigFull;
    private readonly zationChConfig: ZationChannelsConfig;
    private readonly customChannels: Record<string,PreCompiledCustomChannelConfig>;

    private infoUserCh: ChStorage;
    private infoAuthUserGroupCh: ChStorage;
    private infoDefaultUserGroupCh: ChStorage;
    private infoAllCh: ChStorage;

    private readonly defaultChStorage: ChStorage
        = ChannelPrepare.getChStorageDefaults();

    private readonly defaultCustomChStorage: CustomChStorage
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
    static getChStorageDefaults(): ChStorage {
        return {
            socketGetOwnPub: true,
            clientPublishAccessChecker: async () => {return false},
            onBagPub: () => {},
            onUnsub: () => {},
            onSub: () => {},
            onClientPub: () => {}
        };
    }

    /**
     * Create defaults an for custom channel storage.
     */
    static getCustomChStorageDefaults(): CustomChStorage  {
        return {
            ...ChannelPrepare.getChStorageDefaults(),
            subscribeAccessChecker: async () => {return  false},
            versionAccessCheck: () => true,
            systemAccessCheck: () => true
        };
    }

    /**
     * Prepare a zation channel with the configuration.
     * @param key
     * @param bag
     */
    private prepareZationChannel(key: string,bag: Bag): ChStorage {
        return this.zationChConfig.hasOwnProperty(key) ? this.processChannel(key,this.zationChConfig[key],bag) :
            this.defaultChStorage;
    }

    /**
     * Prepare all channels.
     */
    prepare(bag: Bag) {
        this.infoUserCh = this.prepareZationChannel(nameof<ZationChannelsConfig>(s => s.userCh),bag);
        this.infoAuthUserGroupCh = this.prepareZationChannel(nameof<ZationChannelsConfig>(s => s.authUserGroupCh),bag);
        this.infoDefaultUserGroupCh = this.prepareZationChannel(nameof<ZationChannelsConfig>(s => s.defaultUserGroupCh),bag);
        this.infoAllCh = this.prepareZationChannel(nameof<ZationChannelsConfig>(s => s.allCh),bag);
        this.processCustomChannels(bag);
    }

    /**
     * Prepare process for a custom channels.
     * @param bag
     */
    private processCustomChannels(bag: Bag) {
        if (typeof this.customChannels === 'object') {
            for (let identifier in this.customChannels) {
                if(this.customChannels.hasOwnProperty(identifier)) {
                    let config: CustomChFamily | CustomCh;
                    if(Array.isArray(this.customChannels[identifier])){
                        config = this.customChannels[identifier][0];
                        this.infoCustomChFamilies[identifier] = {
                            ...this.processCustomChannel(identifier,config,bag),
                            isMemberChecker: MemberCheckerUtils.createIsMemberChecker((config as CustomChFamily).isMember,bag)
                        }
                    }
                    else {
                        config = (this.customChannels[identifier] as CustomCh);
                        this.infoCustomCh[identifier] = this.processCustomChannel(identifier,config,bag);
                    }
                }
            }
        }
    }

    /**
     * Prepare process for a custom channel.
     * @param identifier
     * @param chConfig
     * @param bag
     */
    private processCustomChannel(identifier: string,chConfig: BaseCustomChannelConfig, bag: Bag): CustomChStorage {
        const cChStorage: ChStorage = this.processChannel(identifier,chConfig,bag);
        return {
            ...cChStorage,
            subscribeAccessChecker: ChAccessHelper.createSubChAccessChecker(chConfig.subscribeAccess,bag,identifier),
            versionAccessCheck: SystemVersionChecker.createVersionChecker(chConfig),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(chConfig)
        };
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Prepare process for a channel.
     * @param key
     * @param channel
     * @param bag
     */
    private processChannel(key: string,channel: ZationChannelConfig,bag: Bag): ChStorage {
        const errorEvent = ErrorEventSingleton.get();
        const errLogMessagePrefix = `An error was thrown in the channel: '${key}', event:`;
        return {
            clientPublishAccessChecker: ChAccessHelper.createPubChAccessChecker(channel.clientPublishAccess,bag,key),
            socketGetOwnPub: ChannelPrepare.processSocketGetOwnPub(channel.socketGetOwnPublish),
            onClientPub: channel.onBagPublish ?
                FuncUtils.createSafeCaller(FuncUtils.createFuncSyncInvoker(channel.onBagPublish),
                    `${errLogMessagePrefix} '${nameof<ZationChannelConfig>(s => s.onClientPublish)}':`,errorEvent)
                : () => {},
            onBagPub: channel.onBagPublish ?
                FuncUtils.createSafeCaller(FuncUtils.createFuncSyncInvoker(channel.onBagPublish),
                    `${errLogMessagePrefix} '${nameof<ZationChannelConfig>(s => s.onBagPublish)}':`,errorEvent)
                : () => {},
            onSub: channel.onSubscription ?
                FuncUtils.createSafeCaller(FuncUtils.createFuncSyncInvoker(channel.onSubscription),
                    `${errLogMessagePrefix} '${nameof<ZationChannelConfig>(s => s.onSubscription)}':`,errorEvent)
                : () => {},
            onUnsub: channel.onUnsubscription ?
                FuncUtils.createSafeCaller(FuncUtils.createFuncSyncInvoker(channel.onUnsubscription),
                    `${errLogMessagePrefix} '${nameof<ZationChannelConfig>(s => s.onUnsubscription)}':`,errorEvent)
                : () => {},
        };
    }

    /**
     * Process the socket get own publish from config.
     * @param value
     */
    private static processSocketGetOwnPub(value) {
        return typeof value === 'boolean' ? value: true;
    }

    getUserChInfo(): ChStorage {
        return this.infoUserCh;
    }

    getAuthUserGroupChInfo(): ChStorage {
        return this.infoAuthUserGroupCh;
    }

    getDefaultUserGroupChInfo(): ChStorage {
        return this.infoDefaultUserGroupCh;
    }

    getAllChInfo(): ChStorage {
        return this.infoAllCh;
    }

    existCustomCh(identifier: string): boolean {
        return this.infoCustomCh.hasOwnProperty(identifier) ||
            this.infoCustomChFamilies.hasOwnProperty(identifier);
    }

    isCustomChFamily(identifier: string): boolean {
        return this.infoCustomChFamilies.hasOwnProperty(identifier);
    }

    getCustomChPreInfo(identifier: string): CustomChStorage | CustomChFamilyStorage {
        return this.infoCustomCh[identifier] || this.infoCustomChFamilies[identifier] || this.defaultCustomChStorage;
    }
}

