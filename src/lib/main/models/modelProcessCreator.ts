/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {
    AnyOfModel,
    ArrayModel, ConstructObjectFunction, ConvertArrayFunction, ConvertObjectFunction,
    ConvertValueFunction,
    DefinitionModel,
    ObjectModel,
    ValueModel,
} from './definitionModel';
import BackErrorBag          from "../../api/BackErrorBag";
import ValidatorCreator      from "./validator/validatorCreator";
import TypeConverterCreator  from "./typeConvert/typeConverterCreator";
import BackError             from "../../api/BackError";
import Iterator              from "../utils/iterator";
import {ValidationBackErrors} from "../systemBackErrors/validationBackErrors";
import CloneUtils             from "../utils/cloneUtils";
import {ProcessTask}          from "./processTaskEngine";
import {processAnyOfKey}      from '../models/anyOfModelUtils';
// noinspection ES6PreferShortImport
import {ModelMetaData}        from '../models/metaModel';
import {CompiledModel}        from '../models/modelCompiler';
// noinspection ES6PreferShortImport

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

export default class ModelProcessCreator
{
    /**
     * Creates a closure to process a value model.
     * @param valueModel
     * @param meta
     */
    static createValueModelProcessor(valueModel: ValueModel, meta: ModelMetaData): InputProcessFunction
    {
        let type = valueModel.type;
        if(meta.canBeNull && type !== undefined &&
            ((Array.isArray(type) && type.indexOf('null') === -1) || type !== 'null')) {
            type = Array.isArray(type) ? [...type,'null'] : [type,'null'];
        }

        const strictType = typeof valueModel.strictType === 'boolean' ? valueModel.strictType: true;
        const convertType = typeof valueModel.convertType === 'boolean' ? valueModel.convertType: true;
        const hasConvert = typeof valueModel.convert === 'function';

        const typeValidate = ValidatorCreator.createValueTypeValidator(type,strictType);
        const functionValidate = ValidatorCreator.createValueFunctionValidator(valueModel);

        const convert = TypeConverterCreator.createConverter(strictType);

        return async (srcObj,srcKey,currentPath,{errorBag,processTaskList,createProcessTaskList}) => {
            const preparedErrorData = {
                value: srcObj[srcKey],
                path: currentPath
            };

            const tmpErrorCount = errorBag.count;

            const selectedType = typeValidate(srcObj[srcKey],errorBag,preparedErrorData);

            if(tmpErrorCount === errorBag.count && convertType){
                srcObj[srcKey] = convert(srcObj[srcKey],selectedType);
            }

            await functionValidate(srcObj[srcKey],errorBag,preparedErrorData,selectedType);

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
     * @param meta
     */
    static createArrayModelProcessor(arrayModel: ArrayModel, meta: ModelMetaData): InputProcessFunction
    {
        const arrayInner = (arrayModel[0] as DefinitionModel & CompiledModel);
        const arraySettings = arrayModel[1] || {};
        const hasConvert = typeof arraySettings.convert === 'function';
        const arrayValidate = ValidatorCreator.createArrayValidator(arraySettings);
        const canBeNull = meta.canBeNull === true;

        const expected = canBeNull ? ['array','null'] : 'array';

        return async (srcObj, srcKey, currentPath, processInfo) => {
            const input = srcObj[srcKey];
            const errorBag = processInfo.errorBag;

            if(Array.isArray(input)) {
                if(arrayValidate(input,errorBag,currentPath)) {
                    const promises: Promise<any>[] = [];
                    //input reference so we can return it normal
                    for(let i = 0; i < input.length; i++) {
                        promises.push(arrayInner._process
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
                            srcObj[srcKey] = await (arraySettings.convert as ConvertArrayFunction)(input);
                        });
                    }
                }
            }
            else if(!(canBeNull && input === null)) {
                //ups wrong input we can't processing it
                errorBag.add(new BackError
                    (
                        ValidationBackErrors.invalidType,
                        {
                            path: currentPath,
                            value: input,
                            expected: expected
                        }
                    )
                );
            }
        }
    }

    /**
     * Creates a closure to process a anyOf model.
     * @param anyOfModel
     * @param meta
     */
    static createAnyOfModelProcessor(anyOfModel: AnyOfModel, meta: ModelMetaData): InputProcessFunction
    {
        const anyOf = anyOfModel.anyOf;
        const breakIterator = Iterator.createBreakIterator(anyOf);
        const canBeNull = meta.canBeNull === true;

        const preparedEscapedNames: Record<string,string> = {};
        const isArray = Array.isArray(anyOf);
        Iterator.iterateSync((key,value) => {
            preparedEscapedNames[key] = processAnyOfKey(key,value,isArray).replace(/\./g, '\\.');
        },anyOf);

        return async (srcObj, srcKey, currentPath, processInfo) => {
            if(canBeNull && srcObj[srcKey] === null) return;

            let found = false;
            let tmpBackErrorBag;
            const tmpBackErrorBags: BackErrorBag[] = [];
            await breakIterator(async (key, value: CompiledModel) =>
            {
                key = preparedEscapedNames[key];

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
                processInfo.errorBag.add(new BackError(
                    ValidationBackErrors.noAnyOfMatch,
                    {
                        path: currentPath,
                        value: srcObj[srcKey],
                        canBeNull: canBeNull
                    }
                ))
            }
        }
    }

    /**
     * Creates a closure to process a object model.
     * @param objectModel
     * @param meta
     */
    static createObjectModelProcessor(objectModel: ObjectModel, meta: ModelMetaData): InputProcessFunction
    {
        const props = objectModel.properties;
        const morePropsAllowed = objectModel.morePropsAllowed;
        const propKeys = Object.keys(props);
        const escapedPropKeys = propKeys.map(key => key.replace(/\./g, '\\.'));
        const propKeysLength = propKeys.length;
        const canBeNull = meta.canBeNull === true;

        const processBaseConstruct = typeof objectModel.baseConstruct === 'function';
        const processConstruct = typeof objectModel.construct === 'function';
        const processConvert = typeof objectModel.convert === 'function';
        const processPrototype = typeof objectModel.prototype === 'object';

        const hasProcessTask = (processBaseConstruct || processConstruct || processConvert || processPrototype);

        const expected = canBeNull ? ['object','null'] : 'object';

        return async (srcObj, srcKey, currentPath, processInfo) => {

            const input = srcObj[srcKey];
            const errorBag = processInfo.errorBag;

            if(typeof input === 'object' && input) {
                //check if the input has unknown property
                if(!morePropsAllowed) {
                    for(const k in input) {
                        // noinspection JSUnfilteredForInLoop
                        if(input[k] !== undefined && props[k] === undefined) {
                            //ups unknown key
                            const escapedKey = k.replace(/\./g, '\\.');
                            errorBag.add(new BackError
                                (ValidationBackErrors.unknownObjectProperty, {
                                    path: currentPath === '' ? escapedKey: `${currentPath}.${escapedKey}`,
                                    propertyName: k
                                })
                            );

                        }
                    }
                }

                //check all expected props
                const promises: Promise<any>[] = [];

                for(let i = 0; i < propKeysLength; i++){
                    const propName = propKeys[i];

                    const currentPathNew = currentPath === '' ?
                        escapedPropKeys[i] : `${currentPath}.${escapedPropKeys[i]}`;

                    if(input[propName] !== undefined) {
                        promises.push((props[propName] as CompiledModel)._process
                        (input,propName,currentPathNew,processInfo));
                    }
                    else
                    {
                        //is this input optional?
                        //or is it really missing?
                        const {defaultValue,optional} = (props[propName] as CompiledModel)._optionalInfo;
                        if(!optional){
                            //oh its missing!
                            errorBag.add(new BackError
                                (
                                    ValidationBackErrors.missingObjectProperty,
                                    {
                                        object: input,
                                        propertyName: propName,
                                        path: currentPathNew
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
                if(hasProcessTask && processInfo.createProcessTaskList && errorBag.isEmpty())
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
            else if(!(canBeNull && input === null)) {
                //ups wrong input we can't processing it
                errorBag.add(new BackError(
                    ValidationBackErrors.invalidType,
                    {
                        path: currentPath,
                        value: input,
                        expected: expected
                    })
                );
            }
        };
    }
}