/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constants/constWrapper');
const ValidationEngine = require('../validator/validatorEngine');
const TaskError        = require('../../api/TaskError');
const MainErrors       = require('../zationTaskErrors/mainTaskErrors');

class InputValueProcessor
{
    constructor(inputValidation = true,compile = true)
    {
        this._inputValidation = inputValidation;
        this._compile = compile;
    }

    static checkIsValid(input,config,inputPath,errorBag,useInputValidation = true)
    {
        let inputValueProcessor = new InputValueProcessor(useInputValidation,false);
        inputValueProcessor.processValue(input,config,inputPath,errorBag);
    }

    processValue(input,config,currentInputPath,errorBag)
    {
        if(typeof config[Const.App.INPUT.ARRAY] === 'object')
        {
            //Array reference
            input = this._processArray(input,config,currentInputPath,errorBag);
        }
        else if(typeof config[Const.App.OBJECTS.PROPERTIES] === 'object')
        {
            //Object reference
            input = this._processObject(input,config,currentInputPath,errorBag);
        }
        else
        {
            //normal Input
            input = this._processData(input,config,currentInputPath,errorBag);
        }
        return input;
    }

    _processObject(input,config,currentInputPath,errorBag)
    {
        let props = config[Const.App.OBJECTS.PROPERTIES];
        if(typeof input === 'object')
        {
            let hasError = false;

            //check all expected props
            for(let propName in props)
            {
                if(props.hasOwnProperty(propName))
                {
                    let currentInputPathNew = `${currentInputPath}.${propName}`;

                    if(input.hasOwnProperty(propName))
                    {
                        //allOk lets check the prop
                        input[propName] =
                            this.processValue
                            (input[propName],props[propName],currentInputPathNew,errorBag);
                    }
                    else
                    {
                        //is this input optional?
                        //or is it really missing?
                        if(!props[propName][Const.App.INPUT.IS_OPTIONAL])
                        {
                            //oh its missing!
                            errorBag.addTaskError(new TaskError
                                (
                                    MainErrors.objectPropertyIsMissing,
                                    {
                                        inputPathMissing : currentInputPathNew,
                                        inputValue : input
                                    }
                                )
                            );
                        }
                    }
                }
            }

            //compile obj
            if(!hasError && this._compile && typeof config[Const.App.OBJECTS.COMPILE_AS] === 'function')
            {
                let compileAs = config[Const.App.OBJECTS.COMPILE_AS];
                input = compileAs(input);
            }
        }
        else
        {
            //ups wrong input we can't processing it
            errorBag.addTaskError(new TaskError
                (
                    MainErrors.objectWasExpected,
                    {
                        inputPath : currentInputPath,
                        inputValue : input
                    }
                )
            );
        }
        return input;
    }

    _processData(input,config,currentInputPath,errorBag)
    {
        if(this._inputValidation)
        {
            input = ValidationEngine.validateValue(input,config,currentInputPath,errorBag);
        }
        return input;
    }

    _processArray(input,config,currentInputPath,errorBag)
    {
        if(Array.isArray(input))
        {
            let isOk = !this._inputValidation;

            //validate Array
            if(this._inputValidation)
            {
                isOk = ValidationEngine.validateArray(input,config,currentInputPath,errorBag)
            }

            if(isOk)
            {
                let arrayInputConfig = config[Const.App.INPUT.ARRAY];
                //input reference so we can return it normal
                for(let i = 0; i < input.length; i++)
                {
                    let currentInputPathNew = `${currentInputPath}.${i}`;
                    input[i] =
                        this.processValue
                        (input[i],arrayInputConfig,currentInputPathNew,errorBag);
                }
            }
        }
        else
        {
            //ups wrong input we can't processing it
            errorBag.addTaskError(new TaskError
                (
                    MainErrors.arrayWasExpected,
                    {
                        inputPath : currentInputPath,
                        inputValue : input
                    }
                )
            );
        }
        return input;
    }



}

module.exports = InputValueProcessor;