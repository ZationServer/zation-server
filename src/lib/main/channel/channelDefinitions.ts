/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

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
    m?: string;
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
 * A publish package that a worker can send to the other workers.
 */
export interface ChWorkerPublishPackage {
    /**
     * workerFullId
     */
    0: string,
    /**
     * Publish
     */
    1: PublishPackage
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

export type KickOutSocketFunction = () => void;

export enum UnsubscribeTrigger {
    Client,
    Disconnect,
    KickOut
}

/**
 * The Channel info object.
 */
export interface ChannelInfo {
    identifier: string,
    member?: string
}

export const CHANNEL_START_INDICATOR = 'C>';
export const CHANNEL_MEMBER_SPLIT = '.';