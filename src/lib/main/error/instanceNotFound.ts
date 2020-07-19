/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../systemBackErrors/mainBackErrors";

export default class InstanceNotFound extends CodeError
{
    private readonly _className: string;

    constructor(className: string)
    {
        super(MainBackErrors.instanceNotFound,{className});
        this._className = className;
    }

    get className(): string {
        return this._className;
    }
}