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

typeLibrary[Const.Validator.TYPE.STRING] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isString(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAString,prepareErrorData));
    }
    return input;
};

typeLibrary[Const.Validator.TYPE.INT] = (input,taskErrorBag,prepareErrorData) =>
{
    if(EasyValidator.isInt(input))
    {
        return parseInt(input);
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAInt,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.FLOAT] = (input,taskErrorBag,prepareErrorData) =>
{
    if(EasyValidator.isFloat(input))
    {
        return parseFloat(input);
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAFloat,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.DATE] = (input,taskErrorBag,prepareErrorData) =>
{
    let date = EasyValidator.isDate(input);

    if(date !== null)
    {
        return date;
    }
    else
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotADate,prepareErrorData));
        return input;
    }
};

typeLibrary[Const.Validator.TYPE.EMAIL] = (input,taskErrorBag,prepareErrorData) =>
{
    if(!EasyValidator.isEmail(input))
    {
        taskErrorBag.addTaskError(new TaskError(ValidatorErrors.inputIsNotAEmail,prepareErrorData));
        return input;
    }
    return input;
};




let functionLibrary = {};


module.exports =
    {
        type : typeLibrary,
        function : functionLibrary
    };

