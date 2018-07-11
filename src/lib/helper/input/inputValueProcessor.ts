/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskErrorBag    = require("../../api/TaskErrorBag");
import Const            = require('../constants/constWrapper');
import ValidationEngine = require('../validator/validatorEngine');
import TaskError        = require('../../api/TaskError');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');

class InputValueProcessor
{
    private readonly inputValidation : boolean;
    private readonly compile : boolean;

    constructor(inputValidation = true,compile = true)
    {
        this.inputValidation = inputValidation;
        this.compile = compile;
    }

    static checkIsValid(input : object,config : object,inputPath : string,errorBag : TaskErrorBag,useInputValidation : boolean = true) : void
    {
        let inputValueProcessor = new InputValueProcessor(useInputValidation,false);
        inputValueProcessor.processValue(input,config,inputPath,errorBag);
    }

    processValue(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : any
    {
        if(typeof config[Const.App.INPUT.ARRAY] === 'object')
        {
            //Array reference
            input = this.processArray(input,config,currentInputPath,errorBag);
        }
        else if(typeof config[Const.App.OBJECTS.PROPERTIES] === 'object')
        {
            //Object reference
            input = this.processObject(input,config,currentInputPath,errorBag);
        }
        else
        {
            //normal Input
            input = this.processData(input,config,currentInputPath,errorBag);
        }
        return input;
    }

    private processObject(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : any
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
            if(!hasError && this.compile && typeof config[Const.App.OBJECTS.COMPILE_AS] === 'function')
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

    private processData(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : any
    {
        if(this.inputValidation)
        {
            input = ValidationEngine.validateValue(input,config,currentInputPath,errorBag);
        }
        return input;
    }

    private processArray(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : any
    {
        if(Array.isArray(input))
        {
            let isOk = !this.inputValidation;

            //validate Array
            if(this.inputValidation)
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

export = InputValueProcessor;