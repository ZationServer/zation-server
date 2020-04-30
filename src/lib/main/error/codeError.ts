/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

/*
This Marks error in code
Example try to set custom auth token, but sc is not authenticated.
 */

import BackErrorConstruct from "../constants/backErrorConstruct";
import BackError          from "./../../api/BackError";

const codeErrorSymbol = Symbol();

export default class CodeError extends BackError {
    constructor(errorConstruct: BackErrorConstruct = {}, info?: object | string) {
        super(errorConstruct,info);
    }
    [codeErrorSymbol] = true;
}

export function isCodeError(value: any): value is CodeError {
    return value && value[codeErrorSymbol];
}