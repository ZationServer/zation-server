/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DataBoxConnectReq} from "../dbDefinitions";

export default class DataBoxReqUtils
{
    static isValidReqStructure(dataBoxReq : DataBoxConnectReq) : boolean {
       return typeof dataBoxReq === 'object' && typeof dataBoxReq.d === "string";
    }
}