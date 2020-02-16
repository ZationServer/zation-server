/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class AuthenticationError extends CodeError
{
    private readonly reason: string;

    constructor(reason: string)
    {
        super(MainBackErrors.authenticationError,{reason});
        this.reason = reason;
    }

    // noinspection JSUnusedGlobalSymbols
    getReason(): string {
        return this.reason;
    }
}