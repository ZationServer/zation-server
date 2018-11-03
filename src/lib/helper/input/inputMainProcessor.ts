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
import {ProcessTask}     from "./processTaskEngine";
import SmallBag         = require("../../api/SmallBag");
import ConvertEngine = require("../convert/convertEngine");

class InputMainProcessor
{
    private readonly inputValidation : boolean;
    private readonly createProcessTaskList : boolean;
    private readonly processTaskList :  ProcessTask[];
    private readonly preparedSmallBag : SmallBag;

    constructor(inputValidation : boolean = true,preparedSmallBag : SmallBag,createProcessTaskList : boolean = true)
    {
        this.inputValidation = inputValidation;
        this.createProcessTaskList = createProcessTaskList;
        this.processTaskList = [];
        this.preparedSmallBag = preparedSmallBag;
    }

    static async checkIsValid(input : any,config : object,inputPath : string,errorBag : TaskErrorBag,smallBag : SmallBag,useInputValidation : boolean = true) : Promise<void>
    {
        let inputValueProcessor = new InputMainProcessor(useInputValidation,smallBag,false);
        await inputValueProcessor.processInput(input,config,inputPath,errorBag);
    }

    async processInput(srcObj : object,srcKey : string, config : object, currentInputPath : string, errorBag : TaskErrorBag) : Promise<any>
    {

        if(typeof config[Const.App.INPUT.ARRAY] === 'object') {
            //Array reference
            input = await this.processArray(input,config,currentInputPath,errorBag);
        }
        else if(typeof config[Const.App.OBJECTS.PROPERTIES] === 'object') {
            //Object reference
            input = await this.processObject(input,config,currentInputPath,errorBag);
        }
        else {
            //normal Input
            input = await this.processValue(input,config,currentInputPath,errorBag);
        }
    }

    private async processObject(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        let props = config[Const.App.OBJECTS.PROPERTIES];
        if(typeof input === 'object')
        {
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
                                await this.processInput
                            (input[propName],props[propName],currentInputPathNew,errorBag);

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

            await Promise.all(promises);

            //construct obj
            if(
                this.createProcessTaskList &&
                typeof config[Const.App.OBJECTS.CONSTRUCT] === 'function')
            {
                this.processTaskList.push(async  () =>
                {
                    const res = await config[Const.App.OBJECTS.CONSTRUCT]();

                });
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

    private async processValue(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        const preparedErrorData = {
            inputValue : input,
            inputPath : currentInputPath
        };

        const type = config[Const.Validator.KEYS.TYPE];

        const strictType = typeof config[Const.Validator.KEYS.STRICT_TYPE] === 'boolean'?
            config[Const.Validator.KEYS.STRICT_TYPE] : true;

        const convertType = typeof config[Const.App.INPUT.CONVERT_TYPE] === 'boolean'?
            config[Const.App.INPUT.CONVERT_TYPE] : true;

        const currentErrorCount = errorBag.getTaskErrorCount();

        //type
        if(this.inputValidation) {
            ValidationEngine.validateValueType(input,type,strictType,preparedErrorData,errorBag);
        }

        if(currentErrorCount === errorBag.getTaskErrorCount()){
            //no type error so convert maybe
            if(convertType) {
                input = ConvertEngine.convert(input,type,strictType);
            }
        }

        if(this.inputValidation){
            await ValidationEngine.validateValue(input,config,preparedErrorData,errorBag,this.preparedSmallBag);
        }

        //check for convertTask
        if(this.createProcessTaskList && typeof config[Const.App.INPUT.CONVERT] === 'function'){

        }

        return input;
    }

    private async processArray(input : any,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        if(Array.isArray(input)) {
            let isOk = !this.inputValidation;

            //validate Array
            if(this.inputValidation) {
                isOk = ValidationEngine.validateArray(input,config,currentInputPath,errorBag)
            }

            if(isOk)
            {
                let arrayInputConfig = config[Const.App.INPUT.ARRAY];
                let promises : Promise<any>[] = [];
                //input reference so we can return it normal
                for(let i = 0; i < input.length; i++)
                {
                    promises.push(new Promise(async (resolve) => {
                        let currentInputPathNew = `${currentInputPath}.${i}`;
                        input[i] =
                            await this.processInput
                            (input[i],arrayInputConfig,currentInputPathNew,errorBag);
                        resolve();
                    }));
                }

                await Promise.all(promises);
            }
        }
        else {
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

    getProcessTaskList() : ProcessTask[] {
        return this.processTaskList;
    }
}

export = InputMainProcessor;