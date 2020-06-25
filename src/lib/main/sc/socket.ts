/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RawZationToken}     from "../definitions/internal";
import {IncomingMessage}    from "http";
import Socket               from "../../api/Socket";

export type OnHandlerFunction = (data: any, response: RespondFunction) => void
export type RespondFunction = (err?: any | number, responseData?: any) => void

export interface RawSocket {
    readonly id: string;
    readonly sid: string;
    readonly tid: string;

    readonly request: IncomingMessage;
    readonly remoteAddress: string;
    readonly exchange: any;
    readonly state: string;
    readonly authState: string;
    authToken: RawZationToken | null;
    readonly CONNECTING: string;
    readonly OPEN: string;
    readonly CLOSED: string;
    readonly AUTHENTICATED: string;
    readonly UNAUTHENTICATED: string;

    readonly handshakeAttachment: Record<string,any>;
    readonly clientVersion: number,
    readonly clientSystem: string,
    readonly apiLevel: number | undefined

    readonly _socket: Socket;

    getState(): string;
    disconnect(code?: any, data?: any): void;
    emit(event: string, data: object, callback?: RespondFunction): void;
    on(event: string, handler: OnHandlerFunction): void;
    once(event: string, handler: OnHandlerFunction): void;
    off(event?: string, handler?: Function): void;
    send(data: any, options?: object): void;
    getAuthToken(): RawZationToken | null;

    /**
     * Set the auth token of the socket.
     * This is method is used internally;
     * if you do not use it carefully,
     * it can create a not valid zation token and break the worker memory stored information.
     * So please use the Bag or Bag to change token variables.
     * @param data
     * @param options
     * @param callback
     */
    setAuthToken(data: object, options?: object,callback?: Function): void;
    deauthenticate(): void;
    kickOut(channel?: string, message?: string, callback?: Function): void;
    subscriptions(): string[];
    isSubscribed(channelName: string): boolean;
}

