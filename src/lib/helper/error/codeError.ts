/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
This Marks error in code
Example try to set custom auth token, but sc is not authenticated
 */

import BackErrorConstruct from "../constants/backErrorConstruct";
import BackError          from "../../api/BackError";

class CodeError extends BackError {
    constructor(errorConstruct : BackErrorConstruct = {}, info ?: object | string) {
        super(errorConstruct,info);
    }
}

export = CodeError;