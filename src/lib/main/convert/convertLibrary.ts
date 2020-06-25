/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ValidationType}  from "../definitions/validationType";
import Converter         from "./converter";
import {PartialRecord}   from '../utils/typeUtils';

/*
Converter Library from Zation
*/

export const converterLibrary: PartialRecord<ValidationType,(input: any, strictType?: boolean) => any> = {

    int: (input, strictType) =>
    {
        if(!strictType){
            return parseInt(input);
        }
        return input;
    },

    float: (input, strictType) =>
    {
        if(!strictType){
            return parseFloat(input);
        }
        return input;
    },

    number: (input, strictType) =>
    {
        if(!strictType){
            return parseFloat(input);
        }
        return input;
    },

    date: (input) =>
    {
        return new Date(input);
    },

    boolean: (input, strictType) =>
    {
        if(!strictType){
            if(typeof input === 'string'){
                return Converter.stringToBool(input);
            }
            else if(typeof input === 'number'){
                return Converter.numberToBool(input);
            }
        }
        return input;
    }
};