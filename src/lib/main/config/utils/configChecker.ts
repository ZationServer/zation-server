/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ConfigNames, DEFAULT_USER_GROUP_FALLBACK, ZationAccessRecord} from '../../constants/internal';
import {AppConfig}                                    from '../definitions/main/appConfig';
import {PanelUserConfig}                              from '../definitions/main/mainConfig';
import {BaseCustomChannelConfig, ZationChannelConfig} from '../definitions/parts/channelsConfig';
// noinspection TypeScriptPreferShortImport
import {OnlyBase64Functions, OnlyDateFunctions, OnlyNumberFunctions, OnlyStringFunctions, TypeTypes} from '../../constants/validation';
import ConfigCheckerTools                    from './configCheckerTools';
import ConfigError                           from '../../error/configError';
import Target                                from './target';
import Logger                                from '../../log/logger';
import ObjectPath                            from '../../utils/objectPath';
import Controller, {ControllerClass}         from '../../../api/Controller';
import {ValidationTypeRecord}                from '../../constants/validationType';
import Iterator                              from '../../utils/iterator';
import ObjectUtils                           from '../../utils/objectUtils';
import ConfigLoader                          from '../manager/configLoader';
import {isModelConfigTranslatable, modelConfigTranslateSymbol, resolveModelConfigTranslatable} from '../../../api/configTranslatable/modelConfigTranslatable';
import {modelNameSymbol, modelOptionalSymbol, modelPrototypeSymbol}                            from '../../constants/model';
import {AnyOfModel, ArrayModel, InputConfig, Model, ObjectModel, ParamInput, ValueModel} from '../definitions/parts/inputConfig';
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig}               from '../definitions/parts/controllerConfig';
import {DataboxClassDef, DataboxConfig} from '../definitions/parts/databoxConfig';
import DataboxFamily                    from '../../../api/databox/DataboxFamily';
import Databox                          from '../../../api/databox/Databox';
import {AuthAccessConfig, VersionAccessConfig} from '../definitions/parts/configComponents';
import DbConfigUtils                           from '../../databox/dbConfigUtils';
import {getNotableValue, isNotableNot}         from '../../../api/Notable';
import ErrorBag                                from '../../error/errorBag';
import {modelIdSymbol}                         from '../../models/modelId';
import {inputConfigTranslateSymbol, isInputConfigTranslatable} from '../../../api/configTranslatable/inputConfigTranslatable';
import {isReusableModel}                                       from '../../models/reusableModelCreator';
import {processAnyOfKey}                                       from '../../models/anyOfModelUtils';
import AuthController                                          from '../../../api/AuthController';

export interface ModelCheckedMem {
    _checked: boolean
}

export default class ConfigChecker
{
    private readonly zcLoader: ConfigLoader;
    private ceb: ErrorBag<ConfigError>;

    private authControllerIdentifier: string;
    private validAccessValues: any[];
    private checkedModelIds: number[] = [];

    constructor(zationConfigLoader) {
        this.zcLoader = zationConfigLoader;
    }

    public checkAllConfigs(): ErrorBag<ConfigError> {
        this.ceb = new ErrorBag<ConfigError>();
        this.prepare();
        this.checkConfig();
        return this.ceb;
    }

    private prepare() {
        this.prepareAllValidUserGroupsAndCheck();
    }

    private checkUserGroupName(name: string, notAllowed: string[], isAuth: boolean) {
        if (name.indexOf('.') !== -1) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${name} is not a valid ${isAuth ? 'auth': 'default'} user group! Dot/s in name are not allowed.`));
        }
        if (notAllowed.includes(name)) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${isAuth ? 'auth': 'default'} user group with name ${name} is not allowed use an other name!`));
        }
    }

    private prepareAllValidUserGroupsAndCheck() {

        let groups: any = [];
        let extraKeys: any = [
            nameof<ZationAccessRecord>(s => s.all),
            nameof<ZationAccessRecord>(s => s.allNotAuth),
            nameof<ZationAccessRecord>(s => s.allAuth)
        ];

        if (typeof this.zcLoader.appConfig.userGroups === 'object') {
            if (typeof this.zcLoader.appConfig.userGroups.auth === 'object') {

                const authUserGroups = this.zcLoader.appConfig.userGroups.auth;
                groups = Object.keys(authUserGroups);

                //check auth user groups
                for (let aug in authUserGroups) {
                    if (authUserGroups.hasOwnProperty(aug)) {
                        this.checkUserGroupName(aug, extraKeys, true);
                    }
                }
            }
            if (typeof this.zcLoader.appConfig.userGroups.default === 'string') {
                const defaultGroup = this.zcLoader.appConfig.userGroups.default;
                this.checkUserGroupName(defaultGroup, extraKeys, false);
                groups.push(defaultGroup);
            } else {
                Logger.consoleLogConfigWarning
                (ConfigNames.App, `No settings for the default user group found! Default user group will be set to ${DEFAULT_USER_GROUP_FALLBACK}`);
                groups.push(DEFAULT_USER_GROUP_FALLBACK);
            }
        } else {
            Logger.consoleLogConfigWarning
            (ConfigNames.App, `No settings for the user groups are found! DefaultUserGroup will be set to 'default'`);
        }

        this.validAccessValues = groups;
        this.validAccessValues.push(...extraKeys);
    }

    private checkConfig() {
        this.checkMainConfig();
        this.checkAppConfig();
    }

    private checkAppConfig() {
        this.checkAccessControllerDefaultIsSet();
        this.checkControllers();
        this.checkDataboxConfigs();
        this.checkCustomChannelsDefaults();
        this.checkCustomChannels();
        this.checkZationChannels();
    }

    private checkCustomChannelsDefaults(){
        const customChannelsDefaults = this.zcLoader.appConfig.customChannelDefaults;
        if(typeof customChannelsDefaults === 'object'){
            this.checkCustomChannelConfig(customChannelsDefaults, new Target('Custom channel defaults: '));
        }
    }

    private checkCustomChannels() {
        const customChannels = this.zcLoader.appConfig.customChannels;
        if(typeof customChannels === 'object'){
            const target = new Target('Custom Channel: ');

            for(const key in customChannels){
                if(customChannels.hasOwnProperty(key)){

                    const secTarget = target.addPath(key);

                    let value: any = customChannels[key];

                    if(Array.isArray(value)){
                        if(value.length > 1){
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `${secTarget.toString()} to define a custom channel family, the array should only contain one or zero elements.`));
                        }
                        value = value[0] || {};
                    }

                    this.checkIdentifier(key,'Custom channel',target.toString() + ' ');
                    this.checkCustomChannelConfig(value, secTarget);
                }
            }
        }
    }

    private checkZationChannels() {
        const zationChannels = this.zcLoader.appConfig.zationChannels;

        if(typeof zationChannels === 'object'){
            const target = new Target('Zation Channels: ');

            for(const key in zationChannels){
                if(zationChannels.hasOwnProperty(key)){
                    this.checkZationChannelConfig(zationChannels[key],target.addPath(key));
                }
            }
        }
    }

    private checkClientPubAccess(channel: ZationChannelConfig,target: Target) {
        //check protocolAccess dependency to userGroups
        this.checkAccessKeyDependency(getNotableValue(channel.clientPublishAccess),
            target.addPath(nameof<ZationChannelConfig>(s => s.clientPublishAccess)));

        this.warningForPublish(channel.clientPublishAccess, target);
    }

    private checkSubAccess(channel: BaseCustomChannelConfig, target: Target) {
        //check protocolAccess dependency to userGroups
        this.checkAccessKeyDependency(getNotableValue(channel.subscribeAccess),
            target.addPath(nameof<BaseCustomChannelConfig>(s => s.subscribeAccess)));
    }


    private checkZationChannelConfig(channel: ZationChannelConfig,target: Target) {
        if(typeof channel === 'object'){
            this.checkClientPubAccess(channel,target);
        }
    }

    private checkCustomChannelConfig(channel: BaseCustomChannelConfig, target: Target): void {
        if (typeof channel === 'object') {
            this.checkClientPubAccess(channel,target);
            this.checkSubAccess(channel,target);
        }
    }

    // noinspection JSMethodCanBeStatic
    private warningForPublish(value: any, target: Target): void {
        if (getNotableValue(value) === !isNotableNot(value)) {
            Logger.consoleLogConfigWarning
            (ConfigNames.App,
                `${target.toString()} please notice that 'clientPubAccess' is used when a client publishes from outside in a channel! ` +
                `That is only useful for advanced use cases otherwise its recommended to use a controller (with validation) and publish from the server side.`);
        }
    }


    private checkAccessControllerDefaultIsSet() {
        const accessValue = getNotableValue(ObjectPath.get(this.zcLoader.appConfig,
            [nameof<AppConfig>(s => s.controllerDefaults), nameof<ControllerConfig>(s => s.access)]));
        if (accessValue === undefined) {
            Logger.consoleLogConfigWarning(ConfigNames.App, 'It is recommended to set a controller default value for access or notAccess.');
        }
    }

    private checkObject(obj: ObjectModel, target: Target, rememberCache: Model[], inheritanceCheck: boolean = true, skipTargetPathAdd: boolean = false, skipProps: string[] = []) {
        if(!skipTargetPathAdd && typeof obj[modelNameSymbol] === 'string'){
            target = target.addPath(`(${obj[modelNameSymbol]})`);
        }

        const prototype = typeof obj.prototype === 'object' ? obj.prototype: {};
        //check property body and prototype property name problem
        if (typeof obj.properties === 'object') {
            let props = obj.properties;
            for (let k in props) {
                if ((!skipProps.includes(k)) && props.hasOwnProperty(k)) {
                    this.checkModel(props[k], target.addPath(k), [...rememberCache]);
                    if (prototype.hasOwnProperty(k)) {
                        Logger.consoleLogConfigWarning(
                            ConfigNames.App,
                            `${target.toString()} Property '${k}' will shadowing the prototype property '${k}'.`);
                    }
                }
            }
        }
        //check for inheritance
        if (inheritanceCheck) {
            this.checkObjExtendsResolve(target,target,obj,obj,rememberCache);
        }
    }

    private static isObjModel(obj: any): boolean {
        return typeof obj === 'object' && typeof obj[nameof<ObjectModel>(s => s.properties)] === 'object';
    }

    private static isValueModel(obj: any): obj is ValueModel {
        return typeof obj === 'object' &&
            obj[nameof<ObjectModel>(s => s.properties)] === undefined &&
            obj[nameof<ArrayModel>(s => s.array)] === undefined &&
            obj[nameof<AnyOfModel>(s => s.anyOf)] === undefined;
    }

    // @ts-ignore
    // noinspection JSUnusedLocalSymbols
    private static isArrayModel(arr: any): boolean {
        return Array.isArray(arr) || (
            typeof arr === 'object' &&
            typeof arr[nameof<ArrayModel>(s => s.array)] === 'object'
        );
    }

    /**
     * Check object inheritance that also can include
     * new anonymous object models or already checked object models.
     * @param target
     * @param srcTarget
     * @param baseModel
     * @param model
     * @param rememberCache
     * @param inheritanceRemCache
     * @param propsOverwritten
     */
    private checkObjExtendsResolve(target: Target,
                                   srcTarget: Target,
                                   baseModel: ObjectModel,
                                   model: ObjectModel,
                                   rememberCache: Model[],
                                   inheritanceRemCache: Model[] = [],
                                   propsOverwritten: string[] = []
    ): void
    {
        const prototype = model[modelPrototypeSymbol];
        const prototypeType = typeof prototype;
        if(prototypeType === 'object' || prototypeType === 'function') {
            const resModel = resolveModelConfigTranslatable(prototype);

            target = target.addPath(`extends=>${typeof resModel[modelNameSymbol] === 'string' ? 
                resModel[modelNameSymbol] : 'Anonymous'}`);

            if(inheritanceRemCache.includes(resModel) || resModel === baseModel){
                this.ceb.addError(new ConfigError(ConfigNames.App,`${target.toString()} creates a circular object model inheritance.`));
                return;
            }
            inheritanceRemCache.push(resModel);

            if(!ConfigChecker.isObjModel(resModel)){
                this.ceb.addError(new ConfigError(ConfigNames.App,
                    `${target.toString()} an object model can only extend an object model.`));
                return;
            }
            else {
                this.checkOverrideProp(baseModel.properties,resModel,target,srcTarget);

                const currentProperties = (model as ObjectModel).properties;
                for(const k in currentProperties) {
                    if(currentProperties.hasOwnProperty(k) && (!propsOverwritten.includes(k))){
                        propsOverwritten.push(k);
                    }
                }

                //Check only new anonymous object models.
                if(!(resModel as ModelCheckedMem)._checked){
                    this.checkObject(resModel as ObjectModel,target,rememberCache,false,true,propsOverwritten);
                }

                this.checkObjExtendsResolve(target,srcTarget,baseModel,resModel as ObjectModel,
                    rememberCache,inheritanceRemCache,propsOverwritten);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private checkOverrideProp(props,superObj,target: Target,srcTarget: Target) {
        if (typeof props === 'object' && typeof superObj.prototype === 'object') {
            const superPrototype = superObj.prototype;
            for (let prop in props) {
                if (props.hasOwnProperty(prop)) {
                    if (superPrototype.hasOwnProperty(prop)) {
                        Logger.consoleLogConfigWarning(
                            ConfigNames.App,
                            `${srcTarget.toString()} Property '${prop}' is shadowing an inherited prototype property '${prop}' from ${target.getPath()}.`);
                    }
                }
            }
        }
    }

    private checkMainConfig() {
        this.checkPanelUserMainConfig();
        this.checkOrigins();
        this.checkDefaultClientApiLevel();
        this.mainConfigWarnings();
    }

    private mainConfigWarnings() {
        if(!this.zcLoader.mainConfig.useTokenStateCheck){
            Logger.consoleLogConfigWarning
            (
                ConfigNames.Main,
                `Notice that with deactivated TokenStateCheck everyone can access every component.`
            );
        }
    }

    private checkDefaultClientApiLevel()
    {
        if(this.zcLoader.mainConfig.defaultClientApiLevel) {
            if(!Number.isInteger(this.zcLoader.mainConfig.defaultClientApiLevel)){
                this.ceb.addError(new ConfigError(ConfigNames.Main,
                    `The defaultClientApiLevel must be an integer.`));
            }
            if(this.zcLoader.mainConfig.defaultClientApiLevel < 1){
                this.ceb.addError(new ConfigError(ConfigNames.Main,
                    `The defaultClientApiLevel cannot be lesser than one..`));
            }
        }
    }

    private checkOrigins()
    {
        if(Array.isArray(this.zcLoader.mainConfig.origins)) {
            this.zcLoader.mainConfig.origins.forEach(((o,i) => {
                // for javascript version
                // noinspection SuspiciousTypeOfGuard
                if(typeof o !== 'string'){
                    this.ceb.addError(new ConfigError(ConfigNames.Main,
                        `Origin: '${i}' must be a string.`));
                }
            }));
        }
    }

    private checkPanelUserMainConfig() {
        const panelUserConfig = this.zcLoader.mainConfig.panelUser;
        let hasOneUser = false;
        if (Array.isArray(panelUserConfig)) {
            for (let i = 0; i < panelUserConfig.length; i++) {
                hasOneUser = true;
                this.checkPanelUserConfig(panelUserConfig[i], new Target(`Panel UserConfig '${i}'`));
            }
        } else if (typeof panelUserConfig === 'object') {
            hasOneUser = true;
            this.checkPanelUserConfig(panelUserConfig, new Target(`Panel UserConfig`));
        }

        if (this.zcLoader.mainConfig.usePanel && !hasOneUser) {
            Logger.consoleLogConfigWarning
            (
                ConfigNames.Main,
                `The zation panel is activated but no panelUser is defined in the main config.`
            );
        }

    }

    private checkPanelUserConfig(config: PanelUserConfig, target: Target) {
        // for javascript version
        // noinspection SuspiciousTypeOfGuard
        if(typeof config.password === 'string' && config.password.length < 4) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} panel user password must be at least 4 characters long.`));
        }

        // for javascript version
        // noinspection SuspiciousTypeOfGuard
        if(typeof config.username === 'string' && config.username.length < 1) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} panel username must be at least 1 character long.`));
        }

        if (config.password === 'admin' &&
            config.username === 'admin' &&
            this.zcLoader.mainConfig.usePanel) {
            Logger.consoleLogConfigWarning
            (ConfigNames.Main, `Don't forget to change the panel access credentials in the main configuration.`);
        }

        // for javascript version
        // noinspection SuspiciousTypeOfGuard
        if(typeof config.username === 'string' && config.username !== 'admin' &&
        config.password.toLocaleUpperCase().indexOf(config.username.toLocaleLowerCase()) !== -1) {
            Logger.consoleLogConfigWarning
            (ConfigNames.Main, `Please choose a more secure password (that not contains the username).`);
        }
    }

    private checkControllers() {
        //check Controllers
        if (typeof this.zcLoader.appConfig.controllers === 'object') {
            const controller = this.zcLoader.appConfig.controllers;
            for (let identifier in controller) {
                if (controller.hasOwnProperty(identifier)) {
                    let count = 0;
                    let authControllerCount = 0;
                    Iterator.iterateCompDefinition<ControllerClass>(controller[identifier],(controllerClass,apiLevel) =>{
                        if(apiLevel !== undefined && isNaN(parseInt(apiLevel))) {
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `Controller: '${identifier}' the API level must be an integer. The value ${apiLevel} is not allowed.`));
                        }
                        const target = new Target(`Controller: '${identifier}' ${apiLevel ? `(API Level: ${apiLevel}) `: ''}`);
                        if(controllerClass.prototype instanceof AuthController){
                            this.checkAuthControllerAccess(controllerClass,target);
                            authControllerCount++;
                        }
                        this.checkController(controllerClass,target);
                        count++;
                    });
                    if(authControllerCount > 0) {
                        if(count !== authControllerCount){
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `Controller: '${identifier}' API levels cannot have mixed controller types AuthController and Controller.`));
                        }
                        if(this.authControllerIdentifier === undefined){
                            this.authControllerIdentifier = identifier;
                        }
                        if(this.authControllerIdentifier !== identifier){
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `AuthController: '${identifier}' conflicts with other AuthController: '${this.authControllerIdentifier}'.`));
                        }
                    }
                }
            }
        }

        //check controllerDefault
        if (typeof this.zcLoader.appConfig.controllerDefaults === 'object') {
            const controller = this.zcLoader.appConfig.controllerDefaults;
            this.checkControllerConfig(controller, new Target(nameof<AppConfig>(s => s.controllerDefaults)));
        }

    }

    // noinspection JSMethodCanBeStatic
    private checkAuthControllerAccess(controllerClass: ControllerClass,target: Target) {
        if (controllerClass.config.access !== nameof<ZationAccessRecord>(s => s.all)) {
            Logger.consoleLogConfigWarning
            (ConfigNames.App, `${target.toString()} It is recommended to set the access of the authController directly to 'all'.`);
        }
    }

    private checkDataboxConfigs() {
        //check Databoxes
        if (typeof this.zcLoader.appConfig.databoxes === 'object') {
            const databoxes = this.zcLoader.appConfig.databoxes;
            for (let cId in databoxes) {
                if (databoxes.hasOwnProperty(cId)) {
                    Iterator.iterateCompDefinition<DataboxClassDef>(databoxes[cId],(databoxClass, apiLevel) =>{
                        if(apiLevel !== undefined && isNaN(parseInt(apiLevel))) {
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `Databox: '${cId}' the API level must be an integer. The value ${apiLevel} is not allowed.`));
                        }
                        this.checkDatabox(databoxClass, new Target(`Databox: '${cId}' ${apiLevel ? `(API Level: ${apiLevel}) `: ''}`));
                    });
                }
            }
        }

        //check Databox defaults
        if (typeof this.zcLoader.appConfig.databoxDefaults === 'object') {
            const databox = this.zcLoader.appConfig.databoxDefaults;
            this.checkDataboxConfig(databox, new Target(nameof<AppConfig>(s => s.databoxDefaults)));
        }

    }

    // noinspection JSMethodCanBeStatic
    private checkVersionAccessConfig(cc: VersionAccessConfig, target: Target) {
        if (typeof cc.versionAccess === 'object' &&
            Object.keys(cc.versionAccess).length === 0) {
            Logger.consoleLogConfigWarning(
                ConfigNames.App,
                target.toString() + ' It is recommended that versionAccess has at least one system!'
            );
        }

    }

    private checkController(cv: ControllerClass, target: Target) {
        if(cv.prototype instanceof Controller) {
            this.checkControllerConfig(cv.config,target);
        }
        else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} is not extends the main Controller class.`));
        }
    }

    private checkControllerConfig(config: ControllerConfig,target: Target) {
        this.checkAuthAccessConfig(config, target);
        this.checkInputConfig(config,target.addPath('input'));
        this.checkVersionAccessConfig(config, target);
    }

    private checkDatabox(cdb: DataboxClassDef, target: Target) {
        if(cdb.prototype instanceof DataboxFamily || cdb.prototype instanceof Databox) {
            this.checkDataboxConfig(cdb.config,target);
        }
        else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} is not extends the main Databox or DataboxFamily class.`));
        }
    }

    private checkDataboxConfig(config: DataboxConfig, target: Target) {
        if(typeof config.maxSocketInputChannels === 'number' && config.maxSocketInputChannels <= 0){
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} the maximum socket input channels must be greater than 0.`));
        }

        this.checkAuthAccessConfig(config, target);

        this.checkInputConfig(DbConfigUtils.convertDbInitInput(config),
            target.addPath('initInput'),'Init');

        this.checkInputConfig(DbConfigUtils.convertDbFetchInput(config),
            target.addPath('fetchInput'),'Fetch');

        this.checkVersionAccessConfig(config, target);
    }

    // noinspection JSMethodCanBeStatic
    private checkInputAllAllow(inputConfig: InputConfig, target: Target,inputTypeName: string = '') {
        if (typeof inputConfig.allowAnyInput === 'boolean' &&
            inputConfig.allowAnyInput &&
            (typeof inputConfig.input === 'object')) {
            Logger.consoleLogConfigWarning(
                ConfigNames.App,
                `${target.toString()} is ignored with allowAny${inputTypeName}Input true.`
            );
        }
    }

    /**
     * Checks an input config.
     * @param inputConfig
     * @param target
     * @param inputTypeName
     * The input type starting with upper case letter.
     */
    private checkInputConfig(inputConfig: InputConfig, target: Target,inputTypeName: string = '') {
        /**
         * Check main structure with structure of controller or stream.
         */
        if(inputConfig.input){
            let input: object = inputConfig.input;
            if(isInputConfigTranslatable(input)){
                input = input[inputConfigTranslateSymbol]();
            }
            else if(isModelConfigTranslatable(input)){
                input = input[modelConfigTranslateSymbol]();
            }

            if(Array.isArray(input)){
                if(input.length === 1){
                    this.checkSingleInput(input[0],target);
                }
                else {
                    this.ceb.addError(new ConfigError(ConfigNames.App,
                        `${target.toString()} to define a single input model the array must have exactly one item.`));
                }
            }
            else if(isReusableModel(input)){
                this.checkSingleInput(input,target);
            }
            else {
                this.checkParamInput(input as ParamInput,target);
            }
        }
        this.checkInputAllAllow(inputConfig, target,inputTypeName);
    }

    private checkParamInput(paramInput: ParamInput, target: Target) {
        const keys: any[] = [];
        if (typeof paramInput === 'object') {
            for (let k in paramInput) {
                if (paramInput.hasOwnProperty(k)) {
                    if(!isNaN(parseInt(k))){
                        this.ceb.addError(new ConfigError(ConfigNames.App,
                            `${target.toString()} numeric key ${k} is not allowed in a param based input config because it changes the key order in a for in loop.`));
                    }
                    keys.push(k);
                    this.checkModel(paramInput[k], target.addPath(k));
                }
            }
            this.checkOptionalRecommendation(keys, paramInput, target);
        }
    }

    private checkSingleInput(singleInput: Model,target: Target) {
        this.checkModel(singleInput,target);
    }

    // noinspection JSMethodCanBeStatic
    private checkOptionalRecommendation(keys: string[], input: ParamInput, target: Target) {
        let wasLastOptional = false;
        for (let i = keys.length - 1; i >= 0; i--) {
            if (input[keys[i]][modelOptionalSymbol] !== undefined && input[keys[i]][modelOptionalSymbol]) {
                if ((keys.length - 1) !== i && !wasLastOptional) {
                    Logger.consoleLogConfigWarning(
                        ConfigNames.App,
                        `${target.toString()} input: '${keys[i]}', It is recommended to set the optional parameters at the first input level at the end.`
                    );
                    break;
                }
                wasLastOptional = true;
            } else {
                wasLastOptional = false;
            }
        }
    }

    private checkArrayShortCut(value, target: Target, rememberCache: Model[]) {
        if (value.length === 0) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} you have to specify an array body.`));
        } else if (value.length === 1) {
            this.checkModel(value[0], target.addPath('ArrayItem'), rememberCache);
        } else if (value.length === 2) {
            if (typeof value[1] !== 'object') {
                const targetArrayElement2 = target.setExtraInfo('Array Shortcut Element 2');
                this.ceb.addError(new ConfigError(ConfigNames.App,
                    `${targetArrayElement2.toString()} the second shortcut item should be from type object and can specify rules for the array. Given typ is: '${typeof value[1]}'`));
            } else {
                this.checkOptionalArrayWarning(value[1],target);
            }
            this.checkModel(value[0], target.addPath('ArrayItem'), rememberCache);
        } else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} invalid shortcut length: '${value.length}', 2 values are valid. First, specify the body and second to specify rules.`));
        }
    }

    /**
     * @description
     * Check model.
     * (checks also for value circle extensions)
     * @param value
     * @param target
     * @param rememberCache
     */
    private checkModel(value: Model, target: Target, rememberCache: Model[] = []) {
        value = resolveModelConfigTranslatable(value);

        if(typeof value === 'object'){
            //check circle dependencies
            if(rememberCache.includes(value)){
                this.ceb.addError(new ConfigError(ConfigNames.App,`${target.toString()} creates a circular dependency.`));
            }

            if((value as ModelCheckedMem)._checked){return;}
            Object.defineProperty(value,nameof<ModelCheckedMem>(s => s._checked),{
                value: true,
                enumerable: false,
                configurable: true,
                writable: false
            });

            const modelId = value[modelIdSymbol];
            if(modelId !== undefined){
                if(this.checkedModelIds.includes(modelId)) return;
                this.checkedModelIds.push(modelId);
            }

            if(Array.isArray(value)){
                //model array shortcut
                rememberCache.push(value);
                this.checkArrayShortCut(value, target, rememberCache);
            }
            else {
                this.checkOptionalArrayWarning(value,target);
                //check input
                if (value.hasOwnProperty(nameof<ObjectModel>(s => s.properties))) {
                    //is object model
                    rememberCache.push(value);
                    this.checkObject(value as ObjectModel, target, rememberCache);
                } else if (value.hasOwnProperty(nameof<ArrayModel>(s => s.array))) {
                    //is array model
                    rememberCache.push(value);
                    if (typeof value[nameof<ArrayModel>(s => s.array)] === 'object') {
                        const inArray = value[nameof<ArrayModel>(s => s.array)];
                        this.checkModel(inArray,target.addPath('ArrayItem'),rememberCache);
                    }
                } else if(value.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))) {
                    //is any of model modifier
                    rememberCache.push(value);
                    const anyOf = value[nameof<AnyOfModel>(s => s.anyOf)];
                    let count = 0;

                    const isArray = Array.isArray(anyOf);
                    if (typeof anyOf === 'object' || isArray) {
                        Iterator.iterateSync((key, value) => {
                            count++;
                            this.checkModel(value, target.addPath(processAnyOfKey(key,value,isArray)),[...rememberCache])
                        }, anyOf);
                    }

                    if (count < 2) {
                        this.ceb.addError(new ConfigError(ConfigNames.App,
                            `${target.toString()} anyOf model modifier must have at least two properties.`));
                    }
                }
                else {
                    //is value model
                    this.checkValueModel(value,target);
                }
            }
        }
        else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} wrong type. Use a variable which references to a model, an object to define an anonymous model or an array shortcut.`));
        }
    }

    // noinspection JSMethodCanBeStatic
    checkOptionalArrayWarning(value: object | boolean,target: Target)
    {
        if (
            target.getLastPath() === 'ArrayItem' && (
                (typeof value === 'boolean' && value) ||
                (
                    typeof value === 'object' &&
                    typeof value[modelOptionalSymbol] === 'boolean' && target[modelOptionalSymbol]
                )
            )
        )
        {
            Logger.consoleLogConfigWarning(
                ConfigNames.App,
                `${target.toString()} Optional param in an array is useless.`
            );
        }
    }

    // noinspection JSMethodCanBeStatic
    private checkOnlyValidationFunction(value: ValueModel, target: Target) {
        if(value.type !== undefined) {
            const type = Array.isArray(value.type) ? value.type: [value.type];
            const types: TypeTypes[] = [];
            for(let i = 0; i < type.length; i++) {
                if (type[i] === nameof<ValidationTypeRecord>(s => s.int) ||
                    type[i] === nameof<ValidationTypeRecord>(s => s.float) ||
                    type[i] === nameof<ValidationTypeRecord>(s => s.number))
                {
                    types.push(TypeTypes.Number);
                }
                else if(type[i] === nameof<ValidationTypeRecord>(s => s.date)) {
                    types.push(TypeTypes.Date);
                }
                else if(type[i] === nameof<ValidationTypeRecord>(s => s.base64)){
                    types.push(TypeTypes.Base64);
                }
                else if(type[i] === nameof<ValidationTypeRecord>(s => s.null) ||
                    type[i] === nameof<ValidationTypeRecord>(s => s.array) ||
                    type[i] === nameof<ValidationTypeRecord>(s => s.object))
                {
                    types.push(TypeTypes.Other);
                }
                else if(type[i] === nameof<ValidationTypeRecord>(s => s.all)) {
                    return;
                }
                else {
                    types.push(TypeTypes.String);
                }
            }

            if(ObjectUtils.hasOneOf(value, OnlyStringFunctions) && (!types.includes(TypeTypes.String) && !types.includes(TypeTypes.Base64))) {
                Logger.consoleLogConfigWarning(
                    ConfigNames.App,
                    `${target.toString()} unused validation functions (no type string or base64) -> ${ObjectUtils.findKeysOfScope(value,OnlyStringFunctions).toString()}.`
                );
            }
            if(ObjectUtils.hasOneOf(value, OnlyNumberFunctions) && !types.includes(TypeTypes.Number)) {
                Logger.consoleLogConfigWarning(
                    ConfigNames.App,
                    `${target.toString()} unused validation functions (no type number) -> ${ObjectUtils.findKeysOfScope(value,OnlyNumberFunctions).toString()}.`
                );
            }
            if(ObjectUtils.hasOneOf(value, OnlyDateFunctions) && !types.includes(TypeTypes.Date)) {
                Logger.consoleLogConfigWarning(
                    ConfigNames.App,
                    `${target.toString()} unused validation functions (no type date) -> ${ObjectUtils.findKeysOfScope(value,OnlyDateFunctions).toString()}.`
                );
            }
            if(ObjectUtils.hasOneOf(value, OnlyBase64Functions) && !types.includes(TypeTypes.Base64)) {
                Logger.consoleLogConfigWarning(
                    ConfigNames.App,
                    `${target.toString()} unused validation functions (no type base64) -> ${ObjectUtils.findKeysOfScope(value,OnlyBase64Functions).toString()}.`
                );
            }
        }
    }

    private checkValueModel(model: ValueModel, target: Target, inheritanceCheck: boolean = true)
    {
        target = target.addPath(`(${typeof model[modelNameSymbol] === 'string' ? 
            model[modelNameSymbol] : 'Anonymous'})`);

        if(inheritanceCheck){
            if(this.checkAndProcessValueModelInheritance(target,model,model)){
                target = target.setExtraInfo('Compiled with inheritance');
            }
        }

        //check all that is not depend on full config
        this.checkRegexFunction(model, target);
        this.checkCharClassFunction(model,target);
        //check for only number/string functions
        this.checkOnlyValidationFunction(model,target);
    }


    private checkAndProcessValueModelInheritance(
        target: Target,
        baseModel: ValueModel,
        model: ValueModel,
        inheritanceRemCache: Model[] = []
    ): boolean
    {
        const prototype = model[modelPrototypeSymbol];
        const prototypeType = typeof prototype;
        if(prototypeType === 'object' || prototypeType === 'function') {
            const resModel = resolveModelConfigTranslatable(prototype);

            target = target.addPath(`extends=>${typeof resModel[modelNameSymbol] === 'string' ?
                resModel[modelNameSymbol] : 'Anonymous'}`);

            if(inheritanceRemCache.includes(resModel) || resModel === baseModel){
                this.ceb.addError(new ConfigError(ConfigNames.App,`${target.toString()} creates a circular value model inheritance.`));
                return false;
            }
            inheritanceRemCache.push(resModel);

            if(!ConfigChecker.isValueModel(resModel)){
                this.ceb.addError(new ConfigError(ConfigNames.App,
                    `${target.toString()} a value model can only extend a value model.`));
                return false;
            }
            else {
                //Check only new anonymous value models.
                if(!(resModel as ModelCheckedMem)._checked){
                    this.checkValueModel(resModel,target,false);
                    Object.defineProperty(resModel,nameof<ModelCheckedMem>(s => s._checked),{
                        value: true,
                        enumerable: false,
                        configurable: true,
                        writable: false
                    });
                }

                ObjectUtils.mergeTwoObjects(baseModel,resModel,false);

                this.checkAndProcessValueModelInheritance(target,baseModel,resModel,inheritanceRemCache);
            }
            return true;
        }
        return false;
    }

    private checkCharClassFunction(value: ValueModel, target) {
       if(typeof value.charClass === 'string'){
           this.checkValidStringRegex
           (value.charClass,target.addPath(nameof<ValueModel>(s => s.charClass)),'is not a valid regex char class. Do not forget to escape special characters.');
       }
    }

    private checkRegexFunction(value: ValueModel, target: Target) {
        const regex = value.regex;
        const regexTarget = target.addPath(nameof<ValueModel>(s => s.regex));

        if (typeof regex === 'object' && !(regex instanceof RegExp)) {
            for (let regexName in regex) {
                if (regex.hasOwnProperty(regexName)) {
                    this.checkRegex(regex[regexName], regexTarget.addPath(regexName));
                }
            }
        } else if (regex !== undefined) {
            this.checkRegex(value, regexTarget);
        }
    }

    private checkRegex(value: any, target: Target) {
        if (!(typeof value === 'string' || value instanceof RegExp)) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} is not a string or an ReqExp object.`));
        }
        else if(typeof value === 'string') {
            this.checkValidStringRegex(value,target);
        }
    }

    private checkValidStringRegex(value,target: Target,error: string = 'is not a valid regex.') {
        try {
            new RegExp(value);
        } catch(e) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} ${error}`));
        }
    }

    private checkAuthAccessConfig(config: AuthAccessConfig<any>, target) {
        this.checkAccessKeyDependency(getNotableValue(config.access),target.addPath(nameof<ControllerConfig>(s => s.access)));
    }

    private checkAccessKeyDependency(value, target) {
        if (typeof value === 'string') {
            ConfigCheckerTools.assertEqualsOne
            (
                this.validAccessValues,
                value,
                ConfigNames.App,
                this.ceb,
                `user group '${value}' is not found in auth groups or is default group.`,
                target
            );
        } else if (Array.isArray(value)) {
            for(let i = 0; i < value.length; i++){
                this.checkAccessKeyDependency(value[i],target.addPath(`${i}`));
            }
        }
    }

    private checkIdentifier(identifier: string,type: string,preString: string = ''): void
    {
        if (!identifier.match(/^[a-zA-Z0-9-/_]+$/)) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${preString}'${identifier}' is not a valid ${type} identifier. Only letters, numbers, minus, underscore or slash are allowed.`));
        }
    }
}