/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket from "./socket";

export interface ScChannel {
    getState(): string
    subscribe(): void
    unsubscribe(): void
    isSubscribed(includePending?: boolean): boolean
    publish(data: any, callback?: (err: any) => void): void
    watch(handler: (data: any) => void): void
    unwatch(handler?: (data: any) => void): void
    watchers(): ((data: any) => void)[]
    destroy(): void
}

export interface ScExchange {
    publish(channel: string, data: any, callback?: (err: any) => void): void
    subscribe(channelName: string): ScChannel
    unsubscribe(channelName: string): void
    watch(channel: string, handler: (data: any) => void): void
    unwatch(channel: string, handler?: (data: any) => void): void
    channel(channelName: string): ScChannel
    watchers(channel): ((data: any) => void)[]
    destroyChannel(channelName: string): void
    subscriptions(includePending: boolean): string[]
    isSubscribed(channelName: string, includePending?: boolean):  boolean
}

export default interface ScServer
{
    exchange: ScExchange;
    clients: Record<string,UpSocket>;
    clientsCount: number;
    pendingClients: object;
    pendingClientsCount: number;
    sourcePort: number;
    secure: boolean;
    host: string;
    ackTimeout: number;

    setCodecEngine: (engine: object) => void;
    close: () => void;

    addMiddleware: (type: string, middlewareFn: Function) => void;
    removeMiddleware: (type: string, middlewareFn: Function) => void;
    on: (event: string, fn: Function) => void;

    MIDDLEWARE_HANDSHAKE_WS: string;
    MIDDLEWARE_HANDSHAKE_SC: string;
    MIDDLEWARE_AUTHENTICATE: string;
    MIDDLEWARE_SUBSCRIBE: string;
    MIDDLEWARE_PUBLISH_IN: string;
    MIDDLEWARE_PUBLISH_OUT: string;
    MIDDLEWARE_EMIT: string;
}