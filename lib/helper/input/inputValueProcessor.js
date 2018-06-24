/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../constants/constWrapper');
const ValidationEngine = require('../validator/validatorEngine');
const InputWrapper     = require('../tools/inputWrapper');
const ObjectTools      = require('../tools/objectTools');
const TaskError        = require('../../api/TaskError');
const TaskErrorBag     = require('../../api/TaskErrorBag');
const MainErrors       = require('../zationTaskErrors/mainTaskErrors');

class InputValueProcessor
{

    static _checkIsValid(input,inputPath,controllerInput,errorBag)
    {
        



    }


    static _processValue(input,config,currentInputPath,errorBag)
    {
        if(config[Const.App.INPUT.IS_ARRAY])
        {
            //Array
            return InputValueProcessor._processArray(input,config,currentInputPath,errorBag);
        }
        else if(config[Const.App.OBJECTS.PROPERTIES])
        {
            //Object
            return InputValueProcessor._processObject();
        }
        else
        {
            //normal Input
            return InputValueProcessor._processValue();
        }
    }

    static _processObject(input,config,currentInputPath,errorBag)
    {
        let props = config[Const.App.OBJECTS.PROPERTIES];
        if(typeof input === 'object')
        {
            //check all expected props
            for(let propName in props)
            {
                if(props.hasOwnProperty(propName))
                {
                    let currentInputPathNew = `${currentInputPath}.${propName}`;

                    if(input.hasOwnProperty(propName))
                    {
                        //allOk lets check the prop
                        


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
    }

    static _processData(input,config,currentInputPath,errorBag)
    {


    }

    static _processArray(input,config,currentInputPath,errorBag)
    {
        if(Array.isArray(input))
        {
            //input reference so we can return it normal
            for(let i = 0; i < input.length; i++)
            {
                let currentInputPathNew = `${currentInputPath}.${i}`;
                if(config[Const.App.OBJECTS.PROPERTIES])
                {
                    //array object item
                    input[i] = InputValueProcessor._processObject(input[i],config,currentInputPathNew,errorBag);
                }
                else
                {
                    //array normal item
                    input[i] = InputValueProcessor._processValue(input[i],config,currentInputPathNew,errorBag);
                }
            }
            return input;
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
    }



}

module.exports = InputValueProcessor;