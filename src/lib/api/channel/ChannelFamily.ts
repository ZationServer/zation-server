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
    CHANNEL_MEMBER_SPLIT,
    CHANNEL_START_INDICATOR,
    ChClientInputAction,
    ChClientInputPackage,
    ChClientOutputClosePackage,
    ChClientOutputKickOutPackage,
    ChClientOutputPublishPackage, ChMember,
    ChWorkerAction,
    ChWorkerClosePackage,
    ChWorkerPackage,
    ChWorkerPublishPackage,
    ChWorkerRecheckMemberAccessPackage,
    PublishPackage,
    UnsubscribeSocketFunction,
    UnsubscribeTrigger
} from '../../main/channel/channelDefinitions';
import {familyTypeSymbol}                       from '../../main/component/componentUtils';
import ChannelUtils                             from '../../main/channel/channelUtils';
import {isDefaultImpl, markAsDefaultImpl}       from '../../main/utils/defaultImplUtils';
import MiddlewaresPreparer, {MiddlewareInvoker} from '../../main/middlewares/middlewaresPreparer';
import {stringifyMember}                        from '../../main/utils/memberParser';
import CloneUtils                               from '../../main/utils/cloneUtils';
import ObjectUtils                              from '../../main/utils/objectUtils';
import {DeepReadonly}                           from '../../main/utils/typeUtils';
import Timeout = NodeJS.Timeout;

/**
 * Channels implements the subscribe/publish architecture.
 * They ideal for sending something to multiple clients.
 * When you want to reach that data should be kept up to date
 * on a client in real-time you should use Databoxes instead.
 *
 * The ChannelFamily class gives you the possibility to define a
 * family of Channels that only differ by an id (also named: member).
 * That is useful in a lot of cases, for example, if you want to have a
 * ChannelFamily for user notifications.
 * Then the Channels only differ by the ids of the users.
 *
 * You can override these methods:
 * - initialize
 *
 * events:
 * - onSubscription
 * - onUnsubscription
 * - onPublish
 *
 * middleware methods:
 * - memberMiddleware
 */
export default class ChannelFamily<M = string> extends ChannelCore {

    /**
     * Maps the member to the sockets and kick out function.
     */
    private readonly _regMembers: Map<string,Map<Socket,UnsubscribeSocketFunction>> = new Map();
    /**
     * Maps the sockets to the members.
     */
    private readonly _socketMembers: Map<Socket,Map<string,DeepReadonly<M>>> = new Map<Socket, Map<string,DeepReadonly<M>>>();
    private readonly _unregisterMemberTimeoutMap: Map<string,Timeout> = new Map();
    private readonly _maxSocketMembers: number;

    private readonly _chId: string;
    private readonly _chEventPreFix: string;

    private readonly _onPublish: (member: DeepReadonly<M>,event: string, data: any) => Promise<void> | void;
    private readonly _onSubscription: (member: DeepReadonly<M>,socket: Socket) => Promise<void> | void;
    private readonly _onUnsubscription: (member: DeepReadonly<M>, socket: Socket, trigger: UnsubscribeTrigger) => Promise<void> | void;
    private readonly _memberMiddleware: MiddlewareInvoker<typeof ChannelFamily['prototype']['memberMiddleware']>;

    constructor(identifier: string, bag: Bag, chPreparedData: ChPreparedData, apiLevel: number | undefined)
    {
        super(identifier,bag,chPreparedData,apiLevel);

        this._maxSocketMembers = chPreparedData.maxSocketMembers;

        this._chId = CHANNEL_START_INDICATOR + this.identifier +
            (apiLevel !== undefined ? `@${apiLevel}`: '');
        this._chEventPreFix = this._chId + CHANNEL_MEMBER_SPLIT;

        const errMessagePrefix = this.toString() + ' error was thrown in the function';
        this._onPublish = FuncUtils.createSafeCaller(this.onPublish,
            `${errMessagePrefix} onPublish`,ErrorEventHolder.get());
        this._onSubscription = FuncUtils.createSafeCaller(this.onSubscription,
            `${errMessagePrefix} onSubscription`,ErrorEventHolder.get());
        this._onUnsubscription = FuncUtils.createSafeCaller(this.onUnsubscription,
            `${errMessagePrefix} onUnsubscription`,ErrorEventHolder.get());
        this._memberMiddleware = MiddlewaresPreparer.createMiddlewareAsyncSafeInvoker(
            !isDefaultImpl(this.memberMiddleware) ? this.memberMiddleware : undefined,
            true, this.toString() + ' error was thrown in the member middleware', ErrorEventHolder.get());
    }

    /**
     * @internal
     * **Not override this method.**
     * Used internally.
     */
    async _subscribeSocket(socket: Socket, member?: any): Promise<string>{
        if(member == null){
            const err: any = new Error('The family member is required to subscribe to a channel family.');
            err.name = ClientErrorName.MemberMissing;
            throw err;
        }

        //validate member
        await this._validateMemberInput(CloneUtils.deepClone(member));

        if(typeof member === 'object') ObjectUtils.deepFreeze(member);
        const memberStr = stringifyMember(member);

        const chEvent = this._chEventPreFix + memberStr;

        const memberMap = this._regMembers.get(memberStr);
        if(memberMap && memberMap.has(socket)){
            //already subscribed
            return chEvent;
        }

        //new subscription
        const memberMidRes = await this._memberMiddleware(member);
        if(memberMidRes) throw memberMidRes;

        await this._checkSubscribeAccess(socket,{identifier: this.identifier,member});

        const socketMembers = this._socketMembers.get(socket);
        ChannelUtils.maxMembersCheck(socketMembers ? socketMembers.size : 0,this._maxSocketMembers);

        this._addSocket({memberStr,member},socket);
        this._onSubscription(member,socket);
        return this._chId;
    }

    private _addSocket(member: ChMember<M>,socket: Socket) {
        const memberMap = this._buildSocketFamilyMemberMap(member);

        const disconnectHandler = () => this._unsubscribeSocket(member,socket,disconnectHandler,UnsubscribeTrigger.Disconnect);

        socket._on(this._chEventPreFix + member.memberStr,(senderPackage: ChClientInputPackage, respond) => {
            if(senderPackage[0] === ChClientInputAction.Unsubscribe) {
                this._unsubscribeSocket(member,socket,disconnectHandler,UnsubscribeTrigger.Client);
                respond(null);
            }
            else {
                const err: any = new Error('Unknown action');
                err.name = ClientErrorName.UnknownAction;
                respond(err);
            }
        });
        socket._on('disconnect',disconnectHandler);
        memberMap.set(socket,(trigger: UnsubscribeTrigger) => this._unsubscribeSocket(member,socket,disconnectHandler,trigger));

        //socket member map
        let socketMemberMap = this._socketMembers.get(socket);
        if(!socketMemberMap){
            socketMemberMap = new Map<string,DeepReadonly<M>>();
            this._socketMembers.set(socket,socketMemberMap);
        }
        socketMemberMap.set(member.memberStr,member.member)

        socket.getChannels().push(this);
    }

    /**
     * Returns the socket family member map or builds a new one and returns it.
     * @param member
     * @private
     */
    private _buildSocketFamilyMemberMap(member: ChMember<M>): Map<Socket,UnsubscribeSocketFunction> {
        let memberMap = this._regMembers.get(member.memberStr);
        if(!memberMap) memberMap = this._registerMember(member);
        else this._clearUnregisterMemberTimeout(member.memberStr);
        return memberMap;
    }

    /**
     * Registers for listening to a new family member.
     * @param member
     * @private
     */
    private _registerMember(member: ChMember<M>): Map<Socket,UnsubscribeSocketFunction> {
        const memberStr = member.memberStr;
        const memberMap = new Map<Socket,UnsubscribeSocketFunction>();
        this._regMembers.set(memberStr,memberMap);
        this._scExchange.subscribe(this._chEventPreFix + memberStr)
            .watch(async (data: ChWorkerPackage) => {
                if(data[0] !== this._workerFullId) {
                    switch (data[1]) {
                        case ChWorkerAction.publish:
                            this._processPublish(memberStr,(data as ChWorkerPublishPackage)[2]);
                            break;
                        case ChWorkerAction.recheckMemberAccess:
                            await this._recheckMemberAccess(member);
                            break;
                        case ChWorkerAction.close:
                            this._close(memberStr,(data as ChWorkerClosePackage)[2]);
                            break;
                        default:
                    }
                }
            });
        return memberMap;
    }

    /**
     * Unregisters for listening to a family member.
     * @param memberStr
     * @private
     */
    private _unregisterMember(memberStr: string) {
        this._regMembers.delete(memberStr);
        const channel = this._scExchange.channel(this._chEventPreFix+memberStr);
        channel.unwatch();
        channel.destroy();
    }

    private _unsubscribeSocket({memberStr, member}: ChMember<M>, socket: Socket, disconnectHandler: () => void, trigger: UnsubscribeTrigger) {
        this._rmSocket(memberStr,socket,disconnectHandler);
        this._onUnsubscription(member,socket,trigger);
    }

    private _rmSocket(memberStr: string, socket: Socket, disconnectHandler: () => void) {
        //main member socket map
        const memberMap = this._regMembers.get(memberStr);
        if(memberMap){
            memberMap.delete(socket);
            if(memberMap.size === 0)
                this._createUnregisterMemberTimeout(memberStr);
        }

        //socket member map
        const socketMemberMap = this._socketMembers.get(socket);
        if(socketMemberMap){
            socketMemberMap.delete(memberStr);
            if(socketMemberMap.size === 0)
                this._socketMembers.delete(socket);
        }

        socket._off(this._chEventPreFix+memberStr);
        socket._off('disconnect',disconnectHandler);
        removeValueFromArray(socket.getChannels(),this);
    }

    /**
     * Clears the timeout to unregister the member.
     * @param memberStr
     * @private
     */
    private _clearUnregisterMemberTimeout(memberStr: string): void {
        const timeout = this._unregisterMemberTimeoutMap.get(memberStr);
        if(timeout !== undefined) clearTimeout(timeout);
        this._unregisterMemberTimeoutMap.delete(memberStr);
    }

    /**
     * Creates (set or renew) the timeout to unregister a member.
     * @param memberStr
     * @private
     */
    private _createUnregisterMemberTimeout(memberStr: string): void {
        const timeout = this._unregisterMemberTimeoutMap.get(memberStr);
        if(timeout !== undefined) clearTimeout(timeout);
        this._unregisterMemberTimeoutMap.set(memberStr,setTimeout(() => {
            this._unregisterMember(memberStr);
            this._unregisterMemberTimeoutMap.delete(memberStr);
        }, this._unregisterDelay));
    }

    /**
     * Processes an internal publish.
     * @private
     */
    private _processPublish(memberStr: string,publish: PublishPackage) {
        const memberMap = this._regMembers.get(memberStr);
        if(memberMap){
            const outputPackage = {i: this._chId,m: memberStr,e: publish.e,d: publish.d} as ChClientOutputPublishPackage;
            if(publish.p === undefined){
                for (const socket of memberMap.keys()){
                    socket._emit(CH_CLIENT_OUTPUT_PUBLISH,outputPackage);
                }
            }
            else {
                const publisherSid = publish.p;
                for (const socket of memberMap.keys()){
                    if(publisherSid === socket.sid) continue;
                    socket._emit(CH_CLIENT_OUTPUT_PUBLISH,outputPackage);
                }
            }
        }
    }

    /**
     * @internal
     * @param socket
     * @private
     */
    async _recheckSocketAccess(socket: Socket): Promise<void> {
        const members = this._socketMembers.get(socket);
        if(!members) return;
        const promises: Promise<void>[] = [];
        for(const [memberStr, member] of members.entries()) {
            promises.push((async () => {
                if(!(await this._preparedData.checkAccess(socket,
                    {identifier: this.identifier,member}))) {
                    this._kickOut(memberStr,socket);
                }
            })());
        }
        await Promise.all(promises);
    }

    /**
     * @internal
     * @param memberStr
     * @param member
     * @private
     */
    private async _recheckMemberAccess({memberStr,member}: ChMember<M>): Promise<void> {
        const memberMem = this._regMembers.get(memberStr);
        if(!memberMem) return;
        const promises: Promise<void>[] = [];
        for(const socket of memberMem.keys()) {
            promises.push((async () => {
                if(!(await this._preparedData.checkAccess(socket,
                    {identifier: this.identifier,member}))) {
                    this._kickOut(memberStr,socket);
                }
            })())
        }
        await Promise.all(promises);
    }

    /**
     * Close the family member of this Channel.
     * @param memberStr
     * @param closePackage
     * @private
     */
    private _close(memberStr: string,closePackage: ChClientOutputClosePackage) {
        const memberMem = this._regMembers.get(memberStr);
        if(memberMem){
            for(const [socket, unsubscribeSocketFunction] of memberMem.entries()) {
                socket._emit(CH_CLIENT_OUTPUT_CLOSE,closePackage);
                unsubscribeSocketFunction(UnsubscribeTrigger.Close);
            }
        }
    }

    private _sendToWorkers(memberStr: string,workerPackage: ChWorkerPackage) {
        this._scExchange.publish(this._chEventPreFix+memberStr,workerPackage);
    }

    /**
     * @internal
     * **Not override this method.**
     * With this function, you can kick out a socket from a family member of the Channel.
     * This method is used internally.
     * @param memberStr
     * @param socket
     * @param code
     * @param data
     */
    _kickOut(memberStr: string, socket: Socket, code?: number | string, data?: any): void {
        const memberMap = this._regMembers.get(memberStr);
        if(memberMap){
            const unsubscribeSocketFunction = memberMap.get(socket);
            if(unsubscribeSocketFunction){
                socket._emit(CH_CLIENT_OUTPUT_KICK_OUT,{i: this._chId,m: memberStr,c: code,d: data} as ChClientOutputKickOutPackage);
                unsubscribeSocketFunction(UnsubscribeTrigger.KickOut);
            }
        }
    }

    /**
     * **Not override this method.**
     * This method returns an array
     * with all members that the socket has subscribed.
     * @param socket
     */
    getSocketSubMembers(socket: Socket): DeepReadonly<M>[] {
        const members = this._socketMembers.get(socket);
        return members ? Array.from(members.values()): [];
    }

    /**
     * **Not override this method.**
     * Publish into a member of this channel.
     * @param member
     * @param event
     * @param data
     * @param publisherSid
     * The publisher sid indicates the socket sid that publishes the data.
     * If you provide one the published data will not send to the publisher socket.
     */
    publish(member: M,event: string, data: any, publisherSid?: string) {
        const memberStr = stringifyMember(member);
        const publishPackage: PublishPackage = {
            e: event,
            ...(data !== undefined ? {d: data} : {}),
            ...(publisherSid !== undefined ? {p: publisherSid} : {})
        };
        this._sendToWorkers(memberStr, [this._workerFullId,ChWorkerAction.publish,publishPackage] as ChWorkerPublishPackage);
        this._processPublish(memberStr,publishPackage);
        this._onPublish(member as DeepReadonly<M>,event,data);
    }

    /**
     * **Not override this method.**
     * The close function will close a Channel member for every client on every server.
     * You optionally can provide a code or any other information for the client.
     * Usually, the close function is used when the data is completely deleted from the system.
     * For example, a chat that doesn't exist anymore.
     * @param member The member of the family you want to close.
     * @param code
     * @param data
     * @param forEveryWorker
     */
    close(member: M,code?: number | string,data?: any,forEveryWorker: boolean = true){
        const memberStr = stringifyMember(member);
        const clientPackage: ChClientOutputClosePackage = {i: this._chId,m: memberStr,c: code,d: data};
        if(forEveryWorker)
            this._sendToWorkers(memberStr,[this._workerFullId,ChWorkerAction.close,clientPackage] as ChWorkerClosePackage)
        this._close(memberStr,clientPackage);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Not override this method.**
     * Kicks out a socket from a member of this channel.
     * @param member
     * @param socket
     * @param code
     * @param data
     */
    kickOut(member: M, socket: Socket, code?: number | string, data?: any) {
        this._kickOut(stringifyMember(member),socket,code,data);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * With this function, you can do a recheck of all sockets on a specific member.
     * It can be useful when the access rights to member have changed,
     * and you want to kick out all sockets that not have access anymore.
     * Notice that the promise is resolved when the access was checked
     * on the current worker and request sent to other workers.
     * @param member
     * @param forEveryWorker
     */
    async recheckMemberAccess(member: M, forEveryWorker: boolean = true): Promise<void> {
        const memberStr = stringifyMember(member);
        if(forEveryWorker)
            this._sendToWorkers(memberStr, [this._workerFullId,ChWorkerAction.recheckMemberAccess] as ChWorkerRecheckMemberAccessPackage);
        await this._recheckMemberAccess({memberStr,member: member as DeepReadonly<M>});
    }

    /**
     * **Can be overridden.**
     * With the member middleware, you can protect your ChannelFamily against invalid members.
     * For example, when you have a Channel for user-notifications and the member represents
     * the user id you can block invalid user ids. To block the member, you can return an error (You can make use of the InvalidMemberError),
     * false or the block symbol or throwing the block symbol.
     * If you don't return anything, the member will be allowed.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @param member
     */
    public memberMiddleware(member: DeepReadonly<M>): Promise<boolean | object | any> | boolean | object | any {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when a socket subscribes to this channel.
     * @param member
     * @param socket
     */
    protected onSubscription(member: DeepReadonly<M>,socket: Socket): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when a socket unsubscribes this channel.
     * @param member
     * @param socket
     * @param trigger
     */
    protected onUnsubscription(member: DeepReadonly<M>, socket: Socket, trigger: UnsubscribeTrigger): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when data is published into this channel.
     * @param member
     * @param event
     * @param data
     */
    protected onPublish(member: DeepReadonly<M>,event: string, data: any): Promise<void> | void {
    }
}

ChannelFamily[familyTypeSymbol] = true;
ChannelFamily.prototype[familyTypeSymbol] = true;

markAsDefaultImpl(ChannelFamily.prototype['memberMiddleware']);

export type ChannelFamilyClass = typeof ChannelFamily;