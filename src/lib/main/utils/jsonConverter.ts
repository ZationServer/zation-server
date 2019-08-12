/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackError          from "../../api/BackError";
import {MainBackErrors}   from "../zationBackErrors/mainBackErrors";

export default class JsonConverter
{
    public static async parse(value : string) : Promise<object>
    {
        try {
            return JSON.parse(value);
        }
        catch (e) {
            throw new BackError(MainBackErrors.JSONParseSyntaxError,{input : value});
        }
    }
}