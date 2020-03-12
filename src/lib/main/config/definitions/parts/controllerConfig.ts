/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import RequestBag                                                  from "../../../../api/RequestBag";
import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from "./configComponents";
import {InputConfig}                                               from "./inputConfig";

export type ControllerMiddlewareFunction = (reqBag: RequestBag) => Promise<void> | void;

export interface ControllerConfig extends InputConfig, VersionAccessConfig, SystemAccessConfig, AuthAccessConfig
{
    /**
     * This property can be used to add middleware function before the
     * handle event of this controller occurs.
     * Every middleware function will be bound to the controller instance.
     * It can be used to prepare stuff on the bag
     * (The bag is unique for every request).
     * It is also possible to use that middleware as a shield
     * of the controller because you can throw an error back to the client.
     * @example
     * middleware: [(bag) => {...}]
     * @throws
     * You can also throw BackErrors, which are sent to the client with a not success response.
     */
    middleware?: ControllerMiddlewareFunction[] | ControllerMiddlewareFunction;
    /**
     * Define if web socket protocol requests have access to this controller.
     * @default From default controller config otherwise true.
     */
    wsAccess?: boolean;
    /**
     * Define if HTTP protocol requests have access to this controller.
     * @default From default controller config otherwise true.
     */
    httpAccess?: boolean;
    /**
     * Define if HTTP GET requests are allowed.
     * @default From default controller config otherwise true.
     */
    httpGetAllowed?: boolean;
    /**
     * Define if HTTP POST requests are allowed.
     * @default From default controller config otherwise true.
     */
    httpPostAllowed?: boolean;
}