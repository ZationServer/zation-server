/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ZationRequest}     from "../constants/internal";
import * as core           from "express-serve-static-core";
import BaseSHBridge        from "./baseSHBridge";

/**
 * Socket, http bridge interface
 * That contains request information.
 */
export default interface SHBridge extends BaseSHBridge
{
    getZationData() : ZationRequest;
    getReqId() : string;
    /**
     * Is undefined if isWebSocket() is true!
     */
    getResponse() : core.Response;
    /**
     * Is undefined if isWebSocket() is true!
     */
    getRequest() : core.Request;

    isValidationCheckReq() : boolean;

    getApiLevel() : number;

    getConnectionApiLevel() : number | undefined;

    getRequestApiLevel() : number | undefined;
}
