/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Socket from '../../../../api/Socket';
import Packet from '../../../../api/Packet';

export type CompHandleMiddlewareFunction = (socket: Socket, packet: Packet) => Promise<void> | void;

export interface CompHandleMiddlewareConfig  {

    /**
     * This property can be used to add middleware functions.
     * These middleware functions are called before
     * the handle method of this component.
     * Every middleware function will be bound to the component instance.
     * It can be used to prepare stuff on the packet attachment.
     * It is also possible to use that middleware as a shield of
     * the component because you can throw errors to avoid the handling process.
     * @example
     * middleware: [(socket, packet) => {...}]
     */
    middleware?: CompHandleMiddlewareFunction[] | CompHandleMiddlewareFunction;

}