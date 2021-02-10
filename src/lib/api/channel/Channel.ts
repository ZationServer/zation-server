/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ChannelCore, {ChPreparedData} from './ChannelCore';
import Bag                           from '../Bag';
import {ClientErrorName}             from '../../main/definitions/clientErrorName';
import Socket                        from '../Socket';
import FuncUtils                     from '../../main/utils/funcUtils';
import {ErrorEventHolder}            from '../../main/error/errorEventHolder';
import {removeValueFromArray}        from '../../main/utils/arrayUtils';
import {
    CH_CLIENT_OUTPUT_CLOSE,
    CH_CLIENT_OUTPUT_KICK_OUT,
    CH_CLIENT_OUTPUT_PUBLISH,
    CHANNEL_START_INDICATOR,
    ChClientInputAction,
    ChClientInputPackage, ChClientOutputClosePackage,
    ChClientOutputKickOutPackage,
    ChClientOutputPublishPackage,
    ChWorkerAction, ChWorkerClosePackage,
    ChWorkerPackage,
    ChWorkerPublishPackage,
    PublishPackage,
    UnsubscribeSocketFunction,
    UnsubscribeTrigger
} from '../../main/channel/channelDefinitions';

/**
 * Channels implements the subscribe/publish architecture.
 * They ideal for sending something to multiple clients.
 * When you want to reach that data should be kept up to date
 * on a client in real-time you should use Databoxes instead.
 *
 * You can override these methods:
 * - initialize
 *
 * events:
 * - onSubscription
 * - onUnsubscription
 * - onPublish
 */
export default class Channel extends ChannelCore {

    /**
     * Maps the sockets to the kick out function.
     */
    private readonly _subSockets: Map<Socket,UnsubscribeSocketFunction> = new Map();

    /**
     * Also the channel id.
     */
    private readonly _chEvent: string;

    private _internalRegistered: boolean = false;
    private _unregisterTimout: NodeJS.Timeout | undefined;

    private readonly _onPublish: (event: string, data: any) => Promise<void> | void;
    private readonly _onSubscription: (socket: Socket) => Promise<void> | void;
    private readonly _onUnsubscription: (socket: Socket, trigger: UnsubscribeTrigger) => Promise<void> | void;

    constructor(identifier: string, bag: Bag, chPreparedData: ChPreparedData, apiLevel: number | undefined)
    {
        super(identifier,bag,chPreparedData,apiLevel);

        this._chEvent = CHANNEL_START_INDICATOR + this.identifier +
            (apiLevel !== undefined ? `@${apiLevel}`: '');

        const errMessagePrefix = this.toString() + ' error was thrown in the function';
        this._onPublish = FuncUtils.createSafeCaller(this.onPublish,
            `${errMessagePrefix} onPublish`,ErrorEventHolder.get());
        this._onSubscription = FuncUtils.createSafeCaller(this.onSubscription,
            `${errMessagePrefix} onSubscription`,ErrorEventHolder.get());
        this._onUnsubscription = FuncUtils.createSafeCaller(this.onUnsubscription,
            `${errMessagePrefix} onUnsubscription`,ErrorEventHolder.get());
    }

    /**
     * @internal
     * **Not override this method.**
     * Used internally.
     */
    async _subscribeSocket(socket: Socket, member?: string): Promise<string>{
        if(member != undefined){
            const err: any = new Error('Unnecessary member provided to subscribe to a channel.');
            err.name = ClientErrorName.UnnecessaryMember;
            throw err;
        }
        if(this._subSockets.has(socket)){
            return this._chEvent;
        }

        //new subscription
        await this._checkSubscribeAccess(socket,{identifier: this.identifier,member});
        this._addSocket(socket);
        this._onSubscription(socket);
        return this._chEvent;
    }

    private _addSocket(socket: Socket) {
        if(!this._internalRegistered){
            this._register();
        }
        else {
            this._clearUnregisterTimeout();
        }

        const disconnectHandler = () => this._unsubscribeSocket(socket,disconnectHandler,UnsubscribeTrigger.Disconnect);

        socket._on(this._chEvent,(senderPackage: ChClientInputPackage, respond) => {
            if(senderPackage[0] === ChClientInputAction.Unsubscribe) {
                this._unsubscribeSocket(socket,disconnectHandler,UnsubscribeTrigger.Client);
                respond(null);
            }
            else {
                const err: any = new Error('Unknown action');
                err.name = ClientErrorName.UnknownAction;
                respond(err);
            }
        });
        socket._on('disconnect',disconnectHandler);
        this._subSockets.set(socket,() => this._unsubscribeSocket(socket,disconnectHandler,UnsubscribeTrigger.KickOut));
        socket.getChannels().push(this);
    }

    private _unsubscribeSocket(socket: Socket, disconnectHandler: () => void, trigger: UnsubscribeTrigger) {
        this._rmSocket(socket,disconnectHandler);
        this._onUnsubscription(socket,trigger);
    }

    private _rmSocket(socket: Socket, disconnectHandler: () => void) {
        this._subSockets.delete(socket);
        socket._off(this._chEvent);
        socket._off('disconnect',disconnectHandler);
        removeValueFromArray(socket.getChannels(),this);
        if(this._subSockets.size === 0) {
            this._createUnregisterTimeout();
        }
    }

    /**
     * Clears the timeout to unregister.
     * @private
     */
    private _clearUnregisterTimeout(): void {
        if(this._unregisterTimout !== undefined){
            clearTimeout(this._unregisterTimout);
            this._unregisterTimout = undefined;
        }
    }

    /**
     * Creates (set or renew) the timeout to unregister.
     * @private
     */
    private _createUnregisterTimeout(): void {
        if(this._unregisterTimout !== undefined){clearTimeout(this._unregisterTimout);}
        this._unregisterTimout = setTimeout(() => {
            this._unregister();
            this._unregisterTimout = undefined;
        }, this._unregisterDelay);
    }

    /**
     * Processes an internal publish.
     * @private
     */
    private _processPublish(publish: PublishPackage) {
        const outputPackage = {i: this._chEvent,e: publish.e,d: publish.d} as ChClientOutputPublishPackage;
        if(publish.p === undefined){
            for (const socket of this._subSockets.keys()){
                socket._emit(CH_CLIENT_OUTPUT_PUBLISH,outputPackage);
            }
        }
        else {
            const publisherSid = publish.p;
            for (const socket of this._subSockets.keys()){
                if(publisherSid === socket.sid) continue;
                socket._emit(CH_CLIENT_OUTPUT_PUBLISH,outputPackage);
            }
        }
    }

    /**
     * Registers for listening to the internal channel.
     * @private
     */
    private _register() {
        this._scExchange.subscribe(this._chEvent)
            .watch(async (data: ChWorkerPackage) => {
                if(data[0] !== this._workerFullId) {
                    switch (data[1]) {
                        case ChWorkerAction.publish:
                            this._processPublish((data as ChWorkerPublishPackage)[2]);
                            break;
                        case ChWorkerAction.close:
                            this._close((data as ChWorkerClosePackage)[2]);
                            break;
                        default:
                    }
                }
            });
        this._internalRegistered = true;
    }

    /**
     * Unregister for listening to the internal channel.
     * @private
     */
    private _unregister() {
        const channel = this._scExchange.channel(this._chEvent);
        channel.unwatch();
        channel.destroy();
        this._internalRegistered = false;
    }

    /**
     * @internal
     * @param socket
     * @private
     */
    async _recheckSocketAccess(socket: Socket): Promise<void> {
        if(!(await this._preparedData.checkAccess(socket,{identifier: this.identifier}))){
            this.kickOut(socket);
        }
    }

    private _sendToWorkers(workerPackage: ChWorkerPackage) {
        this._scExchange.publish(this._chEvent,workerPackage);
    }

    /**
     * Close this Channel.
     * @param closePackage
     * @private
     */
    private _close(closePackage: ChClientOutputClosePackage) {
        for(const [socket, unsubscribeSocketFunction] of this._subSockets.entries()) {
            socket._emit(CH_CLIENT_OUTPUT_CLOSE,closePackage);
            unsubscribeSocketFunction(UnsubscribeTrigger.Close);
        }
    }

    /**
     * **Not override this method.**
     * Publish into this channel.
     * @param event
     * @param data
     * @param publisherSid
     * The publisher sid indicates the socket sid that publishes the data.
     * If you provide one the published data will not send to the publisher socket.
     */
    publish(event: string, data: any, publisherSid?: string) {
        const publishPackage: PublishPackage = {
            e: event,
            ...(data !== undefined ? {d: data} : {}),
            ...(publisherSid !== undefined ? {p: publisherSid} : {})
        };
        this._sendToWorkers([this._workerFullId,ChWorkerAction.publish,publishPackage] as ChWorkerPublishPackage);
        this._processPublish(publishPackage);
        this._onPublish(event,data);
    }

    /**
     * **Not override this method.**
     * The close function will close the Channel for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(code?: number | string,data?: any,forEveryWorker: boolean = true){
        const clientPackage: ChClientOutputClosePackage = {i: this._chEvent,c: code,d: data};
        if(forEveryWorker){
            this._sendToWorkers([this._workerFullId,ChWorkerAction.close,clientPackage] as ChWorkerClosePackage);
        }
        this._close(clientPackage);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Kicks out a socket from this channel.
     * @param socket
     * @param code
     * @param data
     */
    kickOut(socket: Socket, code?: number | string, data?: any) {
        const unsubscribeSocketFunction = this._subSockets.get(socket);
        if(unsubscribeSocketFunction){
            socket._emit(CH_CLIENT_OUTPUT_KICK_OUT,{i: this._chEvent,c: code,d: data} as ChClientOutputKickOutPackage);
            unsubscribeSocketFunction(UnsubscribeTrigger.KickOut);
        }
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when a socket subscribes to this channel.
     * @param socket
     */
    protected onSubscription(socket: Socket): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when a socket unsubscribes this channel.
     * @param socket
     * @param trigger
     */
    protected onUnsubscription(socket: Socket, trigger: UnsubscribeTrigger): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when data is published into this channel.
     * @param event
     * @param data
     */
    protected onPublish(event: string, data: any): Promise<void> | void {
    }
}

export type ChannelClass = typeof Channel;