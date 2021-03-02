/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackErrorConstruct from "../definitions/backErrorConstruct";
import BackError          from "./../../api/BackError";

const codeErrorSymbol = Symbol();

export default class CodeError extends BackError {

    private static codeErrorEvent: (err: CodeError) => void;
    public static setCodeErrorEvent(event: (err: CodeError) => void) {
        this.codeErrorEvent = event;
    }

    [codeErrorSymbol] = true;
    constructor(errorConstruct: BackErrorConstruct = {}, info?: object | string, message?: string) {
        super(errorConstruct,info,message);
        if(CodeError.codeErrorEvent) CodeError.codeErrorEvent(this);
    }
}

export function isCodeError(value: any): value is CodeError {
    return value && value[codeErrorSymbol];
}