/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import * as core           from "express-serve-static-core";
import BaseSHBridge        from "./baseSHBridge";
import {ControllerRequest} from "../controllerDefinitions";

/**
 * Socket, http bridge interface
 * That contains request information.
 */
export default interface SHBridge extends BaseSHBridge
{
    getControllerRequest(): ControllerRequest;
    getReqId(): string;
    /**
     * Is undefined if isWebSocket() is true!
     */
    getResponse(): core.Response;
    /**
     * Is undefined if isWebSocket() is true!
     */
    getRequest(): core.Request;

    isValidationCheckReq(): boolean;

    getApiLevel(): number;

    getConnectionApiLevel(): number | undefined;

    getRequestApiLevel(): number | undefined;
}
