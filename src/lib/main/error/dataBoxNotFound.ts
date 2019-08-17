/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class DataBoxNotFound extends CodeError
{
    private readonly className : string;

    constructor(className : string)
    {
        super(MainBackErrors.dataBoxNotFound,{className : className});
        this.className = className;
    }

    // noinspection JSUnusedGlobalSymbols
    getClassName(): string {
        return this.className;
    }
}