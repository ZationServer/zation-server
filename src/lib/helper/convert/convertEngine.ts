/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ConverterLibrary  = require('./convertLibrary');

class ConvertEngine
{
    static convert(input : any,type : string,strictType : boolean) : any
    {
        if(type !== undefined && ConverterLibrary.hasOwnProperty(type)) {
            return ConverterLibrary[type](input,strictType);
        }
        return input;
    }
}

export = ConvertEngine;