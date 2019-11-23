/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {
    AnyOfModelConfig,
    ArrayModelConfig, ConstructObjectFunction, ConvertArrayFunction, ConvertObjectFunction,
    ConvertValueFunction,
    Model,
    ObjectModelConfig, ParamInput, ValueModelConfig,
} from "../config/definitions/inputConfig";
import BackErrorBag          from "../../api/BackErrorBag";
import ValidatorEngine       from "../validator/validatorEngine";
import ConvertEngine         from "../convert/convertEngine";
import BackError             from "../../api/BackError";
import {MainBackErrors}      from "../zationBackErrors/mainBackErrors";
import Iterator              from "../utils/iterator";
import {ValidatorBackErrors} from "../zationBackErrors/validatorBackErrors";
import CloneUtils            from "../utils/cloneUtils";
import {ProcessTask}         from "./processTaskEngine";
import {ModelPreparationMem} from "../config/utils/configPrecompiler";
import Bag                   from "../../api/Bag";

export interface ProcessInfo {
    errorBag : BackErrorBag,
    processTaskList : ProcessTask[],
    createProcessTaskList : boolean
}

export type InputProcessFunction = (bag : Bag, srcObj : object, srcKey : string | number, currentInputPath : string,
                                    {errorBag,processTaskList,createProcessTaskList} : ProcessInfo) => Promise<void>;

export interface Processable {
    _process : InputProcessFunction
}

export default class InputProcessorCreator
{
    /**
     * Creates a closure to process a value model.
     * @param valueModel
     */
    static createValueModelProcessor(valueModel : ValueModelConfig) : InputProcessFunction
    {
        const type = valueModel.type;
        const strictType = typeof valueModel.strictType === 'boolean' ? valueModel.strictType : true;
        const convertType = typeof valueModel.convertType === 'boolean' ? valueModel.convertType : true;
        const hasConvert = typeof valueModel.convert === 'function';

        const typeValidate = ValidatorEngine.createValueTypeValidator(type,strictType);
        const valueValidate = ValidatorEngine.createValueValidator(valueModel);

        return async (bag,srcObj,srcKey,currentInputPath,{errorBag,processTaskList,createProcessTaskList}) => {
            const preparedErrorData = {
                inputValue : srcObj[srcKey],
                inputPath : currentInputPath
            };

            const currentErrorCount = errorBag.getBackErrorCount();

            const selectedType = typeValidate(srcObj[srcKey],errorBag,preparedErrorData);

            if(currentErrorCount === errorBag.getBackErrorCount() && convertType){
                srcObj[srcKey] = ConvertEngine.convert(srcObj[srcKey],selectedType,strictType);
            }

            await valueValidate(srcObj[srcKey],errorBag,preparedErrorData,bag,selectedType);

            //check for convertTask
            if(
                createProcessTaskList &&
                errorBag.isEmpty() &&
                hasConvert
            ) {
                processTaskList.push(async () => {
                    srcObj[srcKey] = await (valueModel.convert as ConvertValueFunction)(srcObj[srcKey],bag);
                });
            }
        };
    }

    /**
     * Creates a closure to process a array model.
     * @param arrayModel
     */
    static createArrayModelProcessor(arrayModel : ArrayModelConfig & ModelPreparationMem) : InputProcessFunction
    {
        const arrayInputConfig = (arrayModel.array as Model & ModelPreparationMem);
        const hasConvert = typeof arrayModel.convert === 'function';

        return async (bag, srcObj, srcKey, currentInputPath, processInfo) => {
            const input = srcObj[srcKey];
            const errorBag = processInfo.errorBag;

            if(Array.isArray(input)) {

                if(ValidatorEngine.validateArray(input,arrayModel,currentInputPath,errorBag)) {
                    const promises : Promise<any>[] = [];
                    //input reference so we can return it normal
                    for(let i = 0; i < input.length; i++) {
                        promises.push(arrayInputConfig._process
                        (bag,input,i,(currentInputPath === '' ? `${i}` : `${currentInputPath}.${i}`),processInfo));
                    }
                    await Promise.all(promises);

                    //check for convertTask
                    if(
                        processInfo.createProcessTaskList &&
                        errorBag.isEmpty() &&
                        hasConvert)
                    {
                        processInfo.processTaskList.push(async () => {
                            srcObj[srcKey] = await (arrayModel.convert as ConvertArrayFunction)(input,bag);
                        });
                    }
                }
            }
            else {
                //ups wrong input we can't processing it
                errorBag.addBackError(new BackError
                    (
                        MainBackErrors.arrayWasExpected,
                        {
                            inputPath : currentInputPath,
                            inputValue : input
                        }
                    )
                );
            }
        }
    }

    /**
     * Creates a closure to process a anyOf model.
     * @param anyOfModel
     */
    static createAnyOfModelProcessor(anyOfModel : AnyOfModelConfig & ModelPreparationMem) : InputProcessFunction
    {
        const anyOf = anyOfModel.anyOf;
        const breakIterator = Iterator.createBreakIterator(anyOf);

        return async (bag, srcObj, srcKey, currentInputPath, processInfo) => {
            let found = false;
            const tmpTaskErrorBags : Record<string|number,BackErrorBag> = {};
            await breakIterator(async (key, value : ModelPreparationMem) =>
            {
                tmpTaskErrorBags[key] = new BackErrorBag();
                const tmpProcessInfo : ProcessInfo =
                    {
                        errorBag : tmpTaskErrorBags[key],
                        processTaskList : [],
                        createProcessTaskList : processInfo.createProcessTaskList
                    };
                await value._process
                (bag,srcObj,srcKey,(currentInputPath === '' ? key : `${currentInputPath}.${key}`),tmpProcessInfo);

                if(tmpProcessInfo.errorBag.isEmpty()){
                    found = true;
                    processInfo.processTaskList = processInfo.processTaskList.concat(tmpProcessInfo.processTaskList);
                    //to break;
                    return true;
                }
            });

            if(!found) {
                for(let key in tmpTaskErrorBags) {
                    if(tmpTaskErrorBags.hasOwnProperty(key)) {
                        processInfo.errorBag.addFromBackErrorBag(tmpTaskErrorBags[key]);
                    }
                }
                processInfo.errorBag.addBackError(new BackError
                (
                    ValidatorBackErrors.noAnyOfMatch,
                    {
                        inputPath : currentInputPath,
                        inputValue : srcObj[srcKey]
                    }
                ))
            }
        }
    }

    /**
     * Creates a closure to process a object model.
     * @param objectModel
     */
    static createObjectModelProcessor(objectModel : ObjectModelConfig) : InputProcessFunction
    {
        const props = objectModel.properties;
        const morePropsAllowed = objectModel.morePropsAllowed;
        const propKeys = Object.keys(props);

        const processConstruct = typeof objectModel.construct === 'function';
        const processConvert = typeof objectModel.convert === 'function';
        const processPrototype = typeof objectModel.prototype === 'object';

        return async (bag, srcObj, srcKey, currentInputPath, processInfo) => {

            const input = srcObj[srcKey];
            const errorBag = processInfo.errorBag;

            if(typeof input === 'object' && !Array.isArray(input))
            {
                //check if the input has unknown property
                if(!morePropsAllowed) {
                    for(let k in input) {
                        if(input.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
                            //ups unknown key
                            errorBag.addBackError(new BackError
                                (
                                    MainBackErrors.unknownObjectProperty, {
                                        inputPath : currentInputPath === '' ? k : `${currentInputPath}.${k}`,
                                        propertyName : k
                                    }
                                )
                            );

                        }
                    }
                }

                //check all expected props
                const promises : Promise<any>[] = [];

                for(let i = 0; i < propKeys.length; i++){
                    const propName = propKeys[i];

                    const currentInputPathNew = currentInputPath === '' ?
                        propName : `${currentInputPath}.${propName}`;

                    if(input.hasOwnProperty(propName)) {
                        //allOk lets check the props
                        promises.push((props[propName] as ModelPreparationMem)._process
                        (bag,input,propName,currentInputPathNew,processInfo));
                    }
                    else
                    {
                        //is this input optional?
                        //or is it really missing?
                        const {defaultValue,isOptional} = (props[propName] as ModelPreparationMem)._optionalInfo;
                        if(!isOptional){
                            //oh its missing!
                            errorBag.addBackError(new BackError
                                (
                                    MainBackErrors.objectPropertyIsMissing,
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
                            input[propName] = CloneUtils.deepClone(defaultValue);
                        }
                    }
                }
                await Promise.all(promises);

                //process prototype,construct,convert
                if(processInfo.createProcessTaskList && errorBag.isEmpty() &&
                    (processConstruct || processConvert || processPrototype)
                )
                {
                    processInfo.processTaskList.push(async  () => {
                        //1.prototype
                        if(processPrototype) {
                            Object.setPrototypeOf(input,(objectModel.prototype as object));
                        }

                        //2.construct
                        if(processConstruct) {
                            await (objectModel.construct as ConstructObjectFunction).call(input,bag);
                        }

                        //3.convert
                        if(processConvert) {
                            srcObj[srcKey] = await (objectModel.convert as ConvertObjectFunction)(input,bag);
                        }
                    });
                }
            }
            else
            {
                //ups wrong input we can't processing it
                errorBag.addBackError(new BackError
                    (
                        MainBackErrors.objectWasExpected,
                        {
                            inputPath : currentInputPath,
                            inputValue : input
                        }
                    )
                );
            }
        };
    }

    /**
     * Creates a closure for validating and format a param based input.
     * @param paramInputConfig
     */
    static createParamInputProcessor(paramInputConfig : ParamInput) : InputProcessFunction {

        const paramKeys = Object.keys(paramInputConfig);

        return async (bag, srcObj, srcKey, currentInputPath, processInfo) =>
        {
            const promises : Promise<void>[] = [];
            let input = srcObj[srcKey];
            let paramName : string;

            if(!Array.isArray(input)){
                //object input

                if(input === undefined){
                    input = {};
                }
                else if(typeof input !== "object") {
                    processInfo.errorBag.addBackError(new BackError(MainBackErrors.wrongInputTypeInParamBasedInput,{inputType : typeof input}));
                    return;
                }

                for(let i = 0; i < paramKeys.length; i++) {
                    paramName = paramKeys[i];
                    if(input[paramName] !== undefined){
                        promises.push((paramInputConfig[paramName] as ModelPreparationMem)
                            ._process(bag,input,paramName,(currentInputPath+paramName),processInfo));
                    }
                    else {
                        const {defaultValue,isOptional} = (paramInputConfig[paramName] as ModelPreparationMem)._optionalInfo;
                        if(!isOptional){
                            //ups something is missing
                            processInfo.errorBag.addBackError(new BackError(MainBackErrors.inputParamIsMissing,
                                {
                                    paramName
                                }));
                        }
                        else {
                            //set default value
                            input[paramName] = CloneUtils.deepClone(defaultValue);
                        }
                    }
                }
                //check for unknown input properties
                for(let inputName in input) {
                    if(input.hasOwnProperty(inputName) && !paramInputConfig.hasOwnProperty(inputName)){
                        processInfo.errorBag.addBackError(new BackError(MainBackErrors.unknownInputParam,
                            {
                                paramName : inputName
                            }));
                    }
                }
            }
            else {
                //array input
                const result = {};
                for(let i = 0; i < paramKeys.length; i++)
                {
                    paramName = paramKeys[i];
                    if(typeof input[i] !== 'undefined') {
                        promises.push((async () => {
                            result[paramName] = input[i];
                            await (paramInputConfig[paramName] as ModelPreparationMem)
                                ._process(bag,result,paramName,(currentInputPath+paramName),processInfo);
                        })());
                    }
                    else {
                        const {defaultValue,isOptional} = (paramInputConfig[paramName] as ModelPreparationMem)._optionalInfo;
                        if(!isOptional){
                            //ups something is missing
                            processInfo.errorBag.addBackError(new BackError(MainBackErrors.inputParamIsMissing,
                                {
                                    paramName : paramKeys[i]
                                }));
                        }
                        else {
                            //set default value
                            result[paramName] = CloneUtils.deepClone(defaultValue);
                        }
                    }
                }
                //check to much input
                for(let i = paramKeys.length; i < input.length; i++) {
                    processInfo.errorBag.addBackError(new BackError(MainBackErrors.inputParamNotAssignable,
                        {
                            index : i,
                            value : input[i]
                        }));
                }
                srcObj[srcKey] = result;
            }
            await Promise.all(promises);
        }
    }

}