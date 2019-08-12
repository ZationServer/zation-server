/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class InputIsNotCompatibleError extends CodeError
{
    constructor() {
        super(MainBackErrors.inputIsNotCompatible);
    }
}