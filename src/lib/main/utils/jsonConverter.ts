/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackError          from "../../api/BackError";
import {MainBackErrors}   from "../systemBackErrors/mainBackErrors";
import stringify          from "fast-stringify";

export function jsonParse(value: string): object {
    try {return JSON.parse(value);}
    catch (e) {throw new BackError(MainBackErrors.JSONParseSyntaxError,{input: value});}
}

export function jsonStringify(value: any): string {
    try {return JSON.stringify(value);}
    catch (e) {
        //circular dependency.
        return stringify(value);
    }
}