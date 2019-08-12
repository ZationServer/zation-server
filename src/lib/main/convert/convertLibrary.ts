/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import {ValidationTypes} from "../constants/validationTypes";
import Converter         from "./converter";

/*
Converter Library from Zation
*/

const converterLibrary :  Record<string,(input : any,strictType ?: boolean) => any> = {};

converterLibrary[ValidationTypes.INT] = (input,strictType) =>
{
    if(!strictType){
        return parseInt(input);
    }
    return input;
};

converterLibrary[ValidationTypes.FLOAT] = (input,strictType) =>
{
    if(!strictType){
        return parseFloat(input);
    }
    return input;
};

converterLibrary[ValidationTypes.NUMBER] = (input,strictType) =>
{
    if(!strictType){
        return parseFloat(input);
    }
    return input;
};

converterLibrary[ValidationTypes.DATE] = (input) =>
{
    return new Date(input);
};

converterLibrary[ValidationTypes.BOOLEAN] = (input,strictType) =>
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