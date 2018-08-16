/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskErrorBag     = require("../../api/TaskErrorBag");
import Const            = require('../constants/constWrapper');
import ValidationEngine = require('../validator/validatorEngine');
import TaskError        = require('../../api/TaskError');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import SmallBag         = require("../../api/SmallBag");

class InputValueProcessor
{
    private readonly inputValidation : boolean;
    private readonly compile : boolean;
    private readonly preparedSmallBag : SmallBag | undefined;

    constructor(inputValidation : boolean = true,compile : boolean = true,preparedSmallBag ?: SmallBag)
    {
        this.inputValidation = inputValidation;
        this.compile = compile;
        this.preparedSmallBag = preparedSmallBag;
    }

    static async checkIsValid(input : object,config : object,inputPath : string,errorBag : TaskErrorBag,useInputValidation : boolean = true) : Promise<void>
    {
        let inputValueProcessor = new InputValueProcessor(useInputValidation,false,undefined);
        await inputValueProcessor.processValue(input,config,inputPath,errorBag);
    }

    async processValue(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        if(typeof config[Const.App.INPUT.ARRAY] === 'object')
        {
            //Array reference
            input = await this.processArray(input,config,currentInputPath,errorBag);
        }
        else if(typeof config[Const.App.OBJECTS.PROPERTIES] === 'object')
        {
            //Object reference
            input = await this.processObject(input,config,currentInputPath,errorBag);
        }
        else
        {
            //normal Input
            input = await this.processData(input,config,currentInputPath,errorBag);
        }
        return input;
    }

    private async processObject(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        let props = config[Const.App.OBJECTS.PROPERTIES];
        if(typeof input === 'object')
        {
            let tempErrorBag = new TaskErrorBag();

            //check if the input has unknown property
            for(let k in input)
            {
                if(input.hasOwnProperty(k) && !props.hasOwnProperty(k))
                {
                    //ups unknown key
                    errorBag.addTaskError(new TaskError
                        (
                            MainErrors.unknownObjectProperty,
                            {
                                propertyName : k
                            }
                        )
                    );

                }
            }

            //check all expected props
            let promises : Promise<any>[] = [];
            for(let propName in props)
            {
                if(props.hasOwnProperty(propName))
                {
                    let currentInputPathNew = `${currentInputPath}.${propName}`;

                    if(input.hasOwnProperty(propName))
                    {
                        //allOk lets check the prop
                        promises.push(new Promise(async (resolve) =>
                        {
                            input[propName] =
                                await this.processValue
                            (input[propName],props[propName],currentInputPathNew,tempErrorBag);

                            resolve();
                        }))
                    }
                    else
                    {
                        //is this input optional?
                        //or is it really missing?
                        if(!props[propName][Const.App.INPUT.IS_OPTIONAL])
                        {
                            //oh its missing!
                            tempErrorBag.addTaskError(new TaskError
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

            await Promise.all(promises);

            //construct obj
            if(
                !tempErrorBag.haveTaskError() &&
                this.compile &&
                this.preparedSmallBag !== undefined &&
                typeof config[Const.App.OBJECTS.CONSTRUCT] === 'function')
            {
                let construct = config[Const.App.OBJECTS.CONSTRUCT];
                input = await construct(input,this.preparedSmallBag);
            }

            if(tempErrorBag.haveTaskError())
            {
                errorBag.addFromTaskErrorBag(tempErrorBag);
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

    private async processData(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        if(this.inputValidation)
        {
            input = ValidationEngine.validateValue(input,config,currentInputPath,errorBag);
        }
        return input;
    }

    private async processArray(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
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
                let promises : Promise<any>[] = [];
                //input reference so we can return it normal
                for(let i = 0; i < input.length; i++)
                {
                    promises.push(new Promise(async (resolve) =>
                    {
                        let currentInputPathNew = `${currentInputPath}.${i}`;
                        input[i] =
                            await this.processValue
                            (input[i],arrayInputConfig,currentInputPathNew,errorBag);
                        resolve();
                    }));
                }

                await Promise.all(promises);
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