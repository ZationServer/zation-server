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
        const selectedType = Array.isArray(type) ? type[0] : type;
        if(selectedType !== undefined && ConverterLibrary.hasOwnProperty(selectedType)) {
            return ConverterLibrary[selectedType](input,strictType);
        }
        return input;
    }
}

export = ConvertEngine;