/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {getModelMetaData, isMetaModel, unwrapIfMetaModel}     from './metaModel';
import ModelProcessCreator, {Processable}                     from './modelProcessCreator';
import {AnyOfModel, DefinitionModel, ObjectModel, ValueModel} from './definitionModel';
import {modelPrototypeSymbol}                                 from '../definitions/model';
import ObjectUtils                                            from '../utils/objectUtils';
import Iterator                                               from '../utils/iterator';
import {resolveIfModelTranslatable}                           from '../../api/configTranslatable/modelTranslatable';
import {DirectModel, Model}                                   from './model';

export interface CompiledModel extends Processable {
    _optionalInfo: {optional: boolean,defaultValue: any};
    /**
     * Pre compiled
     */
    _pc: boolean;
}

export interface OptionalInfo {
    optional: boolean,
    defaultValue: any
}

export class ModelCompiler {

    private constructor() {}

    public static compileModelDeep(model: Model): Model
    {
        model = resolveIfModelTranslatable(model);

        if(model && (model as unknown as CompiledModel)._pc){return model;}
        Object.defineProperty(model,nameof<CompiledModel>(s => s._pc),{
            value: true,
            enumerable: false,
            writable: false,
            configurable: false
        });

        const directModel = unwrapIfMetaModel(model);
        if(typeof directModel !== "object") return model;

        const optionalInfo = ModelCompiler.processOptionalInfo(model as any,directModel);
        Object.defineProperty(model,nameof<CompiledModel>(s => s._optionalInfo),{
            value: optionalInfo,
            enumerable: false,
            writable: false,
            configurable: false
        });

        if(Array.isArray(directModel)){
            directModel[0] = this.compileModelDeep(directModel[0]);

            if(!model.hasOwnProperty(nameof<CompiledModel>(s => s._process))){
                Object.defineProperty(model,nameof<CompiledModel>(s => s._process),{
                    value: ModelProcessCreator.createArrayModelProcessor(directModel,
                        getModelMetaData(model as any)),
                    enumerable: false,
                    writable: false,
                    configurable: false
                });
            }
        }
        else {
            if(directModel.hasOwnProperty(nameof<ObjectModel>(s => s.properties))) {
                const props = directModel[nameof<ObjectModel>(s => s.properties)];
                if(typeof props === 'object'){
                    for(const propName in props) {
                        if(props.hasOwnProperty(propName)) {
                            props[propName] = this.compileModelDeep(props[propName]);
                        }
                    }
                }

                if(directModel[modelPrototypeSymbol] != undefined)
                {
                    //check super extends before
                    const superModel = this.compileModelDeep(directModel[modelPrototypeSymbol]);

                    const superDirectModel = unwrapIfMetaModel(superModel) as ObjectModel;

                    //props
                    const superProps = superDirectModel.properties || {};
                    ObjectUtils.mergeTwoObjects((directModel as ObjectModel).properties,superProps,false);

                    //prototype
                    const superPrototype = superDirectModel.prototype;
                    if(superPrototype){
                        if(!directModel[nameof<ObjectModel>(s => s.prototype)]){
                            directModel[nameof<ObjectModel>(s => s.prototype)] = superPrototype;
                        }
                        else {
                            // flat clone.
                            (directModel as ObjectModel).prototype = {...(directModel as ObjectModel).prototype};
                            Object.setPrototypeOf(directModel[nameof<ObjectModel>(s => s.prototype)],superPrototype);
                        }
                    }

                    //construct
                    const superConstruct = superDirectModel.construct;
                    const currentConstruct = directModel[nameof<ObjectModel>(s => s.construct)];
                    if(typeof superConstruct === 'function') {
                        if(typeof currentConstruct === 'function'){
                            directModel[nameof<ObjectModel>(s => s.construct)] = async function(){
                                await superConstruct.call(this);
                                await currentConstruct.call(this);
                            };
                        }
                        else {
                            directModel[nameof<ObjectModel>(s => s.construct)] = async function(){
                                await superConstruct.call(this);
                            };
                        }
                    }

                    //convert
                    const superConvert = superDirectModel.convert;
                    const currentConvert = directModel[nameof<ObjectModel>(s => s.convert)];
                    if(typeof superConvert === 'function'){
                        if(typeof currentConvert === 'function') {
                            directModel[nameof<ObjectModel>(s => s.convert)] = async (obj) => {
                                return currentConvert((await superConvert(obj)));
                            };
                        }
                        else {
                            directModel[nameof<ObjectModel>(s => s.convert)] = async (obj) => {
                                return superConvert(obj);
                            };
                        }
                    }

                    //remove extension
                    directModel[modelPrototypeSymbol] = undefined;
                }

                if(!model.hasOwnProperty(nameof<CompiledModel>(s => s._process))){
                    Object.defineProperty(model,nameof<CompiledModel>(s => s._process),{
                        value: ModelProcessCreator.createObjectModelProcessor(directModel as ObjectModel,
                            getModelMetaData(model as any)),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
            else if(directModel.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))) {
                Iterator.iterateSync((key,value,src) => {
                    src[key] = this.compileModelDeep(value);
                },directModel[nameof<AnyOfModel>(s => s.anyOf)]);

                if(!model.hasOwnProperty(nameof<CompiledModel>(s => s._process))){
                    Object.defineProperty(model,nameof<CompiledModel>(s => s._process),{
                        value: ModelProcessCreator.createAnyOfModelProcessor(directModel as AnyOfModel,
                            getModelMetaData(model as any)),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
            else {
                this.compileValueModelInheritance(directModel as ValueModel);

                if(!model.hasOwnProperty(nameof<CompiledModel>(s => s._process))){
                    Object.defineProperty(model,nameof<CompiledModel>(s => s._process),{
                        value: ModelProcessCreator.createValueModelProcessor(directModel as ValueModel,
                            getModelMetaData(model as any)),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
        }
        return model;
    }

    /**
     * A function that will recursively resolve the inheritance of value models.
     * @param model
     */
    private static compileValueModelInheritance(model: ValueModel) {
        const proto = unwrapIfMetaModel(resolveIfModelTranslatable(model[modelPrototypeSymbol]));
        if(proto != undefined) {
            //first super
            this.compileValueModelInheritance(proto as ValueModel);
            ObjectUtils.mergeTwoObjects(model,proto);
            model[modelPrototypeSymbol] = undefined;
        }
    }

    private static processOptionalInfo(model: DefinitionModel, directModel: DirectModel): OptionalInfo {
        //fallback
        let optional = false;
        let defaultValue = undefined;

        if(isMetaModel(model)){
            optional = model.optional === true;
            defaultValue = model.default;
        }
        else if(directModel.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))) {
            Iterator.iterateSync((_, value) => {
                if(isMetaModel(value) && value.optional){
                    optional = true;
                    defaultValue = value.default;
                    //break;
                    return true;
                }
            },directModel[nameof<AnyOfModel>(s => s.anyOf)]);
        }
        return {optional, defaultValue};
    }
}