/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ConverterLibrary} from "./convertLibrary";

export default class ConvertEngine
{
    static convert(input : any,type : string | undefined,strictType : boolean) : any
    {
        if(type !== undefined && ConverterLibrary.hasOwnProperty(type)) {
            return ConverterLibrary[type](input,strictType);
        }
        return input;
    }
}