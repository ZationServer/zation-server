/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskErrorBag     = require("../../api/TaskErrorBag");
import ValidationEngine = require('../validator/validatorEngine');
import TaskError        = require('../../api/TaskError');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import ValidatorErrors  = require('../zationTaskErrors/validatorTaskErrors');
import {ProcessTask}      from "./processTaskEngine";
import SmallBag         = require("../../api/SmallBag");
import ConvertEngine    = require("../convert/convertEngine");
import {
    AnyOfProperty,
    ArrayPropertyConfig,
    ObjectPropertyConfig,
    ValuePropertyConfig
} from "../configs/appConfig";
import Iterator = require("../tools/iterator");
import {OptionalProcessor} from "./optionalProcessor";

export interface ProcessInfo {
    errorBag : TaskErrorBag,
    processTaskList : ProcessTask[],
    createProcessTaskList : boolean,
    inputValidation : boolean
}

export class InputMainProcessor
{
    private readonly preparedSmallBag : SmallBag;

    constructor(preparedSmallBag : SmallBag) {
        this.preparedSmallBag = preparedSmallBag;
    }

    async checkIsValid(input : any,config : object,inputPath : string,errorBag : TaskErrorBag,useInputValidation : boolean = true) : Promise<void>
    {
        await this.processProperty({i : input},'i',config,inputPath,
                {
                    errorBag : errorBag,
                    processTaskList : [],
                    inputValidation : useInputValidation,
                    createProcessTaskList : false
                });
    }

    async processProperty(srcObj : object,srcKey : string | number, config : object, currentInputPath : string,processInfo : ProcessInfo) : Promise<any>
    {
        if(typeof config[nameof<ArrayPropertyConfig>(s => s.array)] === 'object') {
            //Array reference
            await this.processArray(srcObj,srcKey,config,currentInputPath,processInfo);
        }
        else if(typeof config[nameof<ObjectPropertyConfig>(s => s.properties)] === 'object') {
            //Object reference
            await this.processObject(srcObj,srcKey,config,currentInputPath,processInfo);
        }
        else if(typeof config[nameof<AnyOfProperty>(s => s.anyOf)] === 'object') {
            //AnyOf
            await this.processAnyOf(srcObj,srcKey,config,currentInputPath,processInfo);
        }
        else {
            //normal Input
            await this.processValue(srcObj,srcKey,config,currentInputPath,processInfo);
        }
    }

    private async processObject(srcObj : object,srcKey : string | number,config : object,currentInputPath : string,processInfo : ProcessInfo) : Promise<void>
    {
        const errorBag = processInfo.errorBag;
        const props = config[nameof<ObjectPropertyConfig>(s => s.properties)];
        const input = srcObj[srcKey];
        if(typeof input === 'object')
        {
            //check if the input has unknown property
            if(!config[nameof<ObjectPropertyConfig>(s => s.moreInputAllowed)])
            {
                for(let k in input)
                {
                    if(input.hasOwnProperty(k) && !props.hasOwnProperty(k))
                    {
                        //ups unknown key
                        processInfo.errorBag.addTaskError(new TaskError
                            (
                                MainErrors.unknownObjectProperty, {
                                    inputPath : `${currentInputPath}.${k}`,
                                    propertyName : k
                                }
                            )
                        );

                    }
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
                            await this.processProperty
                            (input,propName,props[propName],currentInputPathNew,processInfo);
                            resolve();
                        }))
                    }
                    else
                    {
                        //is this input optional?
                        //or is it really missing?
                        const {defaultValue,isOptional} = await OptionalProcessor.process(props[propName]);
                        if(!isOptional){
                            //oh its missing!
                            errorBag.addTaskError(new TaskError
                                (
                                    MainErrors.objectPropertyIsMissing,
                                    {
                                        object : input,
                                        propertyName : propName,
                                        inputPath : currentInputPathNew
                                    }
                                )
                            );
                        }
                        else {
                            //set default value
                            input[propName] = defaultValue;
                        }
                    }
                }
            }

            await Promise.all(promises);

            const processConstruct = typeof config[nameof<ObjectPropertyConfig>(s => s.construct)] === 'function';
            const processConvert = typeof config[nameof<ObjectPropertyConfig>(s => s.convert)] === 'function';
            const processPrototype = typeof config[nameof<ObjectPropertyConfig>(s => s.prototype)] === 'object';

            //process prototype,construct,convert
            if(processInfo.createProcessTaskList && errorBag.isEmpty() &&
                (processConstruct || processConvert || processPrototype)
            )
            {
                processInfo.processTaskList.push(async  () =>
                {
                    //1.prototype
                    if(processPrototype) {
                        Object.setPrototypeOf(input,config[nameof<ObjectPropertyConfig>(s => s.prototype)]);
                    }

                    //2.construct
                    if(processConstruct) {
                        await config[nameof<ObjectPropertyConfig>(s => s.construct)](input,this.preparedSmallBag);
                    }

                    //3.convert
                    if(processConvert) {
                        srcObj[srcKey] = await config[nameof<ObjectPropertyConfig>(s => s.convert)](input,this.preparedSmallBag);
                    }
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
    }

    private async processValue(srcObj : object,srcKey : string | number,config : object,currentInputPath : string,
                               {errorBag,processTaskList,inputValidation,createProcessTaskList} : ProcessInfo) : Promise<void>
    {
        const preparedErrorData = {
            inputValue : srcObj[srcKey],
            inputPath : currentInputPath
        };

        const type = config[nameof<ValuePropertyConfig>(s => s.type)];

        const strictType = typeof config[nameof<ValuePropertyConfig>(s => s.strictType)] === 'boolean'?
            config[nameof<ValuePropertyConfig>(s => s.strictType)] : true;

        const convertType = typeof config[nameof<ValuePropertyConfig>(s => s.convertType)] === 'boolean'?
            config[nameof<ValuePropertyConfig>(s => s.convertType)] : true;

        const currentErrorCount = errorBag.getTaskErrorCount();

        let selectedType = type;
        //type
        if(inputValidation) {
            selectedType =
                ValidationEngine.validateValueType(srcObj[srcKey],type,strictType,preparedErrorData,errorBag);
        }

        if(currentErrorCount === errorBag.getTaskErrorCount()){
            //no type error so convert maybe
            if(convertType) {
                srcObj[srcKey] = ConvertEngine.convert(srcObj[srcKey],selectedType,strictType);
            }
        }

        if(inputValidation){
            await ValidationEngine.validateValue(srcObj[srcKey],config,preparedErrorData,errorBag,this.preparedSmallBag,type);
        }

        //check for convertTask
        if(
            createProcessTaskList &&
            errorBag.isEmpty() &&
            typeof config[nameof<ValuePropertyConfig>(s => s.convert)] === 'function')
        {
            processTaskList.push(async  () => {
                srcObj[srcKey] = await config[nameof<ValuePropertyConfig>(s => s.convert)](srcObj[srcKey],this.preparedSmallBag);
            });
        }
    }

    private async processAnyOf(srcObj : object | object[],srcKey : string | number,config : object,currentInputPath : string,processInfo : ProcessInfo) : Promise<void>
    {
        let found = false;
        const tmpTaskErrorBags : Record<string|number,TaskErrorBag> = {};
        const anyOf = config[nameof<AnyOfProperty>(s => s.anyOf)];
        await Iterator.breakIterate(async (key, value) =>
        {
            tmpTaskErrorBags[key] = new TaskErrorBag();
            const tmpProcessInfo : ProcessInfo =
                {
                    errorBag : tmpTaskErrorBags[key],
                    processTaskList : [],
                    inputValidation : processInfo.inputValidation,
                    createProcessTaskList : processInfo.createProcessTaskList
                };
            await this.processProperty(srcObj,srcKey,value,`${currentInputPath}.${key}`,tmpProcessInfo);
            if(tmpProcessInfo.errorBag.isEmpty()){
                found = true;
                processInfo.processTaskList = processInfo.processTaskList.concat(tmpProcessInfo.processTaskList);
                //to break;
                return true;
            }
        },anyOf);

        if(!found) {
            for(let key in tmpTaskErrorBags) {
                if(tmpTaskErrorBags.hasOwnProperty(key)) {
                    processInfo.errorBag.addTaskError(...tmpTaskErrorBags[key].getTaskErrors());
                }
            }
            processInfo.errorBag.addTaskError(new TaskError
            (
                ValidatorErrors.noAnyOfMatch,
                {
                    inputPath : currentInputPath,
                    inputValue : srcObj[srcKey]
                }
            ))
        }
    }

    private async processArray(srcObj : object,srcKey : string | number,config : object,currentInputPath : string,processInfo : ProcessInfo) : Promise<void>
    {
        const input = srcObj[srcKey];
        const errorBag = processInfo.errorBag;

        if(Array.isArray(input)) {
            let isOk = !processInfo.inputValidation;

            //validate Array
            if(processInfo.inputValidation) {
                isOk = ValidationEngine.validateArray(input,config,currentInputPath,errorBag)
            }

            if(isOk) {
                let arrayInputConfig = config[nameof<ArrayPropertyConfig>(s => s.array)];
                let promises : Promise<any>[] = [];
                //input reference so we can return it normal
                for(let i = 0; i < input.length; i++)
                {
                    promises.push(new Promise(async (resolve) => {
                        let currentInputPathNew = `${currentInputPath}.${i}`;
                        await this.processProperty(input,i,arrayInputConfig,currentInputPathNew,processInfo);
                        resolve();
                    }));
                }
                await Promise.all(promises);

                //check for convertTask
                if(
                    processInfo.createProcessTaskList &&
                    errorBag.isEmpty() &&
                    typeof config[nameof<ArrayPropertyConfig>(s => s.convert)] === 'function')
                {
                    processInfo.processTaskList.push(async  () => {
                        srcObj[srcKey] = await config[nameof<ArrayPropertyConfig>(s => s.convert)](input,this.preparedSmallBag);
                    });
                }
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
    }
}

