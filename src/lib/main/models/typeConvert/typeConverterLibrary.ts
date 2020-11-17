/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ValidationType}  from "../validator/validationType";
import {ConverterUtils}  from "./typeConverterUtils";
import {PartialRecord}   from '../../utils/typeUtils';

export namespace TypeConverterLibrary {
    export const strict: PartialRecord<ValidationType,(input: any) => any> = {
        date: (input) => new Date(input)
    };

    export const nonStrict: PartialRecord<ValidationType,(input: any) => any> = {
        int: (input) => parseInt(input),
        float: (input) => parseFloat(input),
        number: (input) => parseFloat(input),
        date: (input) => new Date(input),
        boolean: (input) => {
            if(typeof input === 'string') return ConverterUtils.stringToBool(input);
            else if(typeof input === 'number') return ConverterUtils.numberToBool(input)
            else return input;
        }
    };
}