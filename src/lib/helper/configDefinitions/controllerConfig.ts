/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Bag                                       from "../../api/Bag";
import SmallBag                                  from "../../api/SmallBag";
import ZationTokenInfo                           from "../infoObjects/zationTokenInfo";
import {SystemAccessConfig, VersionAccessConfig} from "./configComponents";
import {InputConfig}                             from "./inputConfig";

export type PrepareHandleFunction = (bag : Bag) => Promise<void> | void;

export type ControllerAccessFunction = (smallBag : SmallBag,token : ZationTokenInfo | null) => Promise<boolean> | boolean;

export interface ControllerConfig extends InputConfig, VersionAccessConfig, SystemAccessConfig
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
    /**
     * @description
     * Set the (Client Token State) access rule which clients are allowed to access this controller.
     * Notice that only one of the options 'access' or 'notAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default From default controller config otherwise false.
     * @example
     * //boolean
     * true            // All clients are allowed
     * false           // No client is allowed
     * //string
     * 'all'           // All clients are allowed
     * 'allAuth'       // Only all authenticated clients are allowed
     * 'allNotAuth'    // Only all not authenticated clients are allowed (all authenticated are not allowed)
     * 'admin'         // Only all admins are allowed
     * //number
     * 10              // Only all clients with user id 10 are allowed
     * //array
     * ['user','guest',23] // Only all clients with user group user, default user group or user id 23 are allowed.
     * //function
     * (smallBag : SmallBag,token : ZationTokenInfo | null) => {} // If returns true the client is allowed, false will not allow.
     */
    access  ?: string | number | (string | number)[] | ControllerAccessFunction;
    /**
     * @description
     * Set the (Client Token State) access rule which clients are not allowed to access this controller.
     * Notice that only one of the options 'access' or 'notAccess' is allowed.
     * Look in the examples to see what possibilities you have.
     * @default From default controller config otherwise false.
     * @example
     * //boolean
     * true            // No client is allowed
     * false           // All clients are allowed
     * //string
     * 'all'           // No client is allowed
     * 'allAuth'       // All authenticated clients are not allowed
     * 'allNotAuth'    // All not authenticated clients are not allowed (all authenticated are allowed)
     * 'admin'         // All admins are not allowed
     * //number
     * 10              // All clients with user id 10 are not allowed
     * //array
     * ['user','guest',23] // All clients with user group user, default user group or user id 23 are not allowed.
     * //function
     * (smallBag : SmallBag,token : ZationTokenInfo | null) => {}  // If returns true the client is not allowed, false will allow.
     */
    notAccess  ?: string | number | (string | number)[] | ControllerAccessFunction;
}