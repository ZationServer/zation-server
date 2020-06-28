/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {
    AnyOfModel,
    InputConfig,
    ParamInput,
    ObjectModel,
    ValueModel,
    SingleModelInput, ImplicitModel, Model
} from '../definitions/parts/inputConfig';
import ObjectUtils        from "../../utils/objectUtils";
import Iterator           from "../../utils/iterator";
import {OtherLoadedConfigSet, OtherPrecompiledConfigSet} from "../manager/configSets";
import InputProcessorCreator, {Processable}              from '../../input/inputProcessorCreator';
import ZationConfig                                      from "../manager/zationConfig";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig}                                     from "../definitions/parts/controllerConfig";
import {ControllerClass}                                      from "../../../api/Controller";
// noinspection ES6PreferShortImport
import {DataboxConfig}                                        from "../definitions/parts/databoxConfig";
import DbConfigUtils                                          from "../../databox/dbConfigUtils";
import {PrecompiledEvents, Events}                            from '../definitions/parts/events';
import FuncUtils                                              from '../../utils/funcUtils';
import {PrecompiledMiddleware}                                from '../definitions/parts/middleware';
import {modelPrototypeSymbol}                                 from '../../definitions/model';
import {inputConfigTranslateSymbol, isInputConfigTranslatable}                                 from '../../../api/configTranslatable/inputConfigTranslatable';
import {isModelTranslatable, modelTranslateSymbol, resolveIfModelTranslatable}                 from '../../../api/configTranslatable/modelTranslatable';
import {AnyFunction}                                                                           from '../../utils/typeUtils';
import {setValueReplacer}                                                                      from '../../utils/valueReplacer';
import {AnyDataboxClass}                                                                       from '../../../api/databox/AnyDataboxClass';
import {ChannelConfig}                                                                         from '../../../..';
import {AnyChannelClass}                                                                       from '../../../api/channel/AnyChannelClass';
import {systemControllers}                                                                     from '../../controller/systemControllers/systemControllers.config';
import {systemChannels}                                                                        from '../../channel/systemChannels/systemChannels.config';
// noinspection ES6PreferShortImport
import {ReceiverConfig}                                                                        from '../definitions/parts/receiverConfig';
import {systemReceivers}                                                                       from '../../receiver/systemReceivers/systemReceivers.config';
import {ReceiverClass}                                                                         from '../../../api/Receiver';
import {isOptionalModel, unwrapIfOptionalModel}                                                from '../../models/optionalModel';
import {ExplicitModel, isExplicitModel}                                                        from '../../models/explicitModel';

export interface ModelPreparationMem extends Processable{
    _optionalInfo: {optional: boolean,defaultValue: any};
    /**
     * Pre compiled
     */
    _pc: boolean;
    /**
     * Resolved model translatable
     */
    _rmt: boolean;
}

export default class ConfigPrecompiler
{
    private readonly configs: OtherLoadedConfigSet;

    private readonly controllerDefaults: ControllerConfig;
    private readonly receiverDefaults: ReceiverConfig;
    private readonly databoxDefaults: DataboxConfig;
    private readonly channelDefaults: ChannelConfig;

    constructor(configs: OtherLoadedConfigSet)
    {
        this.configs = configs;
        this.controllerDefaults = this.configs.appConfig.controllerDefaults || {};
        this.receiverDefaults = this.configs.appConfig.receiverDefaults || {};
        this.databoxDefaults = this.configs.appConfig.databoxDefaults || {};
        this.channelDefaults = this.configs.appConfig.channelDefaults || {};
    }

    precompile(zc: ZationConfig, showPrecompiledConfigs: boolean): OtherPrecompiledConfigSet
    {
        this.preCompileEvents();
        this.precompileMiddleware();
        this.precompileControllers();
        this.precompileReceivers();
        this.precompileDataboxes();
        this.precompileChannels();

        //view precompiled configs
        if(showPrecompiledConfigs){
            console.log('StarterConfig');
            console.dir(zc.starterConfig,{depth:null});
            console.log('MainConfig');
            console.dir(zc.mainConfig,{depth:null});
            console.log('AppConfig');
            console.dir(this.configs.appConfig,{depth:null});
            console.log('ServiceConfig');
            console.dir(this.configs.serviceConfig,{depth:null});
        }

        // @ts-ignore
        return this.configs;
    }

    private preCompileEvents() {
        const defaultFunc = () => {};
        const res: PrecompiledEvents = {
            express: defaultFunc,
            socketServer: defaultFunc,
            workerInit: defaultFunc,
            beforeComponentsInit: defaultFunc,
            afterComponentsInit: defaultFunc,
            masterInit: defaultFunc,
            workerStarted: defaultFunc,
            httpServerStarted: defaultFunc,
            wsServerStarted: defaultFunc,
            started: defaultFunc,
            error: defaultFunc,
            backErrors: defaultFunc,
            codeError: defaultFunc,
            workerMessage: defaultFunc,
            socketInit: defaultFunc,
            socketConnection: defaultFunc,
            socketDisconnection: defaultFunc,
            socketAuthentication: defaultFunc,
            socketDeauthentication: defaultFunc,
            socketAuthStateChange: defaultFunc,
            socketError: defaultFunc,
            socketRaw: defaultFunc,
            socketConnectionAbort: defaultFunc,
            socketBadAuthToken: defaultFunc
        };
        const eventsConfig = this.configs.appConfig.events || {};

        //precompile error event first
        const errorEvent = ConfigPrecompiler.precompileEvent(nameof<Events>(s => s.error),
            eventsConfig.error || defaultFunc);
        res[nameof<Events>(s => s.error)] = errorEvent;

        for(const k in eventsConfig) {
            if (eventsConfig.hasOwnProperty(k) && k !== nameof<Events>(s => s.error)) {
                res[k] = ConfigPrecompiler.precompileEvent(k,eventsConfig[k],errorEvent);
            }
        }
        this.configs.appConfig.events = res as PrecompiledEvents;
    }

    static precompileEvent<T extends AnyFunction>(eventName: string,func: T | T[],
                                                  errorEvent?: PrecompiledEvents['error']): (...args: Parameters<T>) => Promise<void>
    {
        return FuncUtils.createSafeCaller(
            FuncUtils.createFuncAsyncInvoker(func),
            `An error was thrown in the event: '${eventName}' :`,
            errorEvent
        );
    }

    private precompileMiddleware() {
        const res: PrecompiledMiddleware = {};
        const middlewareConfig = this.configs.appConfig.middleware || {};
        let value;
        for(const k in middlewareConfig) {
            if(middlewareConfig.hasOwnProperty(k)){
                value = middlewareConfig[k];
                res[k] = typeof value !== 'function' ? FuncUtils.createFuncMiddlewareAsyncInvoker(value) : value;
                setValueReplacer(res[k],v => res[k] = v);
            }
        }
        this.configs.appConfig.middleware = res;
    }

    private modelPrecompile(model: object): void
    {
        if(model && (model as unknown as ModelPreparationMem)._pc){return;}
        Object.defineProperty(model,nameof<ModelPreparationMem>(s => s._pc),{
            value: true,
            enumerable: false,
            writable: false,
            configurable: false
        });

        const directModel = unwrapIfOptionalModel(model);
        if(typeof directModel !== "object") return;

        Object.defineProperty(model,nameof<ModelPreparationMem>(s => s._optionalInfo),{
            value: this.processOptionalInfo(model,directModel),
            enumerable: false,
            writable: false,
            configurable: false
        });

        if(Array.isArray(directModel)){
            this.modelPrecompile(directModel[0]);

            if(!model.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                Object.defineProperty(model,nameof<ModelPreparationMem>(s => s._process),{
                    value: InputProcessorCreator.createArrayModelProcessor(directModel),
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
                            this.modelPrecompile(props[propName]);
                        }
                    }
                }

                if(directModel[modelPrototypeSymbol] !== undefined)
                {
                    //check super extends before
                    const superModel = directModel[modelPrototypeSymbol];
                    this.modelPrecompile(superModel);

                    const superDirectModel = unwrapIfOptionalModel(superModel) as ObjectModel;

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

                if(!model.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    Object.defineProperty(model,nameof<ModelPreparationMem>(s => s._process),{
                        value: InputProcessorCreator.createObjectModelProcessor(directModel as ObjectModel),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
            else if(directModel.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))) {
                Iterator.iterateSync((key,value) => {
                    this.modelPrecompile(value);
                },directModel[nameof<AnyOfModel>(s => s.anyOf)]);

                if(!model.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    Object.defineProperty(model,nameof<ModelPreparationMem>(s => s._process),{
                        value: InputProcessorCreator.createAnyOfModelProcessor(directModel as AnyOfModel),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
            else {
                this.precompileValueModelInheritance(directModel as ValueModel);

                if(!model.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    Object.defineProperty(model,nameof<ModelPreparationMem>(s => s._process),{
                        value: InputProcessorCreator.createValueModelProcessor(directModel as ValueModel),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
        }
    }

    /**
     * A function that will recursively resolve the inheritance of value models.
     * @param model
     */
    private precompileValueModelInheritance(model: ValueModel) {
        const proto = unwrapIfOptionalModel(resolveIfModelTranslatable(model[modelPrototypeSymbol]));
        if(proto !== undefined) {
            //first super
            this.precompileValueModelInheritance(proto as ValueModel);
            ObjectUtils.mergeTwoObjects(model,proto);
            model[modelPrototypeSymbol] = undefined;
        }
    }

    private processOptionalInfo(model: Model, directModel: ImplicitModel | ExplicitModel): {optional: boolean,defaultValue: any} {
        //fallback
        let optional = false;
        let defaultValue = undefined;

        if(isOptionalModel(model)){
            optional = true;
            defaultValue = model.default;
        }
        else if(directModel.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))) {
            Iterator.iterateSync((_, value) => {
                if(isOptionalModel(value)){
                    optional = true;
                    defaultValue = value.default;
                    //break;
                    return true;
                }
            },directModel[nameof<AnyOfModel>(s => s.anyOf)]);
        }
        return {optional, defaultValue};
    }

    /**
     * @param obj
     * @param key
     */
    private resolveTranslatableModels(obj: object,key: string | number | symbol): void
    {
        const model = resolveIfModelTranslatable(obj[key]);
        obj[key] = model;

        if(model && (model as unknown as ModelPreparationMem)._rmt){return;}
        Object.defineProperty(model,nameof<ModelPreparationMem>(s => s._rmt),{
            value: true,
            enumerable: false,
            writable: false,
            configurable: false
        });

        const directModel = unwrapIfOptionalModel(model);
        if(typeof directModel !== 'object') return;
        if(Array.isArray(directModel)) {
           this.resolveTranslatableModels(directModel,0);
        }
        else {
            if(directModel.hasOwnProperty(nameof<ObjectModel>(s => s.properties))) {
                const properties = (directModel as ObjectModel).properties;
                for(const propName in properties) {
                    if (properties.hasOwnProperty(propName)) {
                        this.resolveTranslatableModels(properties,propName);
                    }
                }
            }
            else if(directModel.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))) {
                Iterator.iterateSync((key,value,src) => {
                    this.resolveTranslatableModels(src,key);
                },directModel[nameof<AnyOfModel>(s => s.anyOf)]);
            }
            if(directModel[modelPrototypeSymbol]) {
                this.resolveTranslatableModels(directModel,modelPrototypeSymbol);
            }
        }
    }

    private precompileChannels(): void {
        const channels = Object.assign(systemChannels,(this.configs.appConfig.channels || {}));
        this.configs.appConfig.channels = channels;

        for(const k in channels) {
            if(channels.hasOwnProperty(k)) {
                Iterator.iterateCompDefinition<AnyChannelClass>(channels[k],(channelClass) => {
                    const config: ChannelConfig = channelClass.config || {};
                    //set the defaults
                    ObjectUtils.mergeTwoObjects(config,this.channelDefaults,false);

                    (channelClass as any)[nameof<AnyChannelClass>(s => s.config)] = config;
                });
            }
        }
    }

    private precompileControllers(): void
    {
        const controllers = Object.assign(systemControllers,(this.configs.appConfig.controllers || {}));
        this.configs.appConfig.controllers = controllers;

        for(const k in controllers) {
            if(controllers.hasOwnProperty(k)) {
                Iterator.iterateCompDefinition<ControllerClass>(controllers[k],(controllerClass) => {
                    const config: ControllerConfig = controllerClass.config || {};
                    //set the defaults
                    ObjectUtils.mergeTwoObjects(config,this.controllerDefaults,false);
                    this.precompileInputConfig(config);

                    (controllerClass as any)[nameof<ControllerClass>(s => s.config)] = config;
                });
            }
        }
    }

    private precompileReceivers(): void
    {
        const receivers = Object.assign(systemReceivers,(this.configs.appConfig.receivers || {}));
        this.configs.appConfig.receivers = receivers;

        for(const k in receivers) {
            if(receivers.hasOwnProperty(k)) {
                Iterator.iterateCompDefinition<ReceiverClass>(receivers[k],(receiverClass) => {
                    const config: ReceiverConfig = receiverClass.config || {};
                    //set the defaults
                    ObjectUtils.mergeTwoObjects(config,this.receiverDefaults,false);
                    this.precompileInputConfig(config);

                    (receiverClass as any)[nameof<ReceiverClass>(s => s.config)] = config;
                });
            }
        }
    }

    private precompileDataboxes(): void
    {
        const databoxes = this.configs.appConfig.databoxes || {};
        this.configs.appConfig.databoxes = databoxes;

        for(const k in databoxes) {
            if(databoxes.hasOwnProperty(k)) {
                Iterator.iterateCompDefinition<AnyDataboxClass>(databoxes[k],(databoxClass) => {
                    const config: DataboxConfig = databoxClass.config || {}
                    //set the defaults
                    ObjectUtils.mergeTwoObjects(config,this.databoxDefaults,false);
                    this.precompileInputConfig(DbConfigUtils.convertDbInitInput(config));
                    this.precompileInputConfig(DbConfigUtils.convertDbFetchInput(config));

                    (databoxClass as any)[nameof<AnyDataboxClass>(s => s.config)] = config;
                });
            }
        }
    }

    private precompileInputConfig(inputConfig: InputConfig): void {
        if(inputConfig.input) {
            let input: object = inputConfig.input;
            if(isInputConfigTranslatable(input)){
                input = input[inputConfigTranslateSymbol]();
            }
            else if(isModelTranslatable(input)){
                input = input[modelTranslateSymbol]();
            }
            if(isOptionalModel(input) || isExplicitModel(input)){
                input = [input];
            }
            inputConfig.input = input as any;

            if(Array.isArray(input)) {
                this.precompileSingleInput(input as unknown as SingleModelInput);
            }
            else {
                this.precompileParamInput(input as ParamInput);
            }
        }
    }

    private precompileParamInput(paramInput: ParamInput): void {
        for(const inputName in paramInput) {
            if(paramInput.hasOwnProperty(inputName)) {
                this.resolveTranslatableModels(paramInput,inputName);
                this.modelPrecompile(paramInput[inputName]);
            }
        }
        if(!paramInput.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
            Object.defineProperty(paramInput,nameof<ModelPreparationMem>(s => s._process),{
                value: InputProcessorCreator.createParamInputProcessor(paramInput),
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
    }

    private precompileSingleInput(singleModelInput: SingleModelInput): void {
        this.resolveTranslatableModels(singleModelInput,'0');
        this.modelPrecompile(singleModelInput[0]);
        if(!singleModelInput.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
            Object.defineProperty(singleModelInput,nameof<ModelPreparationMem>(s => s._process),{
                value: InputProcessorCreator.createSingleInputProcessor(singleModelInput),
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
    }

}