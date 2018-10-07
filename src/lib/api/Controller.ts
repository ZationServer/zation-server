/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag   = require("./SmallBag");
import Bag        = require("./Bag");
import ObjectPath = require("../helper/tools/objectPath");

export class Controller
{
    private _storage : object = {};

    constructor() {}

    /**
     * @description
     * Gets invokes when the zation system is creating instance of the controller (in worker start).
     * @param simpleBag
     */
    async initialize(simpleBag : SmallBag) : Promise<void> {}

    /**
     * @description
     * Gets invokes when the controller gets an request and input is correct.
     * @param bag
     * @param input
     * @return
     * The Return value of the function is send to the client with an success response.
     * @throws
     * You can also throw TaskErrors, which are sent to the client with a not success response.
     */
    async handle(bag : Bag,input : any) : Promise<any> {}

    /**
     * @description
     * Gets invokes when the controller gets an request with wrong input.
     * @param bag
     * @param input
     */
    async wrongInput(bag : Bag,input : any) : Promise<void> {}

    //Controller storage
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a controller variable (server side) with object path.
     * @example
     * setControllerVariable('email','example@gmail.com');
     * @param path
     * @param value
     */
    protected setControllerVariable(path : string | string[],value : any) : void {
        ObjectPath.set(this._storage,path,value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a controller variable (server side) with object path.
     * @example
     * hasControllerVariable('email');
     * @param path
     */
    protected hasControllerVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(this._storage,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get controller variable (server side) with object path.
     * @example
     * getControllerVariable('email');
     * @param path
     */
    protected getControllerVariable(path ?: string | string[]) : any {
        return ObjectPath.get(this._storage,path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a controller variable (server side) with object path.
     * @example
     * deleteControllerVariable('email');
     * @param path
     */
    protected deleteControllerVariable(path ?: string | string[]) : void {
        if(!!path) {
            ObjectPath.del(this._storage,path);
        }
        else {
            this._storage = {};
        }
    }
}

