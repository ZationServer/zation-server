/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DataboxConnectReq} from "../dbDefinitions";

export default class DataboxReqUtils
{
    static isValidReqStructure(databoxReq: DataboxConnectReq): boolean {
       // noinspection SuspiciousTypeOfGuard
        return typeof databoxReq === 'object' && typeof databoxReq.d === "string" &&
           (databoxReq.i === undefined || typeof databoxReq.i === 'string');
    }
}