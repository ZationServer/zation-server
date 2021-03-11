/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import stringify          from "fast-stringify";

export function safeJsonStringify(value: any): string {
    try {return JSON.stringify(value);}
    catch (e) {
        //circular dependency.
        return stringify(value);
    }
}