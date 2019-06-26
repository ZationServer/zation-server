/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Bag                from './Bag';
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../helper/configDefinitions/controllerConfig";
import SmallBag           from "./SmallBag";
import BackErrorBag       from "./BackErrorBag";

export default class Controller {
    /**
     * @description
     * The prepared small bag from the worker.
     */
    protected smallBag: SmallBag;

    /**
     * @description
     * The id of the controller from the app config.
     */
    protected readonly id: string;

    /**
     * @description
     * The API level of the controller from the app config.
     * It can be undefined if no API level is defined.
     */
    protected readonly apiLevel: number | undefined;

    constructor(id : string,smallBag: SmallBag,apiLevel : number | undefined) {
        this.id = id;
        this.apiLevel = apiLevel;
        this.smallBag = smallBag;
    }

    /**
     * @description
     * This property is used for getting the configuration of this controller.
     */
    public static readonly config: ControllerConfig = {};

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
     * You can throw BackError or BackErrorBag, which are sent to the client with a not success response.
     * Notice that only the BackError or BackErrorBag sends back to the client.
     * All other errors or objects will be converted to an unknown BackError.
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
     * @param backErrorBag
     * @throws
     * You can throw BackError or BackErrorBag
     * than the errors will be merged with the previous errors and send back to the client.
     * Notice that only the BackError or BackErrorBag sends back to the client.
     * All other errors or objects will be converted to an unknown BackError.
     */
    async wrongInput(bag: Bag, input: any, backErrorBag : BackErrorBag): Promise<void> {
    }
}

export interface ControllerClass {
    config: ControllerConfig;

    new(id : string,smallBag: SmallBag,apiLevel : number | undefined): Controller;

    prototype: any;
}
