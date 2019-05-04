/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {
    ChannelConfig,
    ChannelDefault,
    ChannelSettings,
    CustomChannelConfig
} from "../configDefinitions/channelConfig";
import {
    AnyOfModelConfig,
    ArrayModelConfig,
    ControllerConfig, InputConfig, Model, MultiInput, ObjectModelConfig, ValueModelConfig,
} from "../configDefinitions/appConfig";
import ModelImportEngine from "./modelImportEngine";
import ObjectUtils       from "../utils/objectUtils";
import Iterator          from "../utils/iterator";
import FuncUtils         from "../utils/funcUtils";
import {OtherLoadedConfigSet, OtherPreCompiledConfigSet} from "../configManager/configSets";
import {
    BeforeBackErrorBagFunction,
    BeforeBackErrorFunction,
    BeforeCodeErrorFunction,
    BeforeErrorFunction,
    ExpressFunction,
    HttpServerStartedFunction,
    MiddlewareAuthenticationFunction,
    PreCompiledEventConfig,
    ScServerAuthenticationFunction,
    ScServerAuthenticationStateChangeFunction,
    ScServerBadSocketAuthTokenFunction,
    ScServerConnectionFunction,
    ScServerDeauthenticationFunction,
    ScServerErrorFunction,
    ScServerFunction,
    ScServerNoticeFunction, ScServerReadyFunction,
    ScServerSocketCodeDataFunction,
    ScServerSocketFunction,
    ScServerSubscriptionFunction,
    ScServerUnsubscriptionFunction,
    SocketAuthenticateFunction,
    SocketAuthStateChangeFunction,
    SocketBadAuthTokenFunction,
    SocketCodeDataFunction,
    SocketConnectFunction,
    SocketDeauthenticateFunction,
    SocketErrorFunction,
    SocketMessageFunction,
    SocketRawFunction,
    SocketSubscribeFunction,
    SocketUnsubscribeFunction,
    StartedFunction,
    WorkerStartedFunction,
    WsServerStartedFunction,
    ZationSocketDisconnectionFunction,
    ZationSocketFunction,
    ZationWorkerMessageFunction
} from "../configDefinitions/eventConfig";

export default class ConfigPreCompiler
{
    private readonly configs : OtherLoadedConfigSet;

    private controllerDefaults : object;
    private modelsConfig : object;
    private modelImportEngine : ModelImportEngine;

    constructor(configs : OtherLoadedConfigSet)
    {
        this.configs = configs;
        this.prepare();
    }

    preCompile() : OtherPreCompiledConfigSet
    {
        this.preCompileModels(this.modelsConfig);
        this.preCompileTmpBuilds();
        this.preCompileControllerDefaults();
        this.preCompileController();
        this.preCompileChannelConfig();
        this.preCompileServiceModules();
        this.preCompileEventConfig();

        //view precompiled configs
        //console.dir(this.configs.appConfig,{depth:null});
        //console.dir(this.configs.channelConfig,{depth:null});

        // @ts-ignore
        return this.configs;
    }

    private prepare() : void
    {
        this.prepareControllerDefaults();
        this.prepareModelsConfig();
        this.prepareBagExtensions();
        this.modelImportEngine = new ModelImportEngine(this.modelsConfig);
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

    private preCompileChannelConfig() : void
    {
        const channelConfig = this.configs.channelConfig;

        for(let k in channelConfig)
        {
            if(channelConfig.hasOwnProperty(k))
            {
                const ch = channelConfig[k];
                if(typeof ch === 'object')
                {
                    if(k === nameof<ChannelConfig>(s => s.customIdChannels) ||
                        k === nameof<ChannelConfig>(s => s.customChannels)) {
                        this.preCompileChannelDefault(ch);
                    }
                }
                else {
                    channelConfig[k] = {};
                }

            }
        }
    }

    private preCompileEventConfig() {

        const defaultFunc = () => {};
        const resEventConfig : PreCompiledEventConfig = {
            express  : defaultFunc,
            scServer  : defaultFunc,
            socket  : defaultFunc,
            workerStarted  : defaultFunc,
            workerLeaderStarted : defaultFunc,
            httpServerStarted  : defaultFunc,
            wsServerStarted  : defaultFunc,
            started  : defaultFunc,
            beforeError  : defaultFunc,
            beforeBackError  : defaultFunc,
            beforeCodeError  : defaultFunc,
            beforeBackErrorBag  : defaultFunc,
            socketDisconnection  : defaultFunc,
            workerMessage  : defaultFunc,
            sc_socketError  : defaultFunc,
            sc_socketRaw  : defaultFunc,
            sc_socketConnect  : defaultFunc,
            sc_socketDisconnect  : defaultFunc,
            sc_socketConnectAbort  : defaultFunc,
            sc_socketClose  : defaultFunc,
            sc_socketSubscribe  : defaultFunc,
            sc_socketUnsubscribe  : defaultFunc,
            sc_socketBadAuthToken  : defaultFunc,
            sc_socketAuthenticate  : defaultFunc,
            sc_socketDeauthenticate  : defaultFunc,
            sc_socketAuthStateChange  : defaultFunc,
            sc_socketMessage  : defaultFunc,
            sc_serverError  : defaultFunc,
            sc_serverNotice  : defaultFunc,
            sc_serverHandshake  : defaultFunc,
            sc_serverConnectionAbort  : defaultFunc,
            sc_serverDisconnection  : defaultFunc,
            sc_serverClosure  : defaultFunc,
            sc_serverConnection  : defaultFunc,
            sc_serverSubscription  : defaultFunc,
            sc_serverUnsubscription  : defaultFunc,
            sc_serverAuthentication  : defaultFunc,
            sc_serverDeauthentication  : defaultFunc,
            sc_serverAuthenticationStateChange  : defaultFunc,
            sc_serverBadSocketAuthToken  : defaultFunc,
            sc_serverReady  : defaultFunc,
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

    private preCompileChannelDefault(channels : object) : void
    {
        if(channels[nameof<ChannelDefault>(s => s.default)])
        {
            const defaultCh : CustomChannelConfig =
                channels[nameof<ChannelDefault>(s => s.default)]
            ;
            for(let chName in channels)
            {
                if(channels.hasOwnProperty(chName) && chName !== channels[nameof<ChannelDefault>(s => s.default)])
                {
                    const channel : CustomChannelConfig = channels[chName];

                    if(!(channel.subscribeAccess !== undefined || channel.subscribeNotAccess !== undefined)) {
                        if(defaultCh.subscribeAccess !== undefined) {
                            channel.subscribeAccess = defaultCh.subscribeAccess;
                        }
                        if(defaultCh.subscribeNotAccess !== undefined) {
                            channel.subscribeNotAccess = defaultCh.subscribeNotAccess
                        }
                    }

                    if(!(channel.clientPublishAccess !== undefined || channel.clientPublishNotAccess !== undefined)) {
                        if(defaultCh.clientPublishAccess !== undefined) {
                            channel.clientPublishAccess = defaultCh.clientPublishAccess;
                        }
                        if(defaultCh.clientPublishNotAccess !== undefined) {
                            channel.clientPublishNotAccess = defaultCh.clientPublishNotAccess
                        }
                    }

                    this.processDefaultValue(channel,defaultCh,nameof<CustomChannelConfig>(s => s.onClientPublish));
                    this.processDefaultValue(channel,defaultCh,nameof<CustomChannelConfig>(s => s.onSubscription));
                    this.processDefaultValue(channel,defaultCh,nameof<CustomChannelConfig>(s => s.onUnsubscription));
                    this.processDefaultValue(channel,defaultCh,nameof<ChannelSettings>(s => s.socketGetOwnPublish));
                }
            }
            delete channels[nameof<ChannelDefault>(s => s.default)];
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

        //than resolve the links,short syntax,values...
        for(let name in models) {
            if(models.hasOwnProperty(name)) {
                this.preCompileModel(name,models);
            }
        }

        //than resolve the objects inheritance
        for(let name in models) {
            if(models.hasOwnProperty(name)) {
                this.preCompileInheritance(models[name]);
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
                this.preCompileModel(propName,properties);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private preCompileArrayShortSyntax(key : string,obj : object) : void
    {
        const nowValue = obj[key];
        if(Array.isArray(nowValue))
        {
            const inArray = nowValue[0];
            let arrayExtras = {};

            if(nowValue.length === 2 && typeof nowValue[1] === 'object') {
                arrayExtras = nowValue[1];
            }
            obj[key] = arrayExtras;
            obj[key][nameof<ArrayModelConfig>(s => s.array)] = inArray;
        }
    }

    private preCompileModel(key : string, obj : object) : void
    {
        const nowValue = obj[key];

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
                this.preCompileModel(nameof<ArrayModelConfig>(s => s.array),obj[key]);
            }
        }
        else if(typeof nowValue === "object")
        {
            if(nowValue.hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties))) {
                //isObject
                //check all properties of object!
                this.preCompileObjectProperties(nowValue);
            }
            else if(nowValue.hasOwnProperty(nameof<ArrayModelConfig>(s => s.array))) {
                //we have array look in the array body!
                this.preCompileModel(nameof<ArrayModelConfig>(s => s.array),nowValue);
            }
            else if(nowValue.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf)))
            {
                //anyOf
                Iterator.iterateSync((key,value,src) => {
                    this.preCompileModel(key,src);
                },nowValue[nameof<AnyOfModelConfig>(s => s.anyOf)]);
            }
            else {
                //value!
                this.preCompileValidationFunctions(nowValue);
                this.preCompileValueExtend(nowValue,nowValue);
            }
        }
    }

    private preCompileValueExtend(mainValue : ValueModelConfig,exValueConfig : ValueModelConfig) {
        if(typeof exValueConfig.extends === 'string'){
            const nextExValueConfig = this.modelImportEngine.extendsResolve(exValueConfig.extends);
            ObjectUtils.addObToOb(mainValue,nextExValueConfig);
            return this.preCompileValueExtend(mainValue,nextExValueConfig);
        }
    }

    // noinspection JSMethodCanBeStatic
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

    private preCompileInheritance(value : any) : void
    {
        if(typeof value === "object")
        {
            //check input
            if(value.hasOwnProperty(nameof<ObjectModelConfig>(s => s.properties)))
            {
                //isObject
                if(typeof value[nameof<ObjectModelConfig>(s => s.extends)] === 'string')
                {
                    //extends there
                    //check super extends before this
                    const superName = value[nameof<ObjectModelConfig>(s => s.extends)];
                    this.preCompileInheritance(this.modelsConfig[superName]);
                    //lastExtend

                    //check props
                    const props = value[nameof<ObjectModelConfig>(s => s.properties)];
                    if(typeof props === 'object'){
                        for(let propName in props) {
                            if(props.hasOwnProperty(propName)) {
                                this.preCompileInheritance(props[propName]);
                            }
                        }
                    }

                    const superObj = this.modelImportEngine.extendsResolve(superName);


                    //extend Props
                    const superProps = superObj[nameof<ObjectModelConfig>(s => s.properties)];
                    ObjectUtils.addObToOb(value[nameof<ObjectModelConfig>(s => s.properties)],superProps,false);

                    //check for prototype
                    const superPrototype = superObj[nameof<ObjectModelConfig>(s => s.prototype)];
                    if(superPrototype){
                        if(!value[nameof<ObjectModelConfig>(s => s.prototype)]){
                            value[nameof<ObjectModelConfig>(s => s.prototype)] = {};
                        }
                        Object.setPrototypeOf(value[nameof<ObjectModelConfig>(s => s.prototype)],superPrototype);
                    }

                    //extend construct
                    const superConstruct =
                        typeof superObj[nameof<ObjectModelConfig>(s => s.construct)] === 'function' ?
                        superObj[nameof<ObjectModelConfig>(s => s.construct)] :
                        async () => {};
                    const currentConstruct = value[nameof<ObjectModelConfig>(s => s.construct)];
                    if(typeof currentConstruct === 'function') {
                        value[nameof<ObjectModelConfig>(s => s.construct)] = async (obj, smallBag) => {
                            await superConstruct(obj,smallBag);
                            await currentConstruct(obj,smallBag);
                        };
                    }else {
                        value[nameof<ObjectModelConfig>(s => s.construct)] = async (obj, smallBag) => {
                            await superConstruct(obj,smallBag);
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
                            return await currentConvert(await superConvert(obj,smallBag),smallBag);
                        };
                    }else {
                        value[nameof<ObjectModelConfig>(s => s.convert)] = async (obj, smallBag) => {
                            return await superConvert(obj,smallBag);
                        };
                    }

                    //remove extension
                    value[nameof<ObjectModelConfig>(s => s.extends)] = undefined;
                }
            }
            else if(value.hasOwnProperty(nameof<ArrayModelConfig>(s => s.array)))
            {
                //is array
                let inArray = value[nameof<ArrayModelConfig>(s => s.array)];
                this.preCompileInheritance(inArray);
            }
            else if(value.hasOwnProperty(nameof<AnyOfModelConfig>(s => s.anyOf)))
            {
                //any of
                Iterator.iterateSync((key,value) => {
                    this.preCompileInheritance(value);
                },value[nameof<AnyOfModelConfig>(s => s.anyOf)]);
            }
        }
    }

    private preCompileControllerDefaults() : void {
        if(this.configs.appConfig.controllerDefaults) {
            this.preCompileInputConfig(this.configs.appConfig.controllerDefaults);
        }
    }

    private preCompileController() : void
    {
        //set if controller property is not found
        if(!this.configs.appConfig.controllers) {
            this.configs.appConfig.controllers = {};
        }

        //iterate over controller
        const controller = this.configs.appConfig.controllers;
        for(let k in controller)
        {
            if(controller.hasOwnProperty(k))
            {
                const config : ControllerConfig = controller[k].config;

                //set the defaults if property missing
                for(let property in this.controllerDefaults) {
                    if(this.controllerDefaults.hasOwnProperty(property) && config[property] === undefined) {
                        config[property] = this.controllerDefaults[property];
                    }
                }
                this.preCompileInputConfig(config);
            }
        }
    }

    private preCompileInputConfig(inputConfig : InputConfig) : void {
        if(typeof inputConfig.input === 'object') {
            this.preCompileMultiInput(inputConfig.input);
            //resolve multi input shortcut
            inputConfig.multiInput = inputConfig.input;
        }
        else if(typeof inputConfig.multiInput === 'object') {
            this.preCompileMultiInput(inputConfig.multiInput);
        }
        else if(inputConfig.singleInput){
            this.preCompileSingleInput(inputConfig);
        }
    }

    private preCompileMultiInput(multiInput : MultiInput) : void {
        for(let inputName in multiInput)
            if(multiInput.hasOwnProperty(inputName)) {
                //resolve values,object,array links and resolve inheritance
                this.preCompileModel(inputName,multiInput);
                this.preCompileInheritance(multiInput[inputName]);
            }
    }

    private preCompileSingleInput(inputConfig : InputConfig) : void {
        this.preCompileModel(nameof<InputConfig>(s => s.singleInput),inputConfig);
        this.preCompileInheritance(inputConfig[nameof<InputConfig>(s => s.singleInput)]);
    }

}