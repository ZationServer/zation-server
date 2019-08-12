/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class InputIsNotCompatibleError extends CodeError
{
    constructor() {
        super(MainBackErrors.inputIsNotCompatible);
    }
}