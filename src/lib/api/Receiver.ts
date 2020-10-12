/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ReceiverConfig}   from '../main/config/definitions/parts/receiverConfig';
import BackErrorBag       from "./BackErrorBag";
import Socket             from './Socket';
import Packet             from './Packet';
import Component          from './component/Component';
import {ConsumeInputFunction}             from '../main/input/inputClosureCreator';
import {componentTypeSymbol}              from '../main/component/componentUtils';
import {CompHandleMiddlewareInvoker}      from '../main/compHandleMiddleware/compHandleMiddlewareUtils';
import {NormalAccessCustomFunction}       from '../main/config/definitions/parts/accessConfigs';

/**
 * The Receiver is a component that can be compared with the controller component,
 * with the only difference that the Receiver
 * receives packages but not send a response back to the client.
 * That can give you performance benefits.
 * The Receiver is useful if you not want to return a result and
 * the status of the process does not matter on the client-side.
 */
export default class Receiver<PA extends object = any> extends Component {

    /**
     * **Not override this**
     * Used internally.
     */
    readonly _preparedData: ReceiverPreparedData;

    constructor(identifier: string, preparedData: ReceiverPreparedData, apiLevel: number | undefined) {
        super(identifier,apiLevel);
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
     * @param socket
     * @param input
     * @param packet
     * @throws
     * All errors thrown in this method will only be handled on the server-side
     * and are not send back to the client.
     * Because the receiver does not send a response back.
     */
    handle(socket: Socket, input: any, packet: Packet<PA>): Promise<void> | void {
    }

    /**
     * @description
     * Gets invoked when the receiver receives a transmit with invalid input.
     * @param socket
     * @param rawInput
     * Notice that you will get the raw input means only
     * the data the user has sent without processed by the models.
     * @param packet
     * @param backErrorBag
     * @throws
     * All errors thrown in this method will only be handled on the server-side
     * and are not send back to the client.
     * Because the receiver does not send a response back.
     */
    invalidInput(socket: Socket, rawInput: any, packet: Packet<PA>, backErrorBag: BackErrorBag): Promise<void> | void {
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
        return (target: typeof Receiver) => {
            (target as any)[nameof<ReceiverClass>(s => s.config)] = receiverConfig;
        }
    }
}

Receiver.prototype[componentTypeSymbol] = 'Receiver';

export type ReceiverClass = typeof Receiver;

export interface ReceiverPreparedData {
    receiverConfig: ReceiverConfig,
    checkAccess: NormalAccessCustomFunction,
    handleMiddlewareInvoke: CompHandleMiddlewareInvoker,
    consumeInput: ConsumeInputFunction
}