/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ValidationType} from "../constants/validationType";
import Converter         from "./converter";

/*
Converter Library from Zation
*/

const converterLibrary :  Record<string,(input : any,strictType ?: boolean) => any> = {};

converterLibrary[ValidationType.INT] = (input, strictType) =>
{
    if(!strictType){
        return parseInt(input);
    }
    return input;
};

converterLibrary[ValidationType.FLOAT] = (input, strictType) =>
{
    if(!strictType){
        return parseFloat(input);
    }
    return input;
};

converterLibrary[ValidationType.NUMBER] = (input, strictType) =>
{
    if(!strictType){
        return parseFloat(input);
    }
    return input;
};

converterLibrary[ValidationType.DATE] = (input) =>
{
    return new Date(input);
};

converterLibrary[ValidationType.BOOLEAN] = (input, strictType) =>
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
};

export const ConverterLibrary : Record<string,(input : any,strictType ?: boolean) => any> = converterLibrary;