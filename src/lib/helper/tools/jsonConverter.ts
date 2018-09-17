/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError        = require("../../api/TaskError");
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');

class JsonConverter
{
    public static async parse(value : string) : Promise<object>
    {
        try {
            return JSON.parse(value);
        }
        catch (e) {
            throw new TaskError(MainErrors.JSONParseSyntaxError,{input : value});
        }
    }
}

export = JsonConverter;