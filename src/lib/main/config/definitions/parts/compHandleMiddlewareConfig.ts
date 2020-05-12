/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import RequestBag from '../../../../api/RequestBag';

export type CompHandleMiddlewareFunction = (reqBag: RequestBag) => Promise<void> | void;

export interface CompHandleMiddlewareConfig  {

    /**
     * This property can be used to add middleware functions.
     * These middleware functions are called before the handle
     * method of this component occurs.
     * Every middleware function will be bound to the component instance.
     * It can be used to prepare stuff on the bag
     * (The bag is unique for every incoming package).
     * It is also possible to use that middleware as a shield of the
     * component because you can throw errors to avoid the handling process.
     * @example
     * middleware: [(bag) => {...}]
     */
    middleware?: CompHandleMiddlewareFunction[] | CompHandleMiddlewareFunction;

}