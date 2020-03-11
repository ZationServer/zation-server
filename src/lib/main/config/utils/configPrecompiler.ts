/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {
    BaseCustomChannelConfig
} from "../definitions/parts/channelsConfig";
import {
    AnyOfModel,
    ArrayModel,
    InputConfig,
    ParamInput,
    ObjectModel,
    ValueModel,
    SingleModelInput,
} from "../definitions/parts/inputConfig";
import ObjectUtils        from "../../utils/objectUtils";
import Iterator           from "../../utils/iterator";
import {OtherLoadedConfigSet, OtherPrecompiledConfigSet} from "../manager/configSets";
import InputProcessorCreator, {Processable}              from '../../input/inputProcessorCreator';
import {SystemController}          from "../../systemController/systemControler.config";
import OptionalProcessor           from "../../input/optionalProcessor";
import ZationConfig                from "../manager/zationConfig";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig}                                     from "../definitions/parts/controllerConfig";
import {ControllerClass}                                      from "../../../api/Controller";
import {DataboxClassDef, DataboxConfig}                       from "../definitions/parts/databoxConfig";
import DbConfigUtils                                          from "../../databox/dbConfigUtils";
import {PrecompiledEvents, Event}                             from '../definitions/parts/events';
import FuncUtils                                              from '../../utils/funcUtils';
import {PrecompiledMiddleware}                                from '../definitions/parts/middleware';
import {modelPrototypeSymbol}                                 from '../../constants/model';
import {isReusableModel}                                      from '../../models/reusableModelCreator';
import {inputConfigTranslateSymbol, isInputConfigTranslatable}                                 from '../../../api/configTranslatable/inputConfigTranslatable';
import {isModelConfigTranslatable, modelConfigTranslateSymbol, resolveModelConfigTranslatable} from '../../../api/configTranslatable/modelConfigTranslatable';

export interface ModelPreparationMem extends Processable{
    _optionalInfo: {isOptional: boolean,defaultValue: any}
    _pcStep1: boolean,
    _pcStep2: boolean
}

export default class ConfigPrecompiler
{
    private readonly configs: OtherLoadedConfigSet;

    private controllerDefaults: ControllerConfig;
    private databoxDefaults: DataboxConfig;

    constructor(configs: OtherLoadedConfigSet)
    {
        this.configs = configs;
        this.prepare();
    }

    precompile(zc: ZationConfig, showPrecompiledConfigs: boolean): OtherPrecompiledConfigSet
    {
        this.preCompileEvents();
        this.preCompileMiddleware();
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
                        ObjectUtils.mergeTwoObjects(channel,customChannelDefaults,false);
                    }
                }
            }
        }
    }

    private preCompileEvents() {
        const defaultFunc = () => {};
        const res: PrecompiledEvents = {
            express: defaultFunc,
            socketServer: defaultFunc,
            workerInit: defaultFunc,
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
            socketSubscription: defaultFunc,
            socketUnsubscription: defaultFunc,
            socketError: defaultFunc,
            socketRaw: defaultFunc,
            socketConnectionAbort: defaultFunc,
            socketBadAuthToken: defaultFunc
        };
        const eventsConfig = this.configs.appConfig.events || {};
        for(let k in eventsConfig) {
            if (eventsConfig.hasOwnProperty(k)) {
                res[k] = ConfigPrecompiler.preCompileEvent(eventsConfig[k],k);
            }
        }
        this.configs.appConfig.events = res as PrecompiledEvents;
    }

    static preCompileEvent<T extends (...args) => any>(event: Event<T>,name: string): (...args: Parameters<T>) => Promise<void> {
        return FuncUtils.createSafeCaller(
            typeof event !== 'function' ? FuncUtils.createFuncArrayAsyncInvoker(event) : event,
            `An error was thrown in the event: '${name}' :`);
    }

    private preCompileMiddleware() {
        const res: PrecompiledMiddleware = {};
        const middlewareConfig = this.configs.appConfig.middleware || {};
        let value;
        for(let k in middlewareConfig) {
            if(middlewareConfig.hasOwnProperty(k)){
                value = middlewareConfig[k];
                res[k] = typeof value !== 'function' ? FuncUtils.createFuncMiddlewareAsyncInvoker(value) : value;
            }
        }
        this.configs.appConfig.middleware = res;
    }

    private precompileObjectProperties(obj: ObjectModel): void
    {
        const properties = obj.properties;
        for(let propName in properties) {
            if (properties.hasOwnProperty(propName)) {
                this.modelPrecompileStep1(propName,properties);
            }
        }
    }

    /**
     * The first model pre-compile step that will pre-compile value models.
     * Also, it will convert the array short syntax to an array model and
     * resolve config translatable objects.
     * @param key
     * @param obj
     */
    private modelPrecompileStep1(key: string, obj: object): void
    {
        const nowValue = resolveModelConfigTranslatable(obj[key]) as ObjectModel;

        if(Array.isArray(nowValue))
        {
            let inArray = {};
            let needArrayPreCompile = false;

            if(typeof nowValue[0] === 'object' || Array.isArray(nowValue[0])) {
                inArray = nowValue[0];
                needArrayPreCompile = true;
            }

            let arrayExtras = {};
            if(nowValue.length === 2 && typeof nowValue[1] === 'object') {
                arrayExtras = nowValue[1];
            }

            obj[key] = arrayExtras;
            obj[key][nameof<ArrayModel>(s => s.array)] = inArray;

            if(needArrayPreCompile) {
                this.modelPrecompileStep1(nameof<ArrayModel>(s => s.array),obj[key]);
            }
        }
        else if(typeof nowValue === "object")
        {
            if((nowValue as unknown as ModelPreparationMem)._pcStep1){
                return;
            }

            if(nowValue.hasOwnProperty(nameof<ObjectModel>(s => s.properties))) {
                //isObject
                //check all properties of object.
                this.precompileObjectProperties(nowValue);

            }
            else if(nowValue.hasOwnProperty(nameof<ArrayModel>(s => s.array))) {
                //Array, check body.
                this.modelPrecompileStep1(nameof<ArrayModel>(s => s.array),nowValue);
            }
            else if(nowValue.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf)))
            {
                //anyOf
                Iterator.iterateSync((key,value,src) => {
                    this.modelPrecompileStep1(key,src);
                },nowValue[nameof<AnyOfModel>(s => s.anyOf)]);
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
            if(!value.hasOwnProperty(nameof<ModelPreparationMem>(s => s._optionalInfo))){
                Object.defineProperty(value,nameof<ModelPreparationMem>(s => s._optionalInfo),{
                    value: OptionalProcessor.process(value),
                    enumerable: false,
                    writable: false,
                    configurable: false
                });
            }

            if((value as ModelPreparationMem)._pcStep2){
                return;
            }

            //check input
            if(value.hasOwnProperty(nameof<ObjectModel>(s => s.properties)))
            {
                //check props
                const props = value[nameof<ObjectModel>(s => s.properties)];
                if(typeof props === 'object'){
                    for(let propName in props) {
                        if(props.hasOwnProperty(propName)) {
                            this.modelPrecompileStep2(props[propName]);
                        }
                    }
                }

                //isObject
                if(value[modelPrototypeSymbol] !== undefined)
                {
                    //extends there
                    //check super extends before this
                    //lastExtend
                    const superObj: ObjectModel = resolveModelConfigTranslatable(value[modelPrototypeSymbol]) as ObjectModel;

                    this.modelPrecompileStep2(superObj);

                    //extend Props
                    const superProps = superObj.properties;
                    ObjectUtils.mergeTwoObjects((value as ObjectModel).properties,superProps,false);

                    //check for prototype
                    const superPrototype = superObj.prototype;
                    if(superPrototype){
                        if(!value[nameof<ObjectModel>(s => s.prototype)]){
                            value[nameof<ObjectModel>(s => s.prototype)] = superPrototype;
                        }
                        else {
                            Object.setPrototypeOf(value[nameof<ObjectModel>(s => s.prototype)],superPrototype);
                        }
                    }

                    //extend construct
                    const superConstruct = typeof superObj.construct === 'function' ? superObj.construct : async () => {};
                    const currentConstruct = value[nameof<ObjectModel>(s => s.construct)];
                    if(typeof currentConstruct === 'function') {
                        value[nameof<ObjectModel>(s => s.construct)] = async function(bag){
                            await superConstruct.call(this,bag);
                            await currentConstruct.call(this,bag);
                        };
                    }
                    else {
                        value[nameof<ObjectModel>(s => s.construct)] = async function(bag){
                            await superConstruct.call(this,bag);
                        };
                    }

                    //extend convert
                    const superConvert =
                        typeof superObj.convert === 'function' ? superObj.convert : async (obj) => {return obj;};
                    const currentConvert = value[nameof<ObjectModel>(s => s.convert)];
                    if(typeof currentConvert === 'function') {
                        value[nameof<ObjectModel>(s => s.convert)] = async (obj, bag) => {
                            return currentConvert((await superConvert(obj,bag)),bag);
                        };
                    }
                    else {
                        value[nameof<ObjectModel>(s => s.convert)] = async (obj, bag) => {
                            return superConvert(obj, bag);
                        };
                    }

                    //remove extension
                    value[modelPrototypeSymbol] = undefined;
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
            else if(value.hasOwnProperty(nameof<ArrayModel>(s => s.array)))
            {
                //is array
                const inArray = value[nameof<ArrayModel>(s => s.array)];
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
            else if(value.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf)))
            {
                //any of
                Iterator.iterateSync((key,value) => {
                    this.modelPrecompileStep2(value);
                },value[nameof<AnyOfModel>(s => s.anyOf)]);

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
    private precompileValueExtend(mainValue: ValueModel, exValueConfig: ValueModel) {
        const proto = exValueConfig[modelPrototypeSymbol];
        if(proto !== undefined) {
            ObjectUtils.mergeTwoObjects(mainValue,proto);
            return this.precompileValueExtend(mainValue,proto);
        }
    }

    // noinspection JSMethodCanBeStatic
    /**
     * A function that will precompile validation functions of a value model.
     * @param value
     */
    private precompileValidationFunctions(value: ValueModel): void
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
                    ObjectUtils.mergeTwoObjects(config,this.controllerDefaults,false);
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
                    ObjectUtils.mergeTwoObjects(config,this.databoxDefaults,false);
                    this.precompileInputConfig(DbConfigUtils.convertDbInitInput(config));
                    this.precompileInputConfig(DbConfigUtils.convertDbFetchInput(config));
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
            else if(isModelConfigTranslatable(input)){
                input = input[modelConfigTranslateSymbol]();
            }

            if(Array.isArray(input)) {
                this.precompileSingleInput(input as unknown as SingleModelInput);
            }
            else if(isReusableModel(input)){
                this.precompileSingleInput([input]);
            }
            else {
                this.precompileParamInput(input as ParamInput);
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