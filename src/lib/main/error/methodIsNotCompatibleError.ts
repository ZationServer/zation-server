/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class MethodIsNotCompatibleError extends CodeError
{
    private readonly reqType : string;
    private readonly requiredReqType : string;
    private readonly actionDescription : string;

    constructor(reqType : string,requiredReqType : string,actionDescription : string = '')
    {
        super(MainBackErrors.methodIsIncompatible,{reqType,requiredReqType});
        this.reqType = reqType;
        this.requiredReqType = requiredReqType;
        this.actionDescription = actionDescription;
    }

    // noinspection JSUnusedGlobalSymbols
    getReqType(): string {
        return this.reqType;
    }

    // noinspection JSUnusedGlobalSymbols
    getRequiredReqType(): string {
        return this.requiredReqType;
    }

    // noinspection JSUnusedGlobalSymbols
    getActionDescription(): string {
        return this.actionDescription;
    }

    toString(): string {
        return `MethodIsNotCompatibleError: Type is: ${this.reqType} but method requires: ${this.requiredReqType} to: ${this.actionDescription}`;
    }

}