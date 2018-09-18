/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
This Marks error in code
Example try to set custom auth token, but sc is not authenticated
 */

import {ErrorConstruct}   from "../configEditTool/errorConfigStructure";
import TaskError          = require("../../api/TaskError");

class CodeError extends TaskError
{
    constructor(errorConstruct : ErrorConstruct = {}, info ?: object | string) {
        super(errorConstruct,info);
    }
}

export = CodeError;