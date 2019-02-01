/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import MainTaskErrors  = require('./../zationTaskErrors/mainTaskErrors');
import CodeError       = require("./codeError");

class MethodIsNotCompatibleError extends CodeError
{
    private readonly reqType : string;
    private readonly requiredReqType : string;

    constructor(reqType : string,requiredReqType : string)
    {
        super(MainTaskErrors.methodIsNotCompatible,{reqType,requiredReqType});
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

export = MethodIsNotCompatibleError;