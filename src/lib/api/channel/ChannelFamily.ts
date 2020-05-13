/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ChannelCore, {ChPreparedData} from './ChannelCore';
import Bag                           from '../Bag';
import UpSocket                      from '../../main/sc/socket';
import {ClientErrorName}             from '../../main/constants/clientErrorName';
import ZSocket                       from '../../main/internalApi/zSocket';
import FuncUtils                     from '../../main/utils/funcUtils';
import {ErrorEventSingleton}         from '../../main/error/errorEventSingleton';
import {removeValueFromArray}        from '../../main/utils/arrayUtils';
import {
    CH_CLIENT_OUTPUT_KICK_OUT,
    CH_CLIENT_OUTPUT_PUBLISH, CHANNEL_MEMBER_SPLIT,
    CHANNEL_START_INDICATOR,
    ChClientInputAction,
    ChClientInputPackage,
    ChClientOutputKickOutPackage,
    ChClientOutputPublishPackage,
    ChWorkerPublishPackage,
    KickOutSocketFunction,
    PublishPackage,
    UnsubscribeTrigger
} from '../../main/channel/channelDefinitions';
import Timeout = NodeJS.Timeout;
import MemberCheckerUtils, {IsMemberChecker} from '../../main/member/memberCheckerUtils';
import {familyTypeSymbol}                    from '../../main/component/componentUtils';

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
 * - isMember
 *
 * events:
 * - onSubscription
 * - onUnsubscription
 * - onPublish
 */
export default class ChannelFamily extends ChannelCore {

    /**
     * Maps the member to the sockets and kick out function.
     */
    private readonly _regMember: Map<string,Map<UpSocket,KickOutSocketFunction>> = new Map();
    /**
     * Maps the sockets to the members.
     */
    private readonly _socketMembers: Map<UpSocket,Set<string>> = new Map<UpSocket, Set<string>>();
    private readonly _unregisterMemberTimeoutMap: Map<string,Timeout> = new Map();
    private readonly _isMemberCheck: IsMemberChecker;

    private readonly _chEventPreFix: string;

    private readonly _onPublish: (member: string,event: string, data: any) => Promise<void> | void;
    private readonly _onSubscription: (member: string,socket: ZSocket) => Promise<void> | void;
    private readonly _onUnsubscription: (member: string,socket: ZSocket,trigger: UnsubscribeTrigger) => Promise<void> | void;

    constructor(identifier: string, bag: Bag, chPreparedData: ChPreparedData, apiLevel: number | undefined)
    {
        super(identifier,bag,chPreparedData,apiLevel);
        this._isMemberCheck = MemberCheckerUtils.createIsMemberChecker(this.isMember.bind(this),this.bag);

        this._chEventPreFix = CHANNEL_START_INDICATOR + this.identifier +
            (apiLevel !== undefined ? `@${apiLevel}`: '') + CHANNEL_MEMBER_SPLIT;

        const errMessagePrefix = this.toString() + ' error was thrown in the function';
        this._onPublish = FuncUtils.createSafeCaller(this.onPublish,
            `${errMessagePrefix} onPublish`,ErrorEventSingleton.get());
        this._onSubscription = FuncUtils.createSafeCaller(this.onSubscription,
            `${errMessagePrefix} onSubscription`,ErrorEventSingleton.get());
        this._onUnsubscription = FuncUtils.createSafeCaller(this.onUnsubscription,
            `${errMessagePrefix} onUnsubscription`,ErrorEventSingleton.get());
    }

    /**
     * @internal
     * **Not override this method.**
     * Used internally.
     */
    async _subscribeSocket(socket: UpSocket, member?: string): Promise<string>{
        if(member == undefined){
            const err: any = new Error('The family member is required to subscribe to a channel family.');
            err.name = ClientErrorName.MemberMissing;
            throw err;
        }

        const chEvent = this._chEventPreFix + member;

        const memberMap = this._regMember.get(member);
        if(memberMap && memberMap.has(socket)){
            //already subscribed
            return chEvent;
        }

        //new subscription
        await this._isMemberCheck(member);
        await this._checkSubscribeAccess(socket,{identifier: this.identifier,member});
        this._addSocket(member,socket);
        this._onSubscription(member,socket.zSocket);
        return chEvent;
    }

    private _addSocket(member: string,socket: UpSocket) {
        const memberMap = this._buildSocketFamilyMemberMap(member);

        const disconnectHandler = () => this._unsubscribeSocket(member,socket,disconnectHandler,UnsubscribeTrigger.Disconnect);

        socket.on(this._chEventPreFix,(senderPackage: ChClientInputPackage, respond) => {
            if(senderPackage['0'] === ChClientInputAction.Unsubscribe) {
                this._unsubscribeSocket(member,socket,disconnectHandler,UnsubscribeTrigger.Client);
                respond(null);
            }
            else {
                const err: any = new Error('Unknown action');
                err.name = ClientErrorName.UnknownAction;
                respond(err);
            }
        });
        socket.on('disconnect',disconnectHandler);
        memberMap.set(socket,() => this._unsubscribeSocket(member,socket,disconnectHandler,UnsubscribeTrigger.KickOut));

        //socket member map
        let socketMemberSet = this._socketMembers.get(socket);
        if(!socketMemberSet){
            socketMemberSet = new Set<string>();
            this._socketMembers.set(socket,socketMemberSet);
        }
        socketMemberSet.add(member);

        socket.channels.push(this);
    }

    /**
     * Returns the socket family member map or builds a new one and returns it.
     * @param member
     * @private
     */
    private _buildSocketFamilyMemberMap(member: string): Map<UpSocket,KickOutSocketFunction> {
        let memberMap = this._regMember.get(member);
        if(!memberMap){
            memberMap = this._registerMember(member);
        }
        else {
            this._clearUnregisterMemberTimeout(member);
        }
        return memberMap;
    }

    /**
     * Registers for listening to a new family member.
     * @param member
     * @private
     */
    private _registerMember(member: string): Map<UpSocket,KickOutSocketFunction> {
        const memberMap = new Map<UpSocket,KickOutSocketFunction>();
        this._regMember.set(member,memberMap);
        this._scExchange.subscribe(this._chEventPreFix + member)
            .watch(async (data: ChWorkerPublishPackage) => {
                if(data[0] !== this._workerFullId) {
                    this._processPublish(member,data[1]);
                }
            });
        return memberMap;
    }

    /**
     * Unregisters for listening to a family member.
     * @param member
     * @private
     */
    private _unregisterMember(member: string) {
        this._regMember.delete(member);
        const channel = this._scExchange.channel(this._chEventPreFix+member);
        channel.unwatch();
        channel.destroy();
    }

    private _unsubscribeSocket(member: string,socket: UpSocket,disconnectHandler: () => void,trigger: UnsubscribeTrigger) {
        this._rmSocket(member,socket,disconnectHandler);
        this._onUnsubscription(member,socket.zSocket,trigger);
    }

    private _rmSocket(member: string,socket: UpSocket,disconnectHandler: () => void) {
        //main member socket map
        const memberMap = this._regMember.get(member);
        if(memberMap){
            memberMap.delete(socket);
            if(memberMap.size === 0){
                this._createUnregisterMemberTimeout(member);
            }
        }

        //socket member map
        const socketMemberSet = this._socketMembers.get(socket);
        if(socketMemberSet){
            socketMemberSet.delete(member);
            if(socketMemberSet.size === 0) {
                this._socketMembers.delete(socket);
            }
        }

        socket.off(this._chEventPreFix+member);
        socket.off('disconnect',disconnectHandler);
        removeValueFromArray(socket.channels,this);
    }

    /**
     * Clears the timeout to unregister the member.
     * @param member
     * @private
     */
    private _clearUnregisterMemberTimeout(member: string): void {
        const timeout = this._unregisterMemberTimeoutMap.get(member);
        if(timeout !== undefined){clearTimeout(timeout);}
        this._unregisterMemberTimeoutMap.delete(member);
    }

    /**
     * Creates (set or renew) the timeout to unregister a member.
     * @param member
     * @private
     */
    private _createUnregisterMemberTimeout(member: string): void {
        const timeout = this._unregisterMemberTimeoutMap.get(member);
        if(timeout !== undefined){clearTimeout(timeout);}
        this._unregisterMemberTimeoutMap.set(member,setTimeout(() => {
            this._unregisterMember(member);
            this._unregisterMemberTimeoutMap.delete(member);
        }, 120000));
    }

    /**
     * Processes an internal publish.
     * @private
     */
    private _processPublish(member: string,publish: PublishPackage) {
        const memberMap = this._regMember.get(member);
        if(memberMap){
            const outputPackage = [this._chEventPreFix+member,publish.e,publish.d] as ChClientOutputPublishPackage;
            if(publish.p === undefined){
                for (const socket of memberMap.keys()){
                    socket.emit(CH_CLIENT_OUTPUT_PUBLISH,outputPackage);
                }
            }
            else {
                const publisherSid = publish.p;
                for (const socket of memberMap.keys()){
                    if(publisherSid === socket.sid) continue;
                    socket.emit(CH_CLIENT_OUTPUT_PUBLISH,outputPackage);
                }
            }
        }
    }

    /**
     * @internal
     * @param socket
     * @private
     */
    async _checkSocketHasStillAccess(socket: UpSocket): Promise<void> {
        const members = this.getSocketSubMembers(socket);
        for(let i = 0; i < members.length; i++){
            if(!(await this._preparedData.accessCheck(socket.authEngine,socket.zSocket,
                {identifier: this.identifier,member: members[i]}))) {
                this.kickOut(members[i],socket);
            }
        }
    }

    /**
     * **Not override this method.**
     * This method returns a string array
     * with all members that the socket has subscribed.
     * This method is used internally.
     * @param socket
     */
    getSocketSubMembers(socket: UpSocket): string[] {
        const members = this._socketMembers.get(socket);
        return members ? Array.from(members): [];
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
    publish(member: string | number,event: string, data: any, publisherSid?: string) {
        member = typeof member === "string" ? member: member.toString();
        const publishPackage: PublishPackage = {
            e: event,
            ...(data !== undefined ? {d: data} : {}),
            ...(publisherSid !== undefined ? {p: publisherSid} : {})
        };
        this._scExchange.publish(this._chEventPreFix+member,[this._workerFullId,publishPackage] as ChWorkerPublishPackage);
        this._processPublish(member,publishPackage);
        this._onPublish(member,event,data);
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
    kickOut(member: string | number,socket: UpSocket,code?: number | string,data?: any) {
        member = typeof member === "string" ? member: member.toString();
        const memberMap = this._regMember.get(member);
        if(memberMap){
            const kickOutFunction = memberMap.get(socket);
            if(kickOutFunction){
                socket.emit(CH_CLIENT_OUTPUT_KICK_OUT,{ch: this._chEventPreFix+member,c: code,d: data} as ChClientOutputKickOutPackage);
                kickOutFunction();
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * **Can be overridden.**
     * Check if it is a member of the ChannelFamily.
     * Use this check only for security reason, for example,
     * checking the format of the value.
     * To mark the value as invalid,
     * you only need to return an object (that can be error information) or false.
     * Also if you throw an error, the value is marked as invalid.
     * If you want to mark the value as a member,
     * you have to return nothing or a true.
     * @param value
     * @param bag
     */
    public isMember(value: string, bag: Bag): Promise<boolean | Record<string,any> | void> | boolean | Record<string,any> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when a socket subscribes to this channel.
     * @param member
     * @param socket
     */
    protected onSubscription(member: string,socket: ZSocket): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when a socket unsubscribes this channel.
     * @param member
     * @param socket
     * @param trigger
     */
    protected onUnsubscription(member: string,socket: ZSocket,trigger: UnsubscribeTrigger): Promise<void> | void {
    }

    /**
     * **Can be overridden.**
     * A function that gets triggered when data is published into this channel.
     * @param member
     * @param event
     * @param data
     */
    protected onPublish(member: string,event: string, data: any): Promise<void> | void {
    }
}

ChannelFamily[familyTypeSymbol] = true;
ChannelFamily.prototype[familyTypeSymbol] = true;

export type ChannelFamilyClass = typeof ChannelFamily;