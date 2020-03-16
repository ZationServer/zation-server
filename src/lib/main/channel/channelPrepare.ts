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
import IdValidCheckerUtils, {IdValidChecker}                    from "../id/idValidCheckerUtils";
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
    idValidChecker: IdValidChecker
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
     * @param name
     * @param bag
     */
    private prepareZationChannel(name: string,bag: Bag): ChStorage {
        return this.zationChConfig.hasOwnProperty(name) ? this.processChannel(name,this.zationChConfig[name],bag) :
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
     * Prepare process for a custom id channels.
     * @param bag
     */
    private processCustomChannels(bag: Bag) {
        if (typeof this.customChannels === 'object') {
            for (let chName in this.customChannels) {
                if(this.customChannels.hasOwnProperty(chName)) {
                    let config: CustomChFamily | CustomCh;
                    if(Array.isArray(this.customChannels[chName])){
                        config = this.customChannels[chName][0];
                        this.infoCustomChFamilies[chName] = {
                            ...this.processCustomChannel(chName,config,bag),
                            idValidChecker: IdValidCheckerUtils.createIdValidChecker((config as CustomChFamily).idValid,bag)
                        }
                    }
                    else {
                        config = (this.customChannels[chName] as CustomCh);
                        this.infoCustomCh[chName] = this.processCustomChannel(chName,config,bag);
                    }
                }
            }
        }
    }

    /**
     * Prepare process for a custom channel.
     * @param name
     * @param chConfig
     * @param bag
     */
    private processCustomChannel(name: string,chConfig: BaseCustomChannelConfig, bag: Bag): CustomChStorage {
        const cChStorage: ChStorage = this.processChannel(name,chConfig,bag);
        return {
            ...cChStorage,
            subscribeAccessChecker: ChAccessHelper.createSubChAccessChecker(chConfig.subscribeAccess,bag,name),
            versionAccessCheck: SystemVersionChecker.createVersionChecker(chConfig),
            systemAccessCheck: SystemVersionChecker.createSystemChecker(chConfig)
        };
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Prepare process for a channel.
     * @param name
     * @param channel
     * @param bag
     */
    private processChannel(name: string,channel: ZationChannelConfig,bag: Bag): ChStorage {
        const errorEvent = ErrorEventSingleton.get();
        const errLogMessagePrefix = `An error was thrown in the channel: '${name}', event:`;
        return {
            clientPublishAccessChecker: ChAccessHelper.createPubChAccessChecker(channel.clientPublishAccess,bag,name),
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

    existCustomCh(chName: string): boolean {
        return this.infoCustomCh.hasOwnProperty(chName) ||
            this.infoCustomChFamilies.hasOwnProperty(chName);
    }

    isCustomChFamily(chName: string): boolean {
        return this.infoCustomChFamilies.hasOwnProperty(chName);
    }

    getCustomChPreInfo(chName: string): CustomChStorage | CustomChFamilyStorage {
        return this.infoCustomCh[chName] || this.infoCustomChFamilies[chName] || this.defaultCustomChStorage;
    }
}

