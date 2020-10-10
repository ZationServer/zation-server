/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import Bag                                from "../Bag";
import {ClientErrorName}                  from "../../main/definitions/clientErrorName";
import ConfigBuildError                   from "../../main/config/manager/configBuildError";
import Component, {ComponentClass}        from '../component/Component';
import Socket                             from '../Socket';
import {ChSubAccessCheckFunction}         from '../../main/channel/chAccessHelper';
// noinspection ES6PreferShortImport
import {ChannelInfo}                                              from '../../main/channel/channelDefinitions';
// noinspection ES6PreferShortImport
import {ChannelConfig}                                            from '../../main/config/definitions/parts/channelConfig';
import {ScExchange}                                               from '../../main/sc/scServer';
import {AnyChannelClass}                                          from './AnyChannelClass';
import {componentTypeSymbol}                                      from '../../main/component/componentUtils';

export default abstract class ChannelCore extends Component {

    protected readonly _scExchange: ScExchange;
    protected readonly _workerFullId: string;
    protected readonly _preparedData: ChPreparedData;

    protected constructor(identifier: string, bag: Bag, preparedData: ChPreparedData, apiLevel: number | undefined) {
        super(identifier,apiLevel);

        this._scExchange = bag.getWorker().scServer.exchange;
        this._workerFullId = bag.getWorker().getFullWorkerId();
        this._preparedData = preparedData;
    }

    /**
     * @description
     * This property is used for getting the configuration of this Channel.
     */
    public static readonly config: ChannelConfig = {};

    /**
     * @internal
     * **Not override this method.**
     * A function that is used internally to subscribe a socket to this channel.
     * In case of failure or denied, it will throw an error.
     * @param socket
     * @param member
     */
    abstract async _subscribeSocket(socket: Socket, member?: string): Promise<string>;

    /**
     * @internal
     * **Not override this method.**
     * A method that gets called to check if a socket still has access to the channel.
     * Otherwise, the socket will be kicked out.
     * @private
     */
    abstract async _checkSocketHasStillAccess(socket: Socket): Promise<void>;

    /**
     * @internal
     * **Not override this method.**
     * A function that is used internally to check if a
     * socket has access to subscribe to this Channel.
     * In case denied, it will throw an error.
     * @param socket
     * @param chInfo
     */
    async _checkSubscribeAccess(socket: Socket, chInfo: ChannelInfo){
        if(!(await this._preparedData.accessCheck(socket,chInfo))){
            const err: any = new Error('Access to this Channel denied.');
            err.name = ClientErrorName.AccessDenied;
            throw err;
        }
    }

    /**
     * **Not override this method.**
     * Returns the identifier of the Channel from the app config.
     */
    public getIdentifier() {
        return this.identifier;
    }

    /**
     * Decorator for set the Channel config.
     * But notice that when you use the decorator
     * that you cannot set the config property by yourself.
     * @param channelConfig
     * @example
     * @Channel.Config({});
     */
    public static Config(channelConfig: ChannelConfig) {
        return (target: ComponentClass) => {
            if(target.prototype instanceof ChannelCore) {
                (target as any)[nameof<AnyChannelClass>(s => s.config)] = channelConfig;
            }
            else {
                throw new ConfigBuildError(`The Channel config decorator can only be used on a class that extends the ChannelCore (Channel or ChannelFamily class).`);
            }
        }
    }
}

ChannelCore.prototype[componentTypeSymbol] = 'Channel';

export interface ChPreparedData {
    accessCheck: ChSubAccessCheckFunction
}