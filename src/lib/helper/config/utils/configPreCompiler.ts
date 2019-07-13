/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {
    ChannelSettings,
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
import ObjectUtils       from "../../utils/objectUtils";
import Iterator          from "../../utils/iterator";
import FuncUtils         from "../../utils/funcUtils";
import {OtherLoadedConfigSet, OtherPreCompiledConfigSet} from "../manager/configSets";
import {
    PreCompiledEventConfig,
} from "../definitions/eventConfig";
import InputProcessorCreator, {Processable} from "../../input/inputProcessorCreator";
import {SystemController}          from "../../systemController/systemControler.config";
import OptionalProcessor           from "../../input/optionalProcessor";
import ZationConfig                from "../manager/zationConfig";
import {isInputConfigTranslatable, isModelConfigTranslatable} from "../../../api/ConfigTranslatable";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../definitions/controllerConfig";
import {ControllerClass} from "../../../api/Controller";
import {DataBoxClassDef, DataBoxConfig} from "../definitions/dataBoxConfig";

export interface ModelPreparationMem extends Processable{
    _optionalInfo : {isOptional : boolean,defaultValue : any}
    _pcStep1 : boolean,
    _pcStep2 : boolean
}

export default class ConfigPreCompiler
{
    private readonly configs : OtherLoadedConfigSet;

    private controllerDefaults : object;
    private dataBoxDefaults : object;
    private modelsConfig : object;
    private modelImportEngine : ModelResolveEngine;

    constructor(configs : OtherLoadedConfigSet)
    {
        this.configs = configs;
        this.prepare();
    }

    preCompile(zc : ZationConfig,showPrecompiledConfigs : boolean) : OtherPreCompiledConfigSet
    {
        this.preCompileModels(this.modelsConfig);
        this.preCompileTmpBuilds();
        this.preCompileControllerDefaults();
        this.preCompileControllers();
        this.preCompileDataBoxes();
        this.preCompileSystemController();
        this.preCompileServiceModules();
        this.preCompileEventConfig();
        this.preCompileCustomChannels();

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

    private prepare() : void
    {
        this.prepareControllerDefaults();
        this.prepareDataBoxDefaults();
        this.prepareModelsConfig();
        this.prepareBagExtensions();
        this.modelImportEngine = new ModelResolveEngine(this.modelsConfig);
    }

    private prepareBagExtensions() {
        if(!Array.isArray(this.configs.appConfig.bagExtensions)) {
            this.configs.appConfig.bagExtensions = [];
        }
    }

    private prepareControllerDefaults() : void
    {
        this.controllerDefaults = {};
        let cd = this.configs.appConfig.controllerDefaults;
        //setDefaults if not set!
        if(cd !== undefined) {
            this.controllerDefaults = cd;
        }
    }

    private prepareDataBoxDefaults() : void
    {
        this.dataBoxDefaults = {};
        let dbDefaults = this.configs.appConfig.dataBoxDefaults;
        //setDefaults if not set!
        if(dbDefaults !== undefined) {
            this.dataBoxDefaults = dbDefaults;
        }
    }

    private preCompileCustomChannels() : void {
        const customChannels = this.configs.appConfig.customChannels;
        const customChannelDefaults = this.configs.appConfig.customChannelDefaults;

        if(typeof customChannels === 'object'){
            for(let chName in customChannels){
                if(customChannels.hasOwnProperty(chName)){

                    let channel : BaseCustomChannelConfig;
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
                        if(channel.subscribeAccess === undefined && channel.subscribeNotAccess === undefined) {
                            if(customChannelDefaults.subscribeAccess !== undefined) {
                                channel.subscribeAccess = customChannelDefaults.subscribeAccess;
                            }
                            if(customChannelDefaults.subscribeNotAccess !== undefined) {
                                channel.subscribeNotAccess = customChannelDefaults.subscribeNotAccess
                            }
                        }

                        if(channel.clientPublishAccess !== undefined && channel.clientPublishNotAccess !== undefined) {
                            if(customChannelDefaults.clientPublishAccess !== undefined) {
                                channel.clientPublishAccess = customChannelDefaults.clientPublishAccess;
                            }
                            if(customChannelDefaults.clientPublishNotAccess !== undefined) {
                                channel.clientPublishNotAccess = customChannelDefaults.clientPublishNotAccess
                            }
                        }

                        this.processDefaultValue(channel,customChannelDefaults,nameof<BaseCustomChannelConfig>(s => s.onClientPublish));
                        this.processDefaultValue(channel,customChannelDefaults,nameof<BaseCustomChannelConfig>(s => s.onSubscription));
                        this.processDefaultValue(channel,customChannelDefaults,nameof<BaseCustomChannelConfig>(s => s.onUnsubscription));
                        this.processDefaultValue(channel,customChannelDefaults,nameof<ChannelSettings>(s => s.socketGetOwnPublish));
                    }
                }
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private processDefaultValue(obj : object,defaultObj : object,key : string) : void
    {
        if((!obj.hasOwnProperty(key))&&
            defaultObj.hasOwnProperty(key))
        {
            obj[key] = defaultObj[key];
        }
    }

    private preCompileEventConfig() {

        const defaultFunc = () => {};
        const resEventConfig : PreCompiledEventConfig = {
            express  : defaultFunc,
            socketServer  : defaultFunc,
            workerInit : defaultFunc,
            masterInit : defaultFunc,
            workerStarted  : defaultFunc,
            workerLeaderStarted : defaultFunc,
            httpServerStarted  : defaultFunc,
            wsServerStarted  : defaultFunc,
            started  : defaultFunc,
            beforeError  : defaultFunc,
            beforeBackError  : defaultFunc,
            beforeCodeError  : defaultFunc,
            beforeBackErrorBag  : defaultFunc,
            workerMessage  : defaultFunc,
            socketInit : defaultFunc,
            socketConnection  : defaultFunc,
            socketDisconnection  : defaultFunc,
            socketAuthentication  : defaultFunc,
            socketDeauthentication  : defaultFunc,
            socketAuthStateChange : defaultFunc,
            socketSubscription : defaultFunc,
            socketUnsubscription : defaultFunc,
            socketError : defaultFunc,
            socketRaw : defaultFunc,
            socketConnectionAbort : defaultFunc,
            socketBadAuthToken : defaultFunc
        };

        //preCompile events
        const eventConfig = this.configs.eventConfig;
        for(let k in eventConfig) {
            if (eventConfig.hasOwnProperty(k)) {
                if(Array.isArray(eventConfig[k])) {
                    resEventConfig[k] = FuncUtils.createFuncArrayAsyncInvoker(eventConfig[k]);
                }
                else if(typeof eventConfig[k] === 'function'){
                    resEventConfig[k] = eventConfig[k];
                }
            }
        }
        this.configs.eventConfig = resEventConfig;
    }

    private preCompileServiceModules()
    {
        const sm = this.configs.serviceConfig.serviceModules ? this.configs.serviceConfig.serviceModules : [];

        if(typeof this.configs.serviceConfig.services !== 'object'){
            this.configs.serviceConfig.services = {};
        }

        sm.forEach((sm) => {
            // @ts-ignore
            this.configs.serviceConfig.services[sm.serviceName] = sm.service;
            // @ts-ignore
            this.configs.appConfig.bagExtensions.push(sm.bagExtensions);
        });
    }

    private prepareModelsConfig() : void {
        this.modelsConfig = typeof this.configs.appConfig.models === 'object' ?
            this.configs.appConfig.models : {};
    }

    private preCompileModels(models : Record<string,Model | any>) {

        //first pre compile the array short syntax on main level
        //to get references for fix import issues array
        for(let name in models) {
            if(models.hasOwnProperty(name)) {
                this.preCompileArrayShortSyntax(name,models)
            }
        }

        for(let name in models) {
            if(models.hasOwnProperty(name)) {
                this.modelPreCompileStep1(name,models);
            }
        }

        for(let name in models) {
            if(models.hasOwnProperty(name)) {
                this.modelPreCompileStep2(models[name]);
            }
        }

    }

    private preCompileTmpBuilds() : void {
        this.preCompileModels(this.modelImportEngine.tmpCreatedModels);
    }

    private preCompileObjectProperties(obj : ObjectModelConfig) : void
    {
        const properties = obj.properties;
        for(let propName in properties) {
            if (properties.hasOwnProperty(propName)) {
                this.modelPreCompileStep1(propName,properties);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private preCompileArrayShortSyntax(key : string,obj : object) : void
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
    private modelPreCompileStep1(key : string, obj : object) : void
    {
        const nowValue = obj[key];

        if(isModelConfigTranslatable(nowValue)){
            obj[key] = nowValue.__toModelConfig();
            this.modelPreCompileStep1(key,obj);
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
                this.modelPreCompileStep1(nameof<ArrayModelConfig>(s => s.array),obj[key]);
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
                this.preCompileObjectProperties(nowValue);

                //preCompileObject

            }
            else if(nowValue.hasOwnProperty(nameof<ArrayModelConfig>(s => s.array))) {
                //we have array look in the array body!
                this.modelPreCompileStep1(nameof<ArrayModelConfig>(s => s.array),nowValue);
            }
            else if(nowValue.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf)))
            {
                //anyOf
                Iterator.iterateSync((key,value,src) => {
                    this.modelPreCompileStep1(key,src);
                },nowValue[nameof<AnyOfModelConfig>(s => s.anyOf)]);
            }
            else {
                //value!
                this.preCompileValidationFunctions(nowValue);
            }

            (nowValue as ModelPreparationMem)._pcStep1 = true;
        }
    }

    /**
     * The second model pre-compile that will resolve the object model and value model inheritance.
     * That process needs to be done after pre-compile step one because
     * all string links have to be resolved before duplicate them.
     * Also, this step will create the underscore process closure for the runtime.
     * @param value
     */
    private modelPreCompileStep2(value : any) : void
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
                            this.modelPreCompileStep2(props[propName]);
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

                    this.modelPreCompileStep2(superObj);

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
                        value[nameof<ObjectModelConfig>(s => s.construct)] = async function(smallBag){
                            await superConstruct.call(this,smallBag);
                            await currentConstruct.call(this,smallBag);
                        };
                    }else {
                        value[nameof<ObjectModelConfig>(s => s.construct)] = async function(smallBag){
                            await superConstruct.call(this,smallBag);
                        };
                    }

                    //extend convert
                    const superConvert =
                        typeof superObj[nameof<ObjectModelConfig>(s => s.convert)] === 'function' ?
                            superObj[nameof<ObjectModelConfig>(s => s.convert)] :
                            async (obj) => {return obj;};
                    const currentConvert = value[nameof<ObjectModelConfig>(s => s.convert)];
                    if(typeof currentConvert === 'function') {
                        value[nameof<ObjectModelConfig>(s => s.convert)] = async (obj, smallBag) => {
                            return currentConvert((await superConvert(obj,smallBag)),smallBag);
                        };
                    }else {
                        value[nameof<ObjectModelConfig>(s => s.convert)] = async (obj, smallBag) => {
                            return superConvert(obj, smallBag);
                        };
                    }

                    //remove extension
                    value[nameof<ObjectModelConfig>(s => s.extends)] = undefined;
                }

                if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    (value as ModelPreparationMem)._process =
                        InputProcessorCreator.createObjectModelProcessor(value);
                }
            }
            else if(value.hasOwnProperty(nameof<ArrayModelConfig>(s => s.array)))
            {
                //is array
                const inArray = value[nameof<ArrayModelConfig>(s => s.array)];
                this.modelPreCompileStep2(inArray);

                if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    (value as ModelPreparationMem)._process =
                        InputProcessorCreator.createArrayModelProcessor(value);
                }
            }
            else if(value.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf)))
            {
                //any of
                Iterator.iterateSync((key,value) => {
                    this.modelPreCompileStep2(value);
                },value[nameof<AnyOfModelConfig>(s => s.anyOf)]);

                if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    (value as ModelPreparationMem)._process =
                        InputProcessorCreator.createAnyOfModelProcessor(value);
                }
            }
            else {
                //value
                this.preCompileValueExtend(value,value);

                if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
                    (value as ModelPreparationMem)._process =
                        InputProcessorCreator.createValueModelProcessor(value);
                }
            }
            if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._optionalInfo))){
                (value as ModelPreparationMem)._optionalInfo =
                    OptionalProcessor.process(value);
            }

            (value as ModelPreparationMem)._pcStep2 = true;
        }
    }

    /**
     * A function that will recursively resolve the inheritance of value models.
     * @param mainValue
     * @param exValueConfig
     */
    private preCompileValueExtend(mainValue : ValueModelConfig,exValueConfig : ValueModelConfig) {
        if(exValueConfig.extends !== undefined){
            const nextExValueConfig = this.modelImportEngine.extendsResolve(exValueConfig.extends);
            ObjectUtils.addObToOb(mainValue,nextExValueConfig);
            return this.preCompileValueExtend(mainValue,nextExValueConfig);
        }
    }

    // noinspection JSMethodCanBeStatic
    /**
     * A function that will precompile validation functions of a value model.
     * @param value
     */
    private preCompileValidationFunctions(value : ValueModelConfig) : void
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

    private preCompileControllerDefaults() : void {
        if(this.configs.appConfig.controllerDefaults) {
            this.preCompileInputConfig(this.configs.appConfig.controllerDefaults);
        }
    }

    private preCompileControllers() : void
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
                    const config : ControllerConfig = controllerClass.config;
                    //set the defaults if property missing
                    for(let property in this.controllerDefaults) {
                        if(this.controllerDefaults.hasOwnProperty(property) && config[property] === undefined) {
                            config[property] = this.controllerDefaults[property];
                        }
                    }
                    this.preCompileInputConfig(config);
                });
            }
        }
    }

    private preCompileSystemController() : void
    {
        for(let k in SystemController){
            if(SystemController.hasOwnProperty(k)){
                this.preCompileInputConfig(SystemController[k].config);
            }
        }
    }

    private preCompileDataBoxes() : void
    {
        //set if dataBox property is not found
        if(!this.configs.appConfig.dataBoxes) {
            this.configs.appConfig.dataBoxes = {};
        }

        //iterate over DataBoxes
        const dataBoxes = this.configs.appConfig.dataBoxes;
        for(let k in dataBoxes) {
            if(dataBoxes.hasOwnProperty(k)) {
                Iterator.iterateCompDefinition<DataBoxClassDef>(dataBoxes[k],(dataBoxClass) => {
                    const config : DataBoxConfig = dataBoxClass.config;
                    //set the defaults if property missing
                    for(let property in this.dataBoxDefaults) {
                        if(this.dataBoxDefaults.hasOwnProperty(property) && config[property] === undefined) {
                            config[property] = this.dataBoxDefaults[property];
                        }
                    }
                });
            }
        }
    }

    private preCompileInputConfig(inputConfig : InputConfig) : void {
        if(inputConfig.input) {
            let input = inputConfig.input;
            if(isInputConfigTranslatable(input)){
                input = input.__toInputConfig();
                inputConfig.input = input;
            }

            if(Array.isArray(input)) {
                //resolve single input shortcut
                // @ts-ignore
                this.preCompileSingleInput(input);
            }
            else {
                // @ts-ignore
                this.preCompileParamInput(input);
            }
        }
    }

    private preCompileParamInput(paramInput : ParamInput | Processable) : void {
        for(let inputName in paramInput) {
            if(paramInput.hasOwnProperty(inputName)) {
                //resolve values,object,array links and resolve inheritance
                this.modelPreCompileStep1(inputName,paramInput);
                this.modelPreCompileStep2(paramInput[inputName]);
            }
        }
        if(!paramInput.hasOwnProperty(nameof<ModelPreparationMem>(s => s._process))){
            (paramInput as Processable)._process =
                InputProcessorCreator.createParamInputProcessor((paramInput as ParamInput));
        }
    }

    private preCompileSingleInput(singleModelInput : SingleModelInput) : void {
        this.modelPreCompileStep1('0',singleModelInput);
        this.modelPreCompileStep2(singleModelInput[0]);
    }

}