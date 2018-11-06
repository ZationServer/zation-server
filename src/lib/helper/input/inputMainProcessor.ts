/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskErrorBag     = require("../../api/TaskErrorBag");
import ValidationEngine = require('../validator/validatorEngine');
import TaskError        = require('../../api/TaskError');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import {ProcessTask}      from "./processTaskEngine";
import SmallBag         = require("../../api/SmallBag");
import ConvertEngine    = require("../convert/convertEngine");
import {ArrayPropertyConfig, ObjectPropertyConfig, PropertyOptional, ValuePropertyConfig} from "../configs/appConfig";

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
        if(typeof config[nameof<ArrayPropertyConfig>(s => s.array)] === 'object') {
            //Array reference
            await this.processArray(srcObj,srcKey,config,currentInputPath,errorBag);
        }
        else if(typeof config[nameof<ObjectPropertyConfig>(s => s.properties)] === 'object') {
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
        const props = config[nameof<ObjectPropertyConfig>(s => s.properties)];
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
                        if(!props[propName][nameof<PropertyOptional>(s => s.isOptional)])
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
                (typeof config[nameof<ObjectPropertyConfig>(s => s.construct)] === 'function'||
                typeof config[nameof<ObjectPropertyConfig>(s => s.prototype)] === 'object'))
            {
                this.processTaskList.push(async  () =>
                {
                    if(typeof config[nameof<ObjectPropertyConfig>(s => s.prototype)] === 'object') {
                        Object.setPrototypeOf(srcObj[srcKey],config[nameof<ObjectPropertyConfig>(s => s.prototype)]);
                    }
                    if(config[nameof<ObjectPropertyConfig>(s => s.construct)] === 'function') {
                        const res = await config[nameof<ObjectPropertyConfig>(s => s.construct)](input,this.preparedSmallBag);
                        if(res !== undefined){
                            srcObj[srcKey] = res;
                        }
                    }
                });
            }
        }
        else if(!config[nameof<ObjectPropertyConfig>(s => s.isOptional)])
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

        const type = config[nameof<ValuePropertyConfig>(s => s.type)];

        const strictType = typeof config[nameof<ValuePropertyConfig>(s => s.strictType)] === 'boolean'?
            config[nameof<ValuePropertyConfig>(s => s.strictType)] : true;

        const convertType = typeof config[nameof<ValuePropertyConfig>(s => s.convertType)] === 'boolean'?
            config[nameof<ValuePropertyConfig>(s => s.convertType)] : true;

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
        if(this.createProcessTaskList && typeof config[nameof<ValuePropertyConfig>
        (s => s.convertType)] === 'function'){
            this.processTaskList.push(async  () => {
                srcObj[srcKey] = await
                    config[nameof<ValuePropertyConfig>(s => s.convertType)](input,this.preparedSmallBag);
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
                let arrayInputConfig = config[nameof<ArrayPropertyConfig>(s => s.array)];
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
        else if(!config[nameof<ArrayPropertyConfig>(s => s.isOptional)]){
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