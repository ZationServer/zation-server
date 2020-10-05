/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationToken from '../../../internalApi/zationToken';
import Socket      from '../../../../api/Socket';

export type MiddlewareAuthenticationFunction = (token: ZationToken) => Promise<boolean | object | any> | boolean | object | any;
export type MiddlewareSocketFunction = (socket: Socket) => Promise<boolean | object | any> | boolean | object | any;
export type MiddlewarePanelAuthFunction = (username: string, password: string) => Promise<boolean | void> | boolean | void;

export type MiddlewareValue<T> = T[] | T;

export interface Middleware {
    /**
     * Middleware event where you can block wrong jwt tokens.
     * You can provide one function or multiple middleware functions.
     * When providing multiple functions, they will be invoked in the defined sequence.
     * If one function returns some value, the chain will be broken,
     * and the value is the result.
     * That means if you return nothing, the next function will be called.
     * If no more function is remaining, the action will be allowed.
     * If one function returns true, the chain is broken,
     * and the token is allowed without invoking the remaining functions.
     * To block the token, you can return an object (that can be an error),
     * return false or throw an error.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (zationToken) => {}
     */
    authenticate?: MiddlewareValue<MiddlewareAuthenticationFunction>;
    /**
     * Middleware event where you can block sockets.
     * You can provide one function or multiple middleware functions.
     * When providing multiple functions, they will be invoked in the defined sequence.
     * If one function returns some value, the chain will be broken,
     * and the value is the result.
     * That means if you return nothing, the next function will be called.
     * If no more function is remaining, the action will be allowed.
     * If one function returns true, the chain is broken,
     * and the socket is allowed without invoking the remaining functions.
     * To block the socket, you can return an object (that can be an error),
     * return false or throw an error.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (socket) => {}
     */
    socket?: MiddlewareValue<MiddlewareSocketFunction>;
    /**
     * In the panel auth middleware, you have the possibility
     * to allow or block authentication requests to the panel with the credentials.
     * This is useful if you want to change user accounts dynamically or
     * connect them to users of a database.
     * The middleware will only be used after Zation was not able
     * to authenticate the user with the users defined in the main config.
     * You can provide one function or multiple middleware functions.
     * When providing multiple functions, they will be invoked in the defined sequence.
     * If one function returns some value, the chain will be broken,
     * and the value is the result.
     * That means if you return nothing, the next function will be called.
     * If no more function is remaining, the authentication request is blocked.
     * If one function returns true, the chain is broken,
     * and the authentication request is successful without
     * invoking the remaining functions.
     * To deny the authentication request,
     * you can return false or throw an error.
     * Runs on a worker process.
     * The Bag instance can be securely accessed with the variable 'bag'.
     * @example (username, password) => {}
     */
    panelAuth?: MiddlewareValue<MiddlewarePanelAuthFunction>;
}

export interface PreparedMiddleware extends Middleware{
    authenticate ?: MiddlewareAuthenticationFunction;
    socket?: MiddlewareSocketFunction;
    panelAuth?: MiddlewarePanelAuthFunction;
}