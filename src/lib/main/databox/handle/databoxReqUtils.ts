/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DataboxConnectReq} from "../dbDefinitions";

export function isValidDataboxConnectionRequest(databoxReq: DataboxConnectReq): boolean {
    // noinspection SuspiciousTypeOfGuard
    return typeof databoxReq === 'object' && databoxReq && typeof databoxReq.d === "string" &&
        (databoxReq.m === undefined || typeof databoxReq.m === 'string');
}