/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import BackError          from "../../api/BackError";

class JsonConverter
{
    public static async parse(value : string) : Promise<object>
    {
        try {
            return JSON.parse(value);
        }
        catch (e) {
            throw new BackError(MainErrors.JSONParseSyntaxError,{input : value});
        }
    }
}

export = JsonConverter;