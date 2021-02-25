/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DeepReadonly} from '../utils/typeUtils';

/**
 * Channel subscribe request element.
 */
export interface ChannelSubscribeRequest {
    /**
     * channel identifier
     */
    c: string;
    /**
     * member
     */
    m?: any;
    /**
     * apiLevel
     */
    a?: number;
}

export interface PublishPackage {
    /**
     * The event name.
     */
    e: string,
    /**
     * Published data.
     */
    d?: any,
    /**
     * PublisherSid
     */
    p?: string | null,
}

/**
 * Actions that a worker can send to another worker.
 */
export const enum ChWorkerAction {
    /**
     * New publish.
     */
    publish,
    /**
     * Recheck member access request.
     */
    recheckMemberAccess,
    /**
     * Close the Channel
     */
    close
}

/**
 * A package that a worker can send to the other workers.
 */
export interface ChWorkerPackage {
    /**
     * source workerFullId
     */
    0: string,
    /**
     * action
     */
    1: ChWorkerAction,
    /**
     * data
     */
    2?: any
}

/**
 * A publish package that a worker can send to the other workers.
 */
export interface ChWorkerPublishPackage extends ChWorkerPackage {
    /**
     * workerFullId
     */
    0: string,
    /**
     * action
     */
    1: ChWorkerAction.publish,
    /**
     * Publish
     */
    2: PublishPackage
}

/**
 * Recheck member access request package that the worker can send to other workers.
 */
export interface ChWorkerRecheckMemberAccessPackage extends ChWorkerPackage{
    /**
     * action
     */
    1: ChWorkerAction.recheckMemberAccess
}

/**
 * A close package that a worker can send to the other workers.
 */
export interface ChWorkerClosePackage extends ChWorkerPackage {
    /**
     * workerFullId
     */
    0: string,
    /**
     * action
     */
    1: ChWorkerAction.close,
    /**
     * Close
     */
    2: ChClientOutputClosePackage
}

/**
 * Actions that a client can send to the server.
 */
export const enum ChClientInputAction {
    Unsubscribe
}

/**
 * The package that the client can send to the server to invoke an action.
 */
export interface ChClientInputPackage {
    /**
     * Action
     */
    0: ChClientInputAction,
}

export const CH_CLIENT_OUTPUT_PUBLISH = 'C>P';

export interface ChClientOutputPublishPackage {
    /**
     * Channel id
     */
    i: string;
    /**
     * Member
     */
    m?: string;
    /**
     * Event
     */
    e: string;
    /**
     * Data
     */
    d?: any;
}

export const CH_CLIENT_OUTPUT_KICK_OUT = 'C>K';

export interface ChClientOutputKickOutPackage {
    /**
     * Channel id
     */
    i: string;
    /**
     * Member
     */
    m?: string;
    /**
     * code
     */
    c?: number | string;
    /**
     * data
     */
    d?: any;
}

export const CH_CLIENT_OUTPUT_CLOSE = 'C>C';

export interface ChClientOutputClosePackage {
    /**
     * Channel id
     */
    i: string;
    /**
     * Member
     */
    m?: string;
    /**
     * code
     */
    c?: number | string;
    /**
     * data
     */
    d?: any;
}

export type UnsubscribeSocketFunction = (trigger: UnsubscribeTrigger) => void;

export enum UnsubscribeTrigger {
    Client,
    Disconnect,
    KickOut,
    Close
}

/**
 * The Channel info object.
 */
export interface ChannelInfo {
    identifier: string,
    /**
     * Notice that the member is deep readonly and only given in Family components.
     */
    member?: any
}

/**
 * Internal member wrapper interface.
 */
export interface ChMember<M> {
    memberStr: string,
    member: DeepReadonly<M>
}

export const CHANNEL_START_INDICATOR = 'C>';
export const CHANNEL_MEMBER_SPLIT = '.';