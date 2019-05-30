/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {
    AnyOfModelConfig,
    ArrayModelConfig, ConstructObjectFunction, ConvertArrayFunction, ConvertObjectFunction,
    ConvertValueFunction,
    Model,
    ModelProcessable, ObjectModelConfig, ValueModelConfig,
} from "../configDefinitions/appConfig";
import BackErrorBag          from "../../api/BackErrorBag";
import SmallBag              from "../../api/SmallBag";
import ValidatorEngine       from "../validator/validatorEngine";
import ConvertEngine         from "../convert/convertEngine";
import BackError             from "../../api/BackError";
import {MainBackErrors}      from "../zationBackErrors/mainBackErrors";
import Iterator              from "../utils/iterator";
import {ValidatorBackErrors} from "../zationBackErrors/validatorBackErrors";
import OptionalProcessor     from "./optionalProcessor";
import CloneUtils            from "../utils/cloneUtils";
import {ProcessTask}         from "./processTaskEngine";

export interface ProcessInfo {
    errorBag : BackErrorBag,
    processTaskList : ProcessTask[],
    createProcessTaskList : boolean
}

export type ModelProcessFunction = (sb : SmallBag, srcObj : object, srcKey : string | number, currentInputPath : string,
                                    {errorBag,processTaskList,createProcessTaskList} : ProcessInfo) => Promise<any>;

export default class ModelInputProcessor
{
    private readonly _preparedSmallBag : SmallBag;

    constructor(preparedSmallBag : SmallBag) {
        this._preparedSmallBag = preparedSmallBag;
    }

    /**
     * Start processing the input with a model recursive.
     * @param srcObj
     * @param srcKey
     * @param config
     * @param currentInputPath
     * @param processInfo
     */
    async processModel(srcObj : object, srcKey : string | number, config : Model, currentInputPath : string, processInfo : ProcessInfo) : Promise<any>
    {
        await (config as ModelProcessable)
            ._process(this._preparedSmallBag,srcObj,srcKey,currentInputPath,processInfo);
    }

    /**
     * Creates a closure to process a value model.
     * @param valueModel
     */
    static createValueModelProcessor(valueModel : ValueModelConfig) : ModelProcessFunction
    {
        const type = valueModel.type;
        const strictType = typeof valueModel.strictType === 'boolean' ? valueModel.strictType : true;
        const convertType = typeof valueModel.convertType === 'boolean' ? valueModel.convertType : true;
        const hasConvert = typeof valueModel.convert === 'function';

        const typeValidate = ValidatorEngine.createValueTypeValidator(type,strictType);
        const valueValidate = ValidatorEngine.createValueValidator(valueModel);

        return async (sb,srcObj,srcKey,currentInputPath,{errorBag,processTaskList,createProcessTaskList}) => {
            const preparedErrorData = {
                inputValue : srcObj[srcKey],
                inputPath : currentInputPath
            };

            const currentErrorCount = errorBag.getBackErrorCount();

            const selectedType = typeValidate(srcObj[srcKey],errorBag,preparedErrorData);

            if(currentErrorCount === errorBag.getBackErrorCount() && convertType){
                srcObj[srcKey] = ConvertEngine.convert(srcObj[srcKey],selectedType,strictType);
            }

            await valueValidate(srcObj[srcKey],errorBag,preparedErrorData,sb,selectedType);

            //check for convertTask
            if(
                createProcessTaskList &&
                errorBag.isEmpty() &&
                hasConvert
            ) {
                processTaskList.push(async () => {
                    srcObj[srcKey] = await (valueModel.convert as ConvertValueFunction)(srcObj[srcKey],sb);
                });
            }
        };
    }

    /**
     * Creates a closure to process a array model.
     * @param arrayModel
     */
    static createArrayModelProcessor(arrayModel : ArrayModelConfig & ModelProcessable) : ModelProcessFunction
    {
        const arrayInputConfig = (arrayModel.array as Model & ModelProcessable);
        const hasConvert = typeof arrayModel.convert === 'function';

        return async (sb, srcObj, srcKey, currentInputPath, processInfo) => {
            const input = srcObj[srcKey];
            const errorBag = processInfo.errorBag;

            if(Array.isArray(input)) {

                if(ValidatorEngine.validateArray(input,arrayModel,currentInputPath,errorBag)) {
                    const promises : Promise<any>[] = [];
                    //input reference so we can return it normal
                    for(let i = 0; i < input.length; i++) {
                        promises.push(arrayInputConfig._process
                        (sb,input,i,`${currentInputPath}.${i}`,processInfo));
                    }
                    await Promise.all(promises);

                    //check for convertTask
                    if(
                        processInfo.createProcessTaskList &&
                        errorBag.isEmpty() &&
                        hasConvert)
                    {
                        processInfo.processTaskList.push(async () => {
                            srcObj[srcKey] = await (arrayModel.convert as ConvertArrayFunction)(input,sb);
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
    static createAnyOfModelProcessor(anyOfModel : AnyOfModelConfig & ModelProcessable) : ModelProcessFunction
    {
        const anyOf = anyOfModel.anyOf;
        const breakIterator = Iterator.createBreakIterator(anyOf);

        return async (sb, srcObj, srcKey, currentInputPath, processInfo) => {
            let found = false;
            const tmpTaskErrorBags : Record<string|number,BackErrorBag> = {};
            await breakIterator(async (key, value : ModelProcessable) =>
            {
                tmpTaskErrorBags[key] = new BackErrorBag();
                const tmpProcessInfo : ProcessInfo =
                    {
                        errorBag : tmpTaskErrorBags[key],
                        processTaskList : [],
                        createProcessTaskList : processInfo.createProcessTaskList
                    };
                await value._process
                (sb,srcObj,srcKey,`${currentInputPath}.${key}`,tmpProcessInfo);

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
                        processInfo.errorBag.addBackError(...tmpTaskErrorBags[key].getBackErrors());
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
    static createObjectModelProcessor(objectModel : ObjectModelConfig) : ModelProcessFunction
    {
        const props = objectModel.properties;
        const morePropsAllowed = objectModel.morePropsAllowed;
        const propKeys = Object.keys(props);

        const processConstruct = typeof objectModel.construct === 'function';
        const processConvert = typeof objectModel.convert === 'function';
        const processPrototype = typeof objectModel.prototype === 'object';

        //prepare optional info
        const optionalInfo : Record<string,{defaultValue : any,isOptional : boolean}> = {};
        for(let k in props){
            if(props.hasOwnProperty(k)){
                optionalInfo[k] = OptionalProcessor.process(props[k]);
            }
        }

        return async (sb, srcObj, srcKey, currentInputPath, processInfo) => {

            const input = srcObj[srcKey];
            const errorBag = processInfo.errorBag;

            if(typeof input === 'object')
            {
                //check if the input has unknown property
                if(!morePropsAllowed) {
                    for(let k in input) {
                        if(input.hasOwnProperty(k) && !props.hasOwnProperty(k)) {
                            //ups unknown key
                            errorBag.addBackError(new BackError
                                (
                                    MainBackErrors.unknownObjectProperty, {
                                        inputPath : `${currentInputPath}.${k}`,
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

                    const currentInputPathNew = `${currentInputPath}.${propName}`;

                    if(input.hasOwnProperty(propName)) {
                        //allOk lets check the props
                        promises.push((props[propName] as ModelProcessable)._process
                        (sb,input,propName,currentInputPathNew,processInfo));
                    }
                    else
                    {
                        //is this input optional?
                        //or is it really missing?
                        const {defaultValue,isOptional} = optionalInfo[propName];
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
                            await (objectModel.construct as ConstructObjectFunction)(input,sb);
                        }

                        //3.convert
                        if(processConvert) {
                            srcObj[srcKey] = await (objectModel.convert as ConvertObjectFunction)(input,sb);
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

}