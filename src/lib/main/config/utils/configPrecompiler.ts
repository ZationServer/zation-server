/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {
    BaseCustomChannelConfig
} from "../definitions/channelsConfig";
import {
    AnyOfModelConfig,
    ArrayModelConfig,
    InputConfig,
    Model,
    ParamInput,
    ObjectModelConfig,
    ValueModelConfig,
    SingleModelInput,
} from "../definitions/inputConfig";
import ModelResolveEngine from "./modelResolveEngine";
import ObjectUtils        from "../../utils/objectUtils";
import Iterator           from "../../utils/iterator";
import {OtherLoadedConfigSet, OtherPrecompiledConfigSet} from "../manager/configSets";
import InputProcessorCreator, {Processable} from "../../input/inputProcessorCreator";
import {SystemController}          from "../../systemController/systemControler.config";
import OptionalProcessor           from "../../input/optionalProcessor";
import ZationConfig                from "../manager/zationConfig";
import {isInputConfigTranslatable, isModelConfigTranslatable} from "../../../api/ConfigTranslatable";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../definitions/controllerConfig";
import {ControllerClass}  from "../../../api/Controller";
import {DataboxClassDef, DataboxConfig} from "../definitions/databoxConfig";
import DbConfigUtils from "../../databox/dbConfigUtils";
import {middlewareEvents, PrecompiledEventConfig} from '../definitions/eventConfig';
import FuncUtils from '../../utils/funcUtils';

export interface ModelPreparationMem extends Processable{
    _optionalInfo: {isOptional: boolean,defaultValue: any}
    _pcStep1: boolean,
    _pcStep2: boolean
}

export default class ConfigPrecompiler
{
    private readonly configs: OtherLoadedConfigSet;

    private controllerDefaults: object;
    private databoxDefaults: object;
    private modelsConfig: object;
    private modelImportEngine: ModelResolveEngine;

    constructor(configs: OtherLoadedConfigSet)
    {
        this.configs = configs;
        this.prepare();
    }

    precompile(zc: ZationConfig, showPrecompiledConfigs: boolean): OtherPrecompiledConfigSet
    {
        this.preCompileEvents();
        this.precompileModels(this.modelsConfig);
        this.precompileTmpBuilds();
        this.precompileControllerDefaults();
        this.precompileControllers();
        this.precompileDataboxes();
        this.precompileSystemController();
        this.precompileCustomChannels();

        //view precompiled configs
        if(showPrecompiledConfigs){
            console.log('StarterConfig');
            console.dir(zc.starterConfig,{depth:null});
            console.log('MainConfig');
            console.dir(zc.mainConfig,{depth:null});
            console.log('AppConfig');
            console.dir(this.configs.appConfig,{depth:null});
            console.log('EventConfig');
            console.dir(this.configs.eventConfig,{depth:null});
            console.log('ServiceConfig');
            console.dir(this.configs.serviceConfig,{depth:null});
        }

        // @ts-ignore
        return this.configs;
    }

    private prepare(): void
    {
        this.prepareControllerDefaults();
        this.prepareDataboxDefaults();
        this.prepareModelsConfig();
        this.modelImportEngine = new ModelResolveEngine(this.modelsConfig);
    }

    private prepareControllerDefaults(): void
    {
        this.controllerDefaults = {};
        let cd = this.configs.appConfig.controllerDefaults;
        //setDefaults if not set!
        if(cd !== undefined) {
            this.controllerDefaults = cd;
        }
    }

    private prepareDataboxDefaults(): void
    {
        this.databoxDefaults = {};
        let dbDefaults = this.configs.appConfig.databoxDefaults;
        //setDefaults if not set!
        if(dbDefaults !== undefined) {
            this.databoxDefaults = dbDefaults;
        }
    }

    private precompileCustomChannels(): void {
        const customChannels = this.configs.appConfig.customChannels;
        const customChannelDefaults = this.configs.appConfig.customChannelDefaults;

        if(typeof customChannels === 'object'){
            for(let chName in customChannels){
                if(customChannels.hasOwnProperty(chName)){

                    let channel: BaseCustomChannelConfig;
                    if(Array.isArray(customChannels[chName])){
                        if(typeof customChannels[chName][0] !== 'object'){
                            customChannels[chName][0] = {};
                        }
                        channel = customChannels[chName][0];
                    }
                    else {
                        channel = (customChannels[chName] as BaseCustomChannelConfig)
                    }

                    //defaults
                    if(typeof customChannelDefaults === 'object'){
                        ObjectUtils.addObToOb(channel,customChannelDefaults,false);
                    }
                }
            }
        }
    }

    private prepareModelsConfig(): void {
        this.modelsConfig = typeof this.configs.appConfig.models === 'object' ?
            this.configs.appConfig.models: {};
    }

    private preCompileEvents() {
        const defaultFunc = () => {};
        const res: PrecompiledEventConfig = {
            express: defaultFunc,
            socketServer: defaultFunc,
            workerInit: defaultFunc,
            masterInit: defaultFunc,
            workerStarted: defaultFunc,
            workerLeaderStarted: defaultFunc,
            httpServerStarted: defaultFunc,
            wsServerStarted: defaultFunc,
            started: defaultFunc,
            beforeError: defaultFunc,
            beforeBackError: defaultFunc,
            beforeCodeError: defaultFunc,
            beforeBackErrorBag: defaultFunc,
            workerMessage: defaultFunc,
            socketInit: defaultFunc,
            socketConnection: defaultFunc,
            socketDisconnection: defaultFunc,
            socketAuthentication: defaultFunc,
            socketDeauthentication: defaultFunc,
            socketAuthStateChange: defaultFunc,
            socketSubscription: defaultFunc,
            socketUnsubscription: defaultFunc,
            socketError: defaultFunc,
            socketRaw: defaultFunc,
            socketConnectionAbort: defaultFunc,
            socketBadAuthToken: defaultFunc
        };
        const eventConfig = this.configs.eventConfig;
        for(let k in eventConfig) {
            if (eventConfig.hasOwnProperty(k)) {
                res[k] = middlewareEvents.includes(k) ?
                    FuncUtils.createFuncMiddlewareAsyncInvoker(eventConfig[k]) :
                    FuncUtils.createFuncArrayAsyncInvoker(eventConfig[k])
            }
        }
    }

    private precompileModels(models: Record<string,Model | any>) {

        //first pre compile the array short syntax on main level
        //to get references for fix import issues array
        for(let name in models) {
            if(models.hasOwnProperty(name)) {
                this.precompileArrayShortSyntax(name,models)
            }
        }

        for(let name in models) {
            if(models.hasOwnProperty(name)) {
                this.modelPrecompileStep1(name,models);
            }
        }

        for(let name in models) {
            if(models.hasOwnProperty(name)) {
                this.modelPrecompileStep2(models[name]);
            }
        }

    }

    private precompileTmpBuilds(): void {
        this.precompileModels(this.modelImportEngine.tmpCreatedModels);
    }

    private precompileObjectProperties(obj: ObjectModelConfig): void
    {
        const properties = obj.properties;
        for(let propName in properties) {
            if (properties.hasOwnProperty(propName)) {
                this.modelPrecompileStep1(propName,properties);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private precompileArrayShortSyntax(key: string,obj: object): void
    {
        const nowValue = obj[key];
        if(Array.isArray(nowValue)) {
            let arrayExtras = {};

            if(nowValue.length === 2 && typeof nowValue[1] === 'object') {
                arrayExtras = nowValue[1];
            }
            obj[key] = arrayExtras;
            obj[key][nameof<ArrayModelConfig>(s => s.array)] = nowValue[0];
        }
    }

    /**
     * The first model pre-compile step that will resolve all links and will pre-compile value models.
     * Also, it will convert the array short syntax to an array model.
     * @param key
     * @param obj
     */
    private modelPrecompileStep1(key: string, obj: object): void
    {
        const nowValue = obj[key];

        if(isModelConfigTranslatable(nowValue)){
            obj[key] = nowValue.__toModelConfig();
            this.modelPrecompileStep1(key,obj);
            return;
        }

        if(typeof nowValue === 'string')
        {
            //resolve object import
            obj[key] = this.modelImportEngine.resolve(nowValue);
        }
        else if(Array.isArray(nowValue))
        {
            let inArray = {};
            let needArrayPreCompile = false;

            if(typeof nowValue[0] === 'string') {
                inArray = this.modelImportEngine.resolve(nowValue[0]);
            }
            else if(typeof nowValue[0] === 'object' || Array.isArray(nowValue[0])) {
                inArray = nowValue[0];
                needArrayPreCompile = true;
            }

            let arrayExtras = {};
            if(nowValue.length === 2 && typeof nowValue[1] === 'object') {
                arrayExtras = nowValue[1];
            }

            obj[key] = arrayExtras;
            obj[key][nameof<ArrayModelConfig>(s => s.array)] = inArray;

            if(needArrayPreCompile) {
                this.modelPrecompileStep1(nameof<ArrayModelConfig>(s => s.array),obj[key]);
            }
        }
        else if(typeof nowValue === "object")
        {
            if((nowValue as ModelPreparationMem)._pcStep1){
                return;
            }

            if(nowValue.hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties))) {
                //isObject
                //check all properties of object!
                this.precompileObjectProperties(nowValue);

                //precompileObject

            }
            else if(nowValue.hasOwnProperty(nameof<ArrayModelConfig>(s => s.array))) {
                //we have array look in the array body!
                this.modelPrecompileStep1(nameof<ArrayModelConfig>(s => s.array),nowValue);
            }
            else if(nowValue.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf)))
            {
                //anyOf
                Iterator.iterateSync((key,value,src) => {
                    this.modelPrecompileStep1(key,src);
                },nowValue[nameof<AnyOfModelConfig>(s => s.anyOf)]);
            }
            else {
                //value!
                this.precompileValidationFunctions(nowValue);
            }

            Object.defineProperty(nowValue,nameof<ModelPreparationMem>(s => s._pcStep1),{
                value: true,
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
    }

    /**
     * The second model pre-compile that will resolve the object model and value model inheritance.
     * That process needs to be done after pre-compile step one because
     * all string links have to be resolved before duplicate them.
     * Also, this step will create the underscore process closure for the runtime.
     * @param value
     */
    private modelPrecompileStep2(value: any): void
    {
        if(typeof value === "object")
        {
            if((value as ModelPreparationMem)._pcStep2){
                return;
            }

            //check input
            if(value.hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties)))
            {
                //check props
                const props = value[nameof<ObjectModelConfig>(s => s.properties)];
                if(typeof props === 'object'){
                    for(let propName in props) {
                        if(props.hasOwnProperty(propName)) {
                            this.modelPrecompileStep2(props[propName]);
                        }
                    }
                }

                //isObject
                if(value[nameof<ObjectModelConfig>(s => s.extends)] !== undefined)
                {
                    //extends there
                    //check super extends before this
                    //lastExtend
                    const superObj =
                        this.modelImportEngine.extendsResolve(value[nameof<ObjectModelConfig>(s => s.extends)]);

                    this.modelPrecompileStep2(superObj);

                    //extend Props
                    const superProps = superObj[nameof<ObjectModelConfig>(s => s.properties)];
                    ObjectUtils.addObToOb(value[nameof<ObjectModelConfig>(s => s.properties)],superProps,false);

                    //check for prototype
                    const superPrototype = superObj[nameof<ObjectModelConfig>(s => s.prototype)];
                    if(superPrototype){
                        if(!value[nameof<ObjectModelConfig>(s => s.prototype)]){
                            value[nameof<ObjectModelConfig>(s => s.prototype)] = superPrototype;
                        }
                        else {
                            Object.setPrototypeOf(value[nameof<ObjectModelConfig>(s => s.prototype)],superPrototype);
                        }
                    }

                    //extend construct
                    const superConstruct =
                        typeof superObj[nameof<ObjectModelConfig>(s => s.construct)] === 'function' ?
                        superObj[nameof<ObjectModelConfig>(s => s.construct)] :
                        async () => {};
                    const currentConstruct = value[nameof<ObjectModelConfig>(s => s.construct)];
                    if(typeof currentConstruct === 'function') {
                        value[nameof<ObjectModelConfig>(s => s.construct)] = async function(bag){
                            await superConstruct.call(this,bag);
                            await currentConstruct.call(this,bag);
                        };
                    }else {
                        value[nameof<ObjectModelConfig>(s => s.construct)] = async function(bag){
                            await superConstruct.call(this,bag);
                        };
                    }

                    //extend convert
                    const superConvert =
                        typeof superObj[nameof<ObjectModelConfig>(s => s.convert)] === 'function' ?
                            superObj[nameof<ObjectModelConfig>(s => s.convert)] :
                            async (obj) => {return obj;};
                    const currentConvert = value[nameof<ObjectModelConfig>(s => s.convert)];
                    if(typeof currentConvert === 'function') {
                        value[nameof<ObjectModelConfig>(s => s.convert)] = async (obj, bag) => {
                            return currentConvert((await superConvert(obj,bag)),bag);
                        };
                    }else {
                        value[nameof<ObjectModelConfig>(s => s.convert)] = async (obj, bag) => {
                            return superConvert(obj, bag);
                        };
                    }

                    //remove extension
                    value[nameof<ObjectModelConfig>(s => s.extends)] = undefined;
                }

                if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    Object.defineProperty(value,nameof<ModelPreparationMem>(s => s._process),{
                        value: InputProcessorCreator.createObjectModelProcessor(value),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
            else if(value.hasOwnProperty(nameof<ArrayModelConfig>(s => s.array)))
            {
                //is array
                const inArray = value[nameof<ArrayModelConfig>(s => s.array)];
                this.modelPrecompileStep2(inArray);

                if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    Object.defineProperty(value,nameof<ModelPreparationMem>(s => s._process),{
                        value: InputProcessorCreator.createArrayModelProcessor(value),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
            else if(value.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf)))
            {
                //any of
                Iterator.iterateSync((key,value) => {
                    this.modelPrecompileStep2(value);
                },value[nameof<AnyOfModelConfig>(s => s.anyOf)]);

                if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    Object.defineProperty(value,nameof<ModelPreparationMem>(s => s._process),{
                        value: InputProcessorCreator.createAnyOfModelProcessor(value),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
            else {
                //value
                this.precompileValueExtend(value,value);

                if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    Object.defineProperty(value,nameof<ModelPreparationMem>(s => s._process),{
                        value: InputProcessorCreator.createValueModelProcessor(value),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                }
            }
            if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._optionalInfo))){
                Object.defineProperty(value,nameof<ModelPreparationMem>(s => s._optionalInfo),{
                    value: OptionalProcessor.process(value),
                    enumerable: false,
                    writable: false,
                    configurable: false
                });
            }

            Object.defineProperty(value,nameof<ModelPreparationMem>(s => s._pcStep2),{
                value: true,
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
    }

    /**
     * A function that will recursively resolve the inheritance of value models.
     * @param mainValue
     * @param exValueConfig
     */
    private precompileValueExtend(mainValue: ValueModelConfig,exValueConfig: ValueModelConfig) {
        if(exValueConfig.extends !== undefined){
            const nextExValueConfig = this.modelImportEngine.extendsResolve(exValueConfig.extends);
            ObjectUtils.addObToOb(mainValue,nextExValueConfig);
            return this.precompileValueExtend(mainValue,nextExValueConfig);
        }
    }

    // noinspection JSMethodCanBeStatic
    /**
     * A function that will precompile validation functions of a value model.
     * @param value
     */
    private precompileValidationFunctions(value: ValueModelConfig): void
    {
        //charClass function
        if(typeof value.charClass === "string") {
            // @ts-ignore
            //ignore because its used internal for performance speed
            value.charClass = new RegExp("^["+value.charClass+"]*$");
        }

        //regex
        if(typeof value.regex === "string"){
            value.regex = new RegExp(value.regex);
        }
        else if(typeof value.regex === "object"){
            for(let regexName in value.regex) {
                if(value.regex.hasOwnProperty(regexName) && typeof value.regex[regexName] === 'string'){
                    value.regex[regexName] = new RegExp(value.regex[regexName]);
                }
            }
        }
    }

    private precompileControllerDefaults(): void {
        if(this.configs.appConfig.controllerDefaults) {
            this.precompileInputConfig(this.configs.appConfig.controllerDefaults);
        }
    }

    private precompileControllers(): void
    {
        //set if controller property is not found
        if(!this.configs.appConfig.controllers) {
            this.configs.appConfig.controllers = {};
        }

        //iterate over controller
        const controller = this.configs.appConfig.controllers;
        for(let k in controller) {
            if(controller.hasOwnProperty(k)) {
                Iterator.iterateCompDefinition<ControllerClass>(controller[k],(controllerClass) => {
                    const config: ControllerConfig = controllerClass.config;
                    //set the defaults
                    ObjectUtils.addObToOb(config,this.controllerDefaults,false);
                    this.precompileInputConfig(config);
                });
            }
        }
    }

    private precompileSystemController(): void
    {
        for(let k in SystemController){
            if(SystemController.hasOwnProperty(k)){
                this.precompileInputConfig(SystemController[k].config);
            }
        }
    }

    private precompileDataboxes(): void
    {
        //set if databox property is not found
        if(!this.configs.appConfig.databoxes) {
            this.configs.appConfig.databoxes = {};
        }

        //iterate over Databoxes
        const databoxes = this.configs.appConfig.databoxes;
        for(let k in databoxes) {
            if(databoxes.hasOwnProperty(k)) {
                Iterator.iterateCompDefinition<DataboxClassDef>(databoxes[k],(databoxClass) => {
                    const config: DataboxConfig = databoxClass.config;
                    //set the defaults
                    ObjectUtils.addObToOb(config,this.databoxDefaults,false);
                    this.precompileInputConfig(DbConfigUtils.convertDbInitInput(config));
                    this.precompileInputConfig(DbConfigUtils.convertDbFetchInput(config));
                });
            }
        }
    }

    private precompileInputConfig(inputConfig: InputConfig): void {
        if(inputConfig.input) {
            let input = inputConfig.input;
            if(isInputConfigTranslatable(input)){
                input = input.__toInputConfig();
                inputConfig.input = input;
            }

            if(Array.isArray(input)) {
                //resolve single input shortcut
                // @ts-ignore
                this.precompileSingleInput(input);
            }
            else {
                // @ts-ignore
                this.precompileParamInput(input);
            }
        }
    }

    private precompileParamInput(paramInput: ParamInput | Processable): void {
        for(let inputName in paramInput) {
            if(paramInput.hasOwnProperty(inputName)) {
                //resolve values,object,array links and resolve inheritance
                this.modelPrecompileStep1(inputName,paramInput);
                this.modelPrecompileStep2(paramInput[inputName]);
            }
        }
        if(!paramInput.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
            Object.defineProperty(paramInput,nameof<ModelPreparationMem>(s => s._process),{
                value: InputProcessorCreator.createParamInputProcessor((paramInput as ParamInput)),
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
    }

    private precompileSingleInput(singleModelInput: SingleModelInput): void {
        this.modelPrecompileStep1('0',singleModelInput);
        this.modelPrecompileStep2(singleModelInput[0]);
    }

}