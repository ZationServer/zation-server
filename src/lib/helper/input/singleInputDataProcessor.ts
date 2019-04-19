/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ValidationEngine = require('../validator/validatorEngine');
import MainErrors       = require('../zationTaskErrors/mainTaskErrors');
import ValidatorErrors  = require('../zationTaskErrors/validatorTaskErrors');
import {ProcessTask}      from "./processTaskEngine";
import SmallBag         = require("../../api/SmallBag");
import ConvertEngine    = require("../convert/convertEngine");
import Iterator = require("../tools/iterator");
import {OptionalProcessor} from "./optionalProcessor";
import {AnyOfModelConfig, ArrayModelConfig, Model, ObjectModelConfig, ValueModelConfig} from "../configs/appConfig";
import BackErrorBag        from "../../api/BackErrorBag";
import BackError           from "../../api/BackError";

export interface ProcessInfo {
    errorBag : BackErrorBag,
    processTaskList : ProcessTask[],
    createProcessTaskList : boolean,
    inputValidation : boolean
}

export class SingleInputDataProcessor
{
    private readonly preparedSmallBag : SmallBag;

    constructor(preparedSmallBag : SmallBag) {
        this.preparedSmallBag = preparedSmallBag;
    }

    async processProperty(srcObj : object,srcKey : string | number, config : Model, currentInputPath : string,processInfo : ProcessInfo) : Promise<any>
    {
        if(typeof config[nameof<ArrayModelConfig>(s => s.array)] === 'object') {
            //Array reference
            await this.processArray(srcObj,srcKey,config,currentInputPath,processInfo);
        }
        else if(typeof config[nameof<ObjectModelConfig>(s => s.properties)] === 'object') {
            //Object reference
            await this.processObject(srcObj,srcKey,config,currentInputPath,processInfo);
        }
        else if(typeof config[nameof<AnyOfModelConfig>(s => s.anyOf)] === 'object') {
            //AnyOf
            await this.processAnyOf(srcObj,srcKey,config,currentInputPath,processInfo);
        }
        else {
            //normal Input
            await this.processValue(srcObj,srcKey,config,currentInputPath,processInfo);
        }
    }

    private async processObject(srcObj : object,srcKey : string | number,config : Model,currentInputPath : string,processInfo : ProcessInfo) : Promise<void>
    {
        const errorBag = processInfo.errorBag;
        const props = config[nameof<ObjectModelConfig>(s => s.properties)];
        const input = srcObj[srcKey];
        if(typeof input === 'object')
        {
            //check if the input has unknown property
            if(!config[nameof<ObjectModelConfig>(s => s.moreInputAllowed)])
            {
                for(let k in input)
                {
                    if(input.hasOwnProperty(k) && !props.hasOwnProperty(k))
                    {
                        //ups unknown key
                        processInfo.errorBag.addBackError(new BackError
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
                            errorBag.addBackError(new BackError
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

            const processConstruct = typeof config[nameof<ObjectModelConfig>(s => s.construct)] === 'function';
            const processConvert = typeof config[nameof<ObjectModelConfig>(s => s.convert)] === 'function';
            const processPrototype = typeof config[nameof<ObjectModelConfig>(s => s.prototype)] === 'object';

            //process prototype,construct,convert
            if(processInfo.createProcessTaskList && errorBag.isEmpty() &&
                (processConstruct || processConvert || processPrototype)
            )
            {
                processInfo.processTaskList.push(async  () =>
                {
                    //1.prototype
                    if(processPrototype) {
                        Object.setPrototypeOf(input,config[nameof<ObjectModelConfig>(s => s.prototype)]);
                    }

                    //2.construct
                    if(processConstruct) {
                        await config[nameof<ObjectModelConfig>(s => s.construct)](input,this.preparedSmallBag);
                    }

                    //3.convert
                    if(processConvert) {
                        srcObj[srcKey] = await config[nameof<ObjectModelConfig>(s => s.convert)](input,this.preparedSmallBag);
                    }
                });
            }
        }
        else
        {
            //ups wrong input we can't processing it
            errorBag.addBackError(new BackError
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

    private async processValue(srcObj : object,srcKey : string | number,config : Model,currentInputPath : string,
                               {errorBag,processTaskList,inputValidation,createProcessTaskList} : ProcessInfo) : Promise<void>
    {
        const preparedErrorData = {
            inputValue : srcObj[srcKey],
            inputPath : currentInputPath
        };

        const type = config[nameof<ValueModelConfig>(s => s.type)];

        const strictType = typeof config[nameof<ValueModelConfig>(s => s.strictType)] === 'boolean'?
            config[nameof<ValueModelConfig>(s => s.strictType)] : true;

        const convertType = typeof config[nameof<ValueModelConfig>(s => s.convertType)] === 'boolean'?
            config[nameof<ValueModelConfig>(s => s.convertType)] : true;

        const currentErrorCount = errorBag.getBackErrorCount();

        let selectedType = type;
        //type
        if(inputValidation) {
            selectedType =
                ValidationEngine.validateValueType(srcObj[srcKey],type,strictType,preparedErrorData,errorBag);
        }

        if(currentErrorCount === errorBag.getBackErrorCount()){
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
            typeof config[nameof<ValueModelConfig>(s => s.convert)] === 'function')
        {
            processTaskList.push(async  () => {
                srcObj[srcKey] = await config[nameof<ValueModelConfig>(s => s.convert)](srcObj[srcKey],this.preparedSmallBag);
            });
        }
    }

    private async processAnyOf(srcObj : object | object[],srcKey : string | number,config : Model,currentInputPath : string,processInfo : ProcessInfo) : Promise<void>
    {
        let found = false;
        const tmpTaskErrorBags : Record<string|number,BackErrorBag> = {};
        const anyOf = config[nameof<AnyOfModelConfig>(s => s.anyOf)];
        await Iterator.breakIterate(async (key, value) =>
        {
            tmpTaskErrorBags[key] = new BackErrorBag();
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
                    processInfo.errorBag.addBackError(...tmpTaskErrorBags[key].getBackErrors());
                }
            }
            processInfo.errorBag.addBackError(new BackError
            (
                ValidatorErrors.noAnyOfMatch,
                {
                    inputPath : currentInputPath,
                    inputValue : srcObj[srcKey]
                }
            ))
        }
    }

    private async processArray(srcObj : object,srcKey : string | number,config : Model,currentInputPath : string,processInfo : ProcessInfo) : Promise<void>
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
                let arrayInputConfig = config[nameof<ArrayModelConfig>(s => s.array)];
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
                    typeof config[nameof<ArrayModelConfig>(s => s.convert)] === 'function')
                {
                    processInfo.processTaskList.push(async  () => {
                        srcObj[srcKey] = await config[nameof<ArrayModelConfig>(s => s.convert)](input,this.preparedSmallBag);
                    });
                }
            }
        }
        else {
            //ups wrong input we can't processing it
            errorBag.addBackError(new BackError
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

