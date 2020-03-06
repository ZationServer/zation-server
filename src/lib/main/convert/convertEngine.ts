/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {converterLibrary} from "./convertLibrary";

export default class ConvertEngine
{
    static convert(input: any,type: string | undefined,strictType: boolean): any
    {
        if(type !== undefined && converterLibrary.hasOwnProperty(type)) {
            return converterLibrary[type](input,strictType);
        }
        return input;
    }
}