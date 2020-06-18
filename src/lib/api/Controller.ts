/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig} from "../main/config/definitions/parts/controllerConfig";
import Bag                from "./Bag";
import BackErrorBag       from "./BackErrorBag";
import ConfigBuildError   from '../main/config/manager/configBuildError';
import Component, {ComponentClass}        from './component/Component';
import {VersionSystemAccessCheckFunction} from '../main/systemVersion/systemVersionChecker';
import {TokenStateAccessCheckFunction}    from '../main/controller/controllerAccessHelper';
import {InputConsumeFunction, InputValidationCheckFunction} from '../main/input/inputClosureCreator';
import {componentTypeSymbol}                                from '../main/component/componentUtils';
import {CompHandleMiddlewareInvoker}                        from '../main/compHandleMiddleware/compHandleMiddlewareUtils';
import Socket                                               from './Socket';
import Packet                                               from './Packet';

/**
 * The Controller is one of the zation components.
 * It followers the request-response principle.
 * The controller can be protected with access rules, also it
 * supports input validation by using models. Additionally,
 * it is easy to return a result or a collection of errors to the client.
 * A controller should be used for determining an action that
 * the client can make e.g., login, register, or sendMessage.
 * If you have some actions that not return any value and the
 * status of the processed request does not matter on the
 * client-side you should look at Receivers.
 * Also if you want to get data from the server it is recommended to
 * use a Databox instead of a Controller because it is much easier to
 * use for this case and provides the functionality to
 * keep the data up to date in real-time.
 */
export default class Controller<PA extends object = any> extends Component {

    /**
     * **Not override this**
     * Used internally.
     */
    readonly _preparedData: ControllerPreparedData;

    constructor(identifier: string, bag: Bag, preparedData: ControllerPreparedData, apiLevel: number | undefined) {
        super(identifier,apiLevel,bag);
        this._preparedData = preparedData;
    }

    /**
     * @description
     * This property is used for getting the configuration of this controller.
     */
    public static readonly config: ControllerConfig = {};

    /**
     * @description
     * Gets invoked when the controller gets an request and input is correct.
     * This method will only be invoked when the beforeHandle method has not thrown an error.
     * @param socket
     * @param input
     * @param packet
     * @return
     * The Return value of the function is send to the client with an success response.
     * @throws
     * You can throw BackError or BackErrorBag, which are sent to the client with a not success response.
     * Notice that only the BackError or BackErrorBag sends back to the client.
     * All other errors or objects will be converted to an unknown BackError.
     */
    handle(socket: Socket, input: any, packet: Packet<PA>): Promise<any> | any {
    }

    /**
     * @description
     * Gets invoked when the controller gets an request with invalid input.
     * @param socket
     * @param rawInput
     * Notice that you will get the raw input means only
     * the data the user has sent without processed by the models.
     * @param packet
     * @param backErrorBag
     * @throws
     * You can throw BackError or BackErrorBag
     * than the errors will be merged with the previous errors and send back to the client.
     * Notice that only the BackError or BackErrorBag sends back to the client.
     * All other errors or objects will be converted to an
     * unknown BackError and overrides all previous BackErrors.
     */
    invalidInput(socket: Socket, rawInput: any, packet: Packet<PA>, backErrorBag: BackErrorBag): Promise<void> | void {
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
                (target as any)[nameof<ControllerClass>(s => s.config)] = controllerConfig;
            }
            else {
                throw new ConfigBuildError(`The ControllerConfig decorator can only be used on a class that extends the Controller class.`);
            }
        }
    }
}

Controller.prototype[componentTypeSymbol] = 'Controller';

export type ControllerClass = typeof Controller;

export interface ControllerPreparedData {
    controllerConfig: ControllerConfig,
    versionAccessCheck: VersionSystemAccessCheckFunction,
    systemAccessCheck: VersionSystemAccessCheckFunction,
    tokenStateCheck: TokenStateAccessCheckFunction,
    handleMiddlewareInvoke: CompHandleMiddlewareInvoker,
    inputConsume: InputConsumeFunction,
    inputValidationCheck: InputValidationCheckFunction
}