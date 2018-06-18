/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Validation Library from Zation
 */

const ValidatorErrors = require('../zationTaskErrors/validatorTaskErrors');
const EasyValidator   = require('./easyValidator');
const MainErrors      = require('../zationTaskErrors/mainTaskErrors');
const Const           = require('../constants/constWrapper');

const Validator       = require('validator');

//TYPE VALIDATION LIBRARY

let typeLibrary = {};

typeLibrary[Const.Validator.TYPE_STRING] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isString(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAString,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE_INT] = (input,taskErrorBag,prepareErrorData) =>
{
    if(EasyValidator.isInt(input))
    {
        return parseInt(input);
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAInt,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE_FLOAT] = (input,taskErrorBag,prepareErrorData) =>
{
    if(EasyValidator.isFloat(input))
    {
        return parseFloat(input);
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.paramIsNotAFloat,prepareErrorData));
        return input;
    }
};



let functionLibrary = {};


module.exports =
    {
        type : typeLibrary,
        function : functionLibrary
    };

