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
import {ProcessTask}      from "./processTaskEngine";
import SmallBag         = require("../../api/SmallBag");
import ConvertEngine    = require("../convert/convertEngine");
import ObjectTools = require("../tools/objectTools");

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
        await inputValueProcessor.processInput({i : input},'i',config,inputPath,errorBag);
    }

    async processInput(srcObj : object,srcKey : string | number, config : object, currentInputPath : string, errorBag : TaskErrorBag) : Promise<any>
    {
        if(typeof config[Const.App.VALUE.ARRAY] === 'object') {
            //Array reference
            await this.processArray(srcObj,srcKey,config,currentInputPath,errorBag);
        }
        else if(typeof config[Const.App.OBJECT.PROPERTIES] === 'object') {
            //Object reference
            await this.processObject(srcObj,srcKey,config,currentInputPath,errorBag);
        }
        else {
            //normal Input
            await this.processValue(srcObj,srcKey,config,currentInputPath,errorBag);
        }
    }

    private async processObject(srcObj : object,srcKey : string | number,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        const props = config[Const.App.OBJECT.PROPERTIES];
        const input = srcObj[srcKey];
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
                    const currentInputPathNew = `${currentInputPath}.${propName}`;

                    if(input.hasOwnProperty(propName))
                    {
                        //allOk lets check the prop
                        promises.push(new Promise(async (resolve) =>
                        {
                            await this.processInput
                            (input,propName,props[propName],currentInputPathNew,errorBag);
                            resolve();
                        }))
                    }
                    else
                    {
                        //is this input optional?
                        //or is it really missing?
                        if(!props[propName][Const.App.VALUE.IS_OPTIONAL])
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

            //methods and construct obj
            if(
                this.createProcessTaskList &&
                (typeof config[Const.App.OBJECT.CONSTRUCT] === 'function'||
                typeof config[Const.App.OBJECT.PROTOTYPE] === 'object'))
            {
                this.processTaskList.push(async  () =>
                {
                    if(typeof config[Const.App.OBJECT.PROTOTYPE] === 'object') {
                        Object.setPrototypeOf(srcObj[srcKey],config[Const.App.OBJECT.PROTOTYPE]);
                    }
                    if(config[Const.App.OBJECT.CONSTRUCT] === 'function') {
                        const res = await config[Const.App.OBJECT.CONSTRUCT](input,this.preparedSmallBag);
                        if(res !== undefined){
                            srcObj[srcKey] = res;
                        }
                    }
                });
            }
        }
        else if(!config[Const.App.OBJECT.IS_OPTIONAL])
        {
            //ups wrong input or missing and not optional we can't processing it
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

    private async processValue(srcObj : object,srcKey : string | number,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        const input = srcObj[srcKey];

        const preparedErrorData = {
            inputValue : input,
            inputPath : currentInputPath
        };

        const type = config[Const.Validator.KEYS.TYPE];

        const strictType = typeof config[Const.Validator.KEYS.STRICT_TYPE] === 'boolean'?
            config[Const.Validator.KEYS.STRICT_TYPE] : true;

        const convertType = typeof config[Const.App.VALUE.CONVERT_TYPE] === 'boolean'?
            config[Const.App.VALUE.CONVERT_TYPE] : true;

        const currentErrorCount = errorBag.getTaskErrorCount();

        //type
        if(this.inputValidation) {
            ValidationEngine.validateValueType(input,type,strictType,preparedErrorData,errorBag);
        }

        if(currentErrorCount === errorBag.getTaskErrorCount()){
            //no type error so convert maybe
            if(convertType) {
                srcObj[srcKey] = ConvertEngine.convert(input,type,strictType);
            }
        }

        if(this.inputValidation){
            await ValidationEngine.validateValue(input,config,preparedErrorData,errorBag,this.preparedSmallBag);
        }

        //check for convertTask
        if(this.createProcessTaskList && typeof config[Const.App.VALUE.CONVERT] === 'function'){
            this.processTaskList.push(async  () => {
                srcObj[srcKey] = await config[Const.App.VALUE.CONVERT](input,this.preparedSmallBag);
            });
        }
    }

    private async processArray(srcObj : object,srcKey : string | number,config : object,currentInputPath : string,errorBag : TaskErrorBag) : Promise<any>
    {
        const input = srcObj[srcKey];

        if(Array.isArray(input)) {
            let isOk = !this.inputValidation;

            //validate Array
            if(this.inputValidation) {
                isOk = ValidationEngine.validateArray(input,config,currentInputPath,errorBag)
            }

            if(isOk)
            {
                let arrayInputConfig = config[Const.App.VALUE.ARRAY];
                let promises : Promise<any>[] = [];
                //input reference so we can return it normal
                for(let i = 0; i < input.length; i++)
                {
                    promises.push(new Promise(async (resolve) => {
                        let currentInputPathNew = `${currentInputPath}.${i}`;
                        await this.processInput(input,i,arrayInputConfig,currentInputPathNew,errorBag);
                        resolve();
                    }));
                }

                await Promise.all(promises);
            }
        }
        else if(!config[Const.App.ARRAY.IS_OPTIONAL]){
            //ups wrong input or missing and not optional we can't processing it
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

    getProcessTaskList() : ProcessTask[] {
        return this.processTaskList;
    }
}

export = InputMainProcessor;