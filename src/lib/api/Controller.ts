/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag = require("./SmallBag");
import {Bag} from './Bag';
import ObjectPath = require("../helper/tools/objectPath");
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../helper/configs/appConfig";

export class Controller {
    private _storage: object = {};

    /**
     * @description
     * The prepared small bag from the worker.
     */
    protected smallBag: SmallBag;

    /**
     * @description
     * The name of the controller from the app config.
     */
    protected name: string;

    constructor(name : string,smallBag: SmallBag) {
        this.name = name;
        this.smallBag = smallBag;
    }

    /**
     * @description
     * This property is used for getting the configuration of this controller.
     */
    public static config: ControllerConfig = {};

    /**
     * @description
     * Gets invokes when the zation system is creating instance of the controller (in worker start).
     * @param smallBag
     */
    async initialize(smallBag: SmallBag): Promise<void> {
    }

    /**
     * @description
     * Gets invokes when the controller gets an request and input is correct.
     * This method will only be invoked when the beforeHandle method has not thrown an error.
     * @param bag
     * @param input
     * @return
     * The Return value of the function is send to the client with an success response.
     * @throws
     * You can also throw TaskErrors, which are sent to the client with a not success response.
     */
    async handle(bag: Bag, input: any): Promise<any> {
    }

    /**
     * @description
     * This method will be every time invoked when the handle is finished.
     * Also if the handle method has thrown an error.
     * You can use this method to clean up resources or close connections.
     * (Use the bag storage to save the resources the bag is unique for every request).
     * @param bag
     * @param input
     */
    async finallyHandle(bag: Bag, input: any): Promise<void> {
    }

    /**
     * @description
     * Gets invokes when the controller gets an request with wrong input.
     * @param bag
     * @param input
     */
    async wrongInput(bag: Bag, input: any): Promise<void> {
    }

    //Controller storage
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a controller variable (server side) with object path.
     * @example
     * setControllerVariable('email','example@gmail.com');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     */
    protected setControllerVariable(path: string | string[], value: any): void {
        ObjectPath.set(this._storage, path, value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a controller variable (server side) with object path.
     * @example
     * hasControllerVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    protected hasControllerVariable(path ?: string | string[]): boolean {
        return ObjectPath.has(this._storage, path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get controller variable (server side) with object path.
     * @example
     * getControllerVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    protected getControllerVariable<R>(path ?: string | string[]): R {
        return ObjectPath.get(this._storage, path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a controller variable (server side) with object path.
     * @example
     * deleteControllerVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    protected deleteControllerVariable(path ?: string | string[]): void {
        if (!!path) {
            ObjectPath.del(this._storage, path);
        } else {
            this._storage = {};
        }
    }
}

export interface ControllerClass {
    config: ControllerConfig;

    new(name : string,smallBag: SmallBag): Controller;

    prototype: any;
}
