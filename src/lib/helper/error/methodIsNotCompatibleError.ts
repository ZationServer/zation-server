/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class MethodIsNotCompatibleError extends CodeError
{
    private readonly reqType : string;
    private readonly requiredReqType : string;

    constructor(reqType : string,requiredReqType : string)
    {
        super(MainBackErrors.methodIsNotCompatible,{reqType,requiredReqType});
        this.reqType = reqType;
        this.requiredReqType = requiredReqType;
    }

    // noinspection JSUnusedGlobalSymbols
    getReqType(): string {
        return this.reqType;
    }

    // noinspection JSUnusedGlobalSymbols
    getRequiredReqType(): string {
        return this.requiredReqType;
    }
}