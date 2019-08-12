/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import RequestBag         from './RequestBag';
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../main/config/definitions/controllerConfig";
import Bag                from "./Bag";
import BackErrorBag       from "./BackErrorBag";

/**
 * The controller is one of the main concepts of zation.
 * It followers the request-response principle.
 * The controller can be protected with lots of possibilities,
 * also it supports input validation by using defined models.
 * Additionally it is easy to return a result or a collection of errors to the client.
 * A controller should be used for determining an action that the
 * client can make e.g., login, register, or sendMessage.
 * It is recommended if you want to get data from the server to use a DataBox instead of a
 * controller because it is much easier to use and provides the
 * functionality to keep the data up to date in real time.
 */
export default class Controller {
    /**
     * @description
     * The prepared bag from the worker.
     */
    protected bag: Bag;

    /**
     * @description
     * The name of the controller from the app config.
     */
    protected readonly name: string;

    /**
     * @description
     * The API level of the controller from the app config.
     * It can be undefined if no API level is defined.
     */
    protected readonly apiLevel: number | undefined;

    constructor(name : string, bag: Bag, apiLevel : number | undefined) {
        this.name = name;
        this.apiLevel = apiLevel;
        this.bag = bag;
    }

    /**
     * @description
     * This property is used for getting the configuration of this controller.
     */
    public static readonly config: ControllerConfig = {};

    /**
     * @description
     * Gets invokes when the zation system is creating instance of the controller (in worker start).
     * @param bag
     */
    async initialize(bag: Bag): Promise<void> {
    }

    /**
     * @description
     * Gets invokes when the controller gets an request and input is correct.
     * This method will only be invoked when the beforeHandle method has not thrown an error.
     * @param reqBag
     * @param input
     * @return
     * The Return value of the function is send to the client with an success response.
     * @throws
     * You can throw BackError or BackErrorBag, which are sent to the client with a not success response.
     * Notice that only the BackError or BackErrorBag sends back to the client.
     * All other errors or objects will be converted to an unknown BackError.
     */
    async handle(reqBag: RequestBag, input: any): Promise<any> {
    }

    /**
     * @description
     * This method will be every time invoked when the handle is finished.
     * Also if the handle method has thrown an error.
     * You can use this method to clean up resources or close connections.
     * (Use the req variable storage to save the resources on the RequestBag because the RequestBag is unique for every request).
     * @param reqBag
     * @param input
     */
    async finallyHandle(reqBag: RequestBag, input: any): Promise<void> {
    }

    /**
     * @description
     * Gets invokes when the controller gets an request with invalid input.
     * @param reqBag
     * @param input
     * @param backErrorBag
     * @throws
     * You can throw BackError or BackErrorBag
     * than the errors will be merged with the previous errors and send back to the client.
     * Notice that only the BackError or BackErrorBag sends back to the client.
     * All other errors or objects will be converted to an unknown BackError.
     */
    async invalidInput(reqBag: RequestBag, input: any, backErrorBag : BackErrorBag): Promise<void> {
    }
}

export interface ControllerClass {
    config: ControllerConfig;

    new(name : string, bag: Bag, apiLevel : number | undefined): Controller;

    prototype: any;
}
