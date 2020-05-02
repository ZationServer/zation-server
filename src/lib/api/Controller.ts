/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import RequestBag         from './RequestBag';
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig} from "../main/config/definitions/parts/controllerConfig";
import Bag                from "./Bag";
import BackErrorBag       from "./BackErrorBag";
import ConfigBuildError        from '../main/config/manager/configBuildError';
import Component, {ComponentClass} from './Component';

/**
 * The controller is one of the main concepts of zation.
 * It followers the request-response principle.
 * The controller can be protected with lots of possibilities,
 * also it supports input validation by using defined models.
 * Additionally it is easy to return a result or a collection of errors to the client.
 * A controller should be used for determining an action that the
 * client can make e.g., login, register, or sendMessage.
 * It is recommended if you want to get data from the server to use a Databox instead of a
 * controller because it is much easier to use and provides the
 * functionality to keep the data up to date in real time.
 */
export default class Controller extends Component {
    /**
     * @description
     * The prepared bag from the worker.
     */
    protected bag: Bag;

    constructor(identifier: string, bag: Bag, apiLevel: number | undefined) {
        super(identifier,apiLevel);
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
    initialize(bag: Bag): Promise<void> | void {
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
    handle(reqBag: RequestBag, input: any): Promise<any> | any {
    }

    /**
     * @description
     * This method will be every time invoked when the handle is finished.
     * Also if the handle method has thrown an error.
     * Error thrown in this method will be logged but not sent back to the client.
     * You can use this method to clean up resources or close connections.
     * (Use the req variable storage to save the resources on the RequestBag because the RequestBag is unique for every request).
     * @param reqBag
     * @param input
     */
    finallyHandle(reqBag: RequestBag, input: any): Promise<void> | void {
    }

    /**
     * @description
     * Gets invokes when the controller gets an request with invalid input.
     * @param reqBag
     * @param rawInput
     * Notice that you will get the raw input means only
     * the data the user has sent without processed by the models.
     * @param backErrorBag
     * @throws
     * You can throw BackError or BackErrorBag
     * than the errors will be merged with the previous errors and send back to the client.
     * Notice that only the BackError or BackErrorBag sends back to the client.
     * All other errors or objects will be converted to an
     * unknown BackError and overrides all previous BackErrors.
     */
    invalidInput(reqBag: RequestBag, rawInput: any, backErrorBag: BackErrorBag): Promise<void> | void {
    }

    /**
     * Decorator for set the Controller config.
     * But notice that when you use the decorator
     * that you cannot set the config property by yourself.
     * @param controllerConfig
     * @example
     * @Controller.Config({});
     */
    public static Config(controllerConfig: ControllerConfig) {
        return (target: ComponentClass) => {
            if(target.prototype instanceof Controller) {
                target.config = controllerConfig;
            }
            else {
                throw new ConfigBuildError(`The ControllerConfig decorator can only be used on a class that extends the Controller class.`);
            }
        }
    }
}

export interface ControllerClass {
    config: ControllerConfig;

    new(identifier: string, bag: Bag, apiLevel: number | undefined): Controller;

    prototype: any;
}
