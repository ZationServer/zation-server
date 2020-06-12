/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {
    AnyOfModel,
    ArrayModel, ConstructObjectFunction, ConvertArrayFunction, ConvertObjectFunction,
    ConvertValueFunction,
    Model,
    ObjectModel, ParamInput, SingleModelInput, ValueModel,
} from '../config/definitions/parts/inputConfig';
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
import {processAnyOfKey}     from '../models/anyOfModelUtils';

export interface ProcessInfo {
    errorBag: BackErrorBag,
    processTaskList: ProcessTask[],
    createProcessTaskList: boolean
}

export type InputProcessFunction = (srcObj: object, srcKey: string | number, currentPath: string,
                                    {errorBag,processTaskList,createProcessTaskList}: ProcessInfo) => Promise<void>;

export interface Processable {
    _process: InputProcessFunction
}

export default class InputProcessorCreator
{
    /**
     * Creates a closure to process a value model.
     * @param valueModel
     */
    static createValueModelProcessor(valueModel: ValueModel): InputProcessFunction
    {
        const type = valueModel.type;
        const strictType = typeof valueModel.strictType === 'boolean' ? valueModel.strictType: true;
        const convertType = typeof valueModel.convertType === 'boolean' ? valueModel.convertType: true;
        const hasConvert = typeof valueModel.convert === 'function';

        const typeValidate = ValidatorEngine.createValueTypeValidator(type,strictType);
        const valueValidate = ValidatorEngine.createValueValidator(valueModel);

        return async (srcObj,srcKey,currentPath,{errorBag,processTaskList,createProcessTaskList}) => {
            const preparedErrorData = {
                value: srcObj[srcKey],
                path: currentPath
            };

            const currentErrorCount = errorBag.getBackErrorCount();

            const selectedType = typeValidate(srcObj[srcKey],errorBag,preparedErrorData);

            if(currentErrorCount === errorBag.getBackErrorCount() && convertType){
                srcObj[srcKey] = ConvertEngine.convert(srcObj[srcKey],selectedType,strictType);
            }

            await valueValidate(srcObj[srcKey],errorBag,preparedErrorData,selectedType);

            //check for convertTask
            if(
                createProcessTaskList &&
                errorBag.isEmpty() &&
                hasConvert
            ) {
                processTaskList.push(async () => {
                    srcObj[srcKey] = await (valueModel.convert as ConvertValueFunction)(srcObj[srcKey]);
                });
            }
        };
    }

    /**
     * Creates a closure to process a array model.
     * @param arrayModel
     */
    static createArrayModelProcessor(arrayModel: ArrayModel & ModelPreparationMem): InputProcessFunction
    {
        const arrayInputConfig = (arrayModel.array as Model & ModelPreparationMem);
        const hasConvert = typeof arrayModel.convert === 'function';

        return async (srcObj, srcKey, currentPath, processInfo) => {
            const input = srcObj[srcKey];
            const errorBag = processInfo.errorBag;

            if(Array.isArray(input)) {

                if(ValidatorEngine.validateArray(input,arrayModel,currentPath,errorBag)) {
                    const promises: Promise<any>[] = [];
                    //input reference so we can return it normal
                    for(let i = 0; i < input.length; i++) {
                        promises.push(arrayInputConfig._process
                        (input,i,(currentPath === '' ? `${i}`: `${currentPath}.${i}`),processInfo));
                    }
                    await Promise.all(promises);

                    //check for convertTask
                    if(
                        processInfo.createProcessTaskList &&
                        errorBag.isEmpty() &&
                        hasConvert)
                    {
                        processInfo.processTaskList.push(async () => {
                            srcObj[srcKey] = await (arrayModel.convert as ConvertArrayFunction)(input);
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
                            path: currentPath,
                            value: input
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
    static createAnyOfModelProcessor(anyOfModel: AnyOfModel & ModelPreparationMem): InputProcessFunction
    {
        const anyOf = anyOfModel.anyOf;
        const breakIterator = Iterator.createBreakIterator(anyOf);

        const preparedNames: Record<string,string> = {};
        const isArray = Array.isArray(anyOf);
        Iterator.iterateSync((key,value) => {
            preparedNames[key] = processAnyOfKey(key,value,isArray);
        },anyOf);

        return async (srcObj, srcKey, currentPath, processInfo) => {
            let found = false;
            let tmpBackErrorBag;
            const tmpBackErrorBags: BackErrorBag[] = [];
            await breakIterator(async (key, value: ModelPreparationMem) =>
            {
                key = preparedNames[key];

                tmpBackErrorBag = new BackErrorBag();
                tmpBackErrorBags.push(tmpBackErrorBag);

                const tmpProcessInfo: ProcessInfo =
                    {
                        errorBag: tmpBackErrorBag,
                        processTaskList: [],
                        createProcessTaskList: processInfo.createProcessTaskList
                    };
                await value._process
                (srcObj,srcKey,(currentPath === '' ? key: `${currentPath}.${key}`),tmpProcessInfo);

                if(tmpProcessInfo.errorBag.isEmpty()){
                    found = true;
                    processInfo.processTaskList = processInfo.processTaskList.concat(tmpProcessInfo.processTaskList);
                    //to break;
                    return true;
                }
            });

            if(!found) {
                processInfo.errorBag.addFromBackErrorBag(...tmpBackErrorBags);
                processInfo.errorBag.addBackError(new BackError(
                    ValidatorBackErrors.noAnyOfMatch,
                    {
                        path: currentPath,
                        value: srcObj[srcKey]
                    }
                ))
            }
        }
    }

    /**
     * Creates a closure to process a object model.
     * @param objectModel
     */
    static createObjectModelProcessor(objectModel: ObjectModel): InputProcessFunction
    {
        const props = objectModel.properties;
        const morePropsAllowed = objectModel.morePropsAllowed;
        const propKeys = Object.keys(props);
        const propKeysLength = propKeys.length;

        const processBaseConstruct = typeof objectModel.baseConstruct === 'function';
        const processConstruct = typeof objectModel.construct === 'function';
        const processConvert = typeof objectModel.convert === 'function';
        const processPrototype = typeof objectModel.prototype === 'object';

        return async (srcObj, srcKey, currentpath, processInfo) => {

            const input = srcObj[srcKey];
            const errorBag = processInfo.errorBag;

            if(typeof input === 'object' && !Array.isArray(input))
            {
                //check if the input has unknown property
                if(!morePropsAllowed) {
                    for(const k in input) {
                        if(input.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
                            //ups unknown key
                            errorBag.addBackError(new BackError
                                (
                                    MainBackErrors.unknownObjectProperty, {
                                        path: currentpath === '' ? k: `${currentpath}.${k}`,
                                        propertyName: k
                                    }
                                )
                            );

                        }
                    }
                }

                //check all expected props
                const promises: Promise<any>[] = [];

                for(let i = 0; i < propKeysLength; i++){
                    const propName = propKeys[i];

                    const currentpathNew = currentpath === '' ?
                        propName: `${currentpath}.${propName}`;

                    if(input.hasOwnProperty(propName)) {
                        //allOk lets check the props
                        promises.push((props[propName] as ModelPreparationMem)._process
                        (input,propName,currentpathNew,processInfo));
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
                                        object: input,
                                        propertyName: propName,
                                        path: currentpathNew
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
                    (processBaseConstruct || processConstruct || processConvert || processPrototype)
                )
                {
                    processInfo.processTaskList.push(async  () => {
                        //1.prototype
                        if(processPrototype) {
                            Object.setPrototypeOf(input,(objectModel.prototype as object));
                        }

                        //2.baseConstruct
                        if(processBaseConstruct) {
                            await (objectModel.baseConstruct as ConstructObjectFunction).call(input);
                        }

                        //3.construct
                        if(processConstruct) {
                            await (objectModel.construct as ConstructObjectFunction).call(input);
                        }

                        //4.convert
                        if(processConvert) {
                            srcObj[srcKey] = await (objectModel.convert as ConvertObjectFunction)(input);
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
                            path: currentpath,
                            value: input
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
    static createParamInputProcessor(paramInputConfig: ParamInput): InputProcessFunction {

        const paramKeys = Object.keys(paramInputConfig);
        const paramKeysLength = paramKeys.length;

        return async (srcObj, srcKey, currentPath, processInfo) =>
        {
            const promises: Promise<void>[] = [];
            let input = srcObj[srcKey];
            let paramName: string;

            if(!Array.isArray(input)){
                //object input

                if(input === undefined){
                    input = {};
                    srcObj[srcKey] = input;
                }
                else if(typeof input !== "object") {
                    processInfo.errorBag.addBackError(new BackError(MainBackErrors.invalidInputTypeInParamBasedInput,{inputType: typeof input}));
                    return;
                }

                for(let i = 0; i < paramKeysLength; i++) {
                    paramName = paramKeys[i];
                    if(input[paramName] !== undefined){
                        promises.push((paramInputConfig[paramName] as ModelPreparationMem)
                            ._process(input,paramName,(currentPath+paramName),processInfo));
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
                for(const inputName in input) {
                    if(input.hasOwnProperty(inputName) && !paramInputConfig.hasOwnProperty(inputName)){
                        processInfo.errorBag.addBackError(new BackError(MainBackErrors.unknownInputParam,
                            {
                                paramName: inputName
                            }));
                    }
                }
            }
            else {
                //array input
                const result = {};
                for(let i = 0; i < paramKeysLength; i++)
                {
                    paramName = paramKeys[i];
                    if(typeof input[i] !== 'undefined') {
                        promises.push((async () => {
                            result[paramName] = input[i];
                            await (paramInputConfig[paramName] as ModelPreparationMem)
                                ._process(result,paramName,(currentPath+paramName),processInfo);
                        })());
                    }
                    else {
                        const {defaultValue,isOptional} = (paramInputConfig[paramName] as ModelPreparationMem)._optionalInfo;
                        if(!isOptional){
                            //ups something is missing
                            processInfo.errorBag.addBackError(new BackError(MainBackErrors.inputParamIsMissing,
                                {
                                    paramName: paramKeys[i]
                                }));
                        }
                        else {
                            //set default value
                            result[paramName] = CloneUtils.deepClone(defaultValue);
                        }
                    }
                }
                //check to much input
                for(let i = paramKeysLength; i < input.length; i++) {
                    processInfo.errorBag.addBackError(new BackError(MainBackErrors.inputParamNotAssignable,
                        {
                            index: i,
                            value: input[i]
                        }));
                }
                srcObj[srcKey] = result;
            }
            await Promise.all(promises);
        }
    }

    /**
     * Creates a closure for validating and format a single model input.
     * @param singleModelInput
     */
    static createSingleInputProcessor(singleModelInput: SingleModelInput): InputProcessFunction {
        const modelDefinition = singleModelInput[0];

        return async (srcObj, srcKey, currentPath, processInfo) =>
        {
            let promise: Promise<void> | undefined = undefined;

            if(srcObj[srcKey] !== undefined){
                promise = (modelDefinition as ModelPreparationMem)
                    ._process(srcObj,srcKey,currentPath,processInfo);
            }
            else {
                const {defaultValue,isOptional} = (modelDefinition as ModelPreparationMem)._optionalInfo;
                if(!isOptional){
                    //ups missing
                    processInfo.errorBag.addBackError(new BackError(MainBackErrors.inputIsMissing));
                }
                else {
                    //set default value
                    srcObj[srcKey] = CloneUtils.deepClone(defaultValue);
                }
            }
            await promise;
        }
    }

}