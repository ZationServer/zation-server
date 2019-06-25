/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Bag                                       from "../../api/Bag";
import {AuthAccessConfig, SystemAccessConfig, VersionAccessConfig} from "./configComponents";
import {InputConfig}                             from "./inputConfig";

export type PrepareHandleFunction = (bag : Bag) => Promise<void> | void;

export interface ControllerConfig extends InputConfig, VersionAccessConfig, SystemAccessConfig, AuthAccessConfig
{
    /**
     * This property can be used to add functions in the prepare handle event of this controller.
     * This event gets invoked before the handle method of the controller.
     * Every prepare handle method will also be bound to the controller instance.
     * It can be used to prepare stuff on the bag.
     * (The bag is unique for every request.)
     * It is also possible to throw an error to the client.
     * @example
     * prepareHandle : [(bag) => {...}]
     * @throws
     * You can also throw TaskErrors, which are sent to the client with a not success response.
     */
    prepareHandle ?: PrepareHandleFunction[] | PrepareHandleFunction;
    /**
     * Define if web socket protocol requests have access to this controller.
     * @default From default controller config otherwise true.
     */
    wsAccess  ?: boolean;
    /**
     * Define if HTTP protocol requests have access to this controller.
     * @default From default controller config otherwise true.
     */
    httpAccess  ?: boolean;
    /**
     * Define if HTTP GET requests are allowed.
     * @default From default controller config otherwise true.
     */
    httpGetAllowed  ?: boolean;
    /**
     * Define if HTTP POST requests are allowed.
     * @default From default controller config otherwise true.
     */
    httpPostAllowed  ?: boolean;
    /**
     * Specify if every input is allowed
     * that means the input validation and converter are disabled.
     * @default From default controller config otherwise false.
     */
    inputAllAllow  ?: boolean;
}