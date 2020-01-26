/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class InputIsIncompatibleError extends CodeError
{
    constructor() {
        super(MainBackErrors.inputIsIncompatible);
    }
}