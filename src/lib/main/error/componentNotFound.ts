/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../systemBackErrors/mainBackErrors";

export default class ComponentNotFound extends CodeError
{
    private readonly _className: string;
    private readonly _componentType: string;

    constructor(className: string,componentType: string)
    {
        super(MainBackErrors.componentNotFound,{className,componentType});
        this._className = className;
        this._componentType = componentType;
    }

    get className(): string {
        return this._className;
    }

    get componentType(): string {
        return this._componentType;
    }
}