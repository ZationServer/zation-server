/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import RequestBag         from './RequestBag';
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ReceiverConfig}   from '../main/config/definitions/parts/receiverConfig';
import Bag                from "./Bag";
import BackErrorBag       from "./BackErrorBag";
import ConfigBuildError   from '../main/config/manager/configBuildError';
import Component, {ComponentClass}        from './Component';
import {VersionSystemAccessCheckFunction} from '../main/systemVersion/systemVersionChecker';
import {TokenStateAccessCheckFunction}    from '../main/controller/controllerAccessHelper';
import {InputConsumeFunction}             from '../main/input/inputClosureCreator';
import {componentTypeSymbol}              from '../main/component/componentUtils';
import {CompHandleMiddlewareInvoker}      from '../main/compHandleMiddleware/compHandleMiddlewareUtils';

/**
 * The Receiver is a component that can be compared with the controller component,
 * with the only difference that the Receiver
 * receives packages but not send a response back to the client.
 * That can give you performance benefits.
 * The Receiver is useful if you not want to return a result and
 * the status of the process does not matter on the client-side.
 */
export default class Receiver extends Component {

    /**
     * **Not override this**
     * Used internally.
     */
    readonly _preparedData: ReceiverPreparedData;

    constructor(identifier: string, bag: Bag, preparedData: ReceiverPreparedData, apiLevel: number | undefined) {
        super(identifier,apiLevel,bag);
        this._preparedData = preparedData;
    }

    /**
     * @description
     * This property is used for getting the configuration of this receiver.
     */
    public static readonly config: ReceiverConfig = {};

    /**
     * @description
     * Gets invoked when the receiver receives a transmit and input is correct.
     * This method will only be invoked when the beforeHandle method has not thrown an error.
     * @param reqBag
     * @param input
     * @throws
     * All errors thrown in this method will only be handled on the server-side
     * and are not send back to the client.
     * Because the receiver does not send a response back.
     */
    handle(reqBag: RequestBag, input: any): Promise<void> | void {
    }

    /**
     * @description
     * This method will be every time invoked when the handle is finished.
     * Also if the handle method has thrown an error.
     * Error thrown in this method will be logged.
     * You can use this method to clean up resources or close connections.
     * (Use the req variable storage to save the resources on the RequestBag because the RequestBag is unique for every request).
     * @param reqBag
     * @param input
     */
    finallyHandle(reqBag: RequestBag, input: any): Promise<void> | void {
    }

    /**
     * @description
     * Gets invoked when the receiver receives a transmit with invalid input.
     * @param reqBag
     * @param rawInput
     * Notice that you will get the raw input means only
     * the data the user has sent without processed by the models.
     * @param backErrorBag
     * @throws
     * All errors thrown in this method will only be handled on the server-side
     * and are not send back to the client.
     * Because the receiver does not send a response back.
     */
    invalidInput(reqBag: RequestBag, rawInput: any, backErrorBag: BackErrorBag): Promise<void> | void {
    }

    /**
     * Decorator for set the Receiver config.
     * But notice that when you use the decorator
     * that you cannot set the config property by yourself.
     * @param receiverConfig
     * @example
     * @Controller.Config({});
     */
    public static Config(receiverConfig: ReceiverConfig) {
        return (target: ComponentClass) => {
            if(target.prototype instanceof Receiver) {
                (target as any)[nameof<ReceiverClass>(s => s.config)] = receiverConfig;
            }
            else {
                throw new ConfigBuildError(`The ReceiverConfig decorator can only be used on a class that extends the Receiver class.`);
            }
        }
    }
}

Receiver.prototype[componentTypeSymbol] = 'Receiver';

export type ReceiverClass = typeof Receiver;

export interface ReceiverPreparedData {
    receiverConfig: ReceiverConfig,
    versionAccessCheck: VersionSystemAccessCheckFunction,
    systemAccessCheck: VersionSystemAccessCheckFunction,
    tokenStateCheck: TokenStateAccessCheckFunction,
    handleMiddlewareInvoke: CompHandleMiddlewareInvoker,
    inputConsume: InputConsumeFunction,
    finallyHandle: Receiver['finallyHandle'];
}