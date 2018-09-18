/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SmallBag = require("./SmallBag");
import Bag      = require("./Bag");

export class Controller
{
    constructor() {}

    /**
     * @description
     * Gets invokes when the zation system is
     * creating instance of the controller (in worker start)
     * @param simpleBag
     */
    async initialize(simpleBag : SmallBag) : Promise<void> {}

    /**
     * @description
     * Gets invokes when the controller gets an request
     * and input is correct
     * @param bag
     * @param input
     * @return
     * The Return value of the function
     * is send to the client
     * with an success response.
     * @throws
     * You can also throw TaskErrors,
     * which are sent to the client
     * with a not success response.
     */
    async handle(bag : Bag,input : any) : Promise<any> {}

    /**
     * @description
     * Gets invokes when the controller gets an request
     * with wrong input
     * @param bag
     * @param input
     */
    async wrongInput(bag : Bag,input : any) : Promise<void> {}
}

