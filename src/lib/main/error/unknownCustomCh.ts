/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class UnknownCustomCh extends CodeError
{
    private readonly chName : string;

    constructor(chName : string)
    {
        super(MainBackErrors.unknownCustomCh,{name : chName});
        this.chName = chName;
    }

    // noinspection JSUnusedGlobalSymbols
    getChName(): string {
        return this.chName;
    }
}