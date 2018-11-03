/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const           = require('../constants/constWrapper');
import Converter       = require("./converter");

/*
Converter Library from Zation
*/

const converterLibrary = {};

converterLibrary[Const.Validator.TYPE.INT] = (input,strictType) =>
{
    if(!strictType){
        return parseInt(input);
    }
    return input;
};

converterLibrary[Const.Validator.TYPE.FLOAT] = (input,strictType) =>
{
    if(!strictType){
        return parseFloat(input);
    }
    return input;
};

converterLibrary[Const.Validator.TYPE.NUMBER] = (input,strictType) =>
{
    if(!strictType){
        return parseFloat(input);
    }
    return input;
};

converterLibrary[Const.Validator.TYPE.DATE] = (input) =>
{
    return new Date(input);
};

converterLibrary[Const.Validator.TYPE.BOOLEAN] = (input,strictType) =>
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

export = converterLibrary;

