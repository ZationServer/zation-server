/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {DataBoxRegisterReq} from "../dbDefinitions";

export default class DataBoxReqUtils
{
    static isValidReqStructure(dataBoxReq : DataBoxRegisterReq) : boolean {
       return typeof dataBoxReq === 'object' && typeof dataBoxReq.d === "string";
    }
}