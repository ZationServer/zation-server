/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import MainTaskErrors  = require('./../zationTaskErrors/mainTaskErrors');
import CodeError       = require("./codeError");

class InputIsNotCompatibleError extends CodeError
{
    constructor() {
        super(MainTaskErrors.inputIsNotCompatible);
    }
}

export = InputIsNotCompatibleError;