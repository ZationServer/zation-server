/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ControllerStandardReq} from '../main/controller/controllerDefinitions';
import {ReceiverPackage}       from '../main/receiver/receiverDefinitions';

export default class Packet<A extends object = any> {

    private readonly _data: any;
    private readonly _apiLevel?: number;
    private _attachment: Partial<A> = {};

    static createFromControllerRequest(request: ControllerStandardReq): Packet {
        return new Packet<any>(request.d,request.a);
    }

    static createFromReceiverPackage(pack: ReceiverPackage): Packet {
        return new Packet<any>(pack.d,pack.a);
    }

    constructor(data: any,apiLevel: any) {
        this._data = data;
        this._apiLevel = apiLevel;
    }

    //Part attachment
    // noinspection JSUnusedGlobalSymbols
    get attachment(): Partial<A> {
        return this._attachment;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Clears the attachment.
     */
    clearAttachment(): void {
        this._attachment = {};
    }

    //Part Data
    /**
     * @description
     * Notice that the package is already processed and
     * the data could also be processed with the models.
     */
    get data(): any {
        return this._data;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the API level of this packet,
     * can be undefined if the client did not provide it.
     */
    get apiLevel(): number | undefined {
        return this._apiLevel;
    }
}