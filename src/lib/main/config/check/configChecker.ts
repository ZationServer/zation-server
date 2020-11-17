/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ConfigNames, DEFAULT_USER_GROUP_FALLBACK}     from '../../definitions/internal';
import {AppConfig}                                    from '../definitions/main/appConfig';
import {PanelUserConfig}                              from '../definitions/main/mainConfig';
// noinspection TypeScriptPreferShortImport
import {OnlyBase64Functions, OnlyDateFunctions, OnlyNumberFunctions, OnlyStringFunctions, TypeTypes} from '../../models/validator/validationFunctions';
import ConfigCheckerTools                    from './configCheckerTools';
import ConfigError                           from '../../error/configError';
import Target                                from './target';
import Logger                                from '../../log/logger';
import * as ObjectPath                       from 'object-path';
import Controller, {ControllerClass}         from '../../../api/Controller';
import {ValidationTypeRecord}                from '../../models/validator/validationType';
import Iterator                              from '../../utils/iterator';
import ObjectUtils                           from '../../utils/objectUtils';
import ConfigLoader                          from '../manager/configLoader';
import {resolveIfModelTranslatable}          from '../../../api/configTranslatable/modelTranslatable';
import {modelPrototypeSymbol}                from '../../models/modelPrototype';
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig}               from '../definitions/parts/controllerConfig';
// noinspection ES6PreferShortImport
import {DataboxConfig}                  from '../definitions/parts/databoxConfig';
import DataboxFamily                    from '../../../api/databox/DataboxFamily';
import Databox                          from '../../../api/databox/Databox';
import {AccessConfig}                   from '../definitions/parts/accessConfigs';
import {getNotValue, isNot}             from '../../../api/Not';
import ErrorBag                                from '../../error/errorBag';
import {processAnyOfKey}                                       from '../../models/anyOfModelUtils';
import AuthController                                          from '../../../api/AuthController';
import {AnyDataboxClass}                                       from '../../../api/databox/AnyDataboxClass';
import {AnyChannelClass}                                       from '../../../api/channel/AnyChannelClass';
// noinspection ES6PreferShortImport
import {ChannelConfig}                                         from '../definitions/parts/channelConfig';
import Channel                                                 from '../../../api/channel/Channel';
import ChannelFamily                                           from '../../../api/channel/ChannelFamily';
import {ComponentClass}                                        from '../../../api/component/Component';
import Receiver, {ReceiverClass}                               from '../../../api/Receiver';
// noinspection ES6PreferShortImport
import {ReceiverConfig}                                        from '../definitions/parts/receiverConfig';
import ComponentUtils                                          from '../../component/componentUtils';
import {isDefaultImpl}                                         from '../../utils/defaultImplUtils';
import {isOptionalMetaModel, unwrapIfMetaModel}                from '../../models/metaModel';
import {AnyOfModel, DefinitionModel, ObjectModel, ValueModel}  from '../../models/definitionModel';
import {getModelName}                                          from '../../models/modelName';
import {Input}                                                 from '../definitions/parts/inputConfig';
import {Model}                                                 from '../../models/model';
import {AccessKeywordRecord}                                   from '../../access/accessOptions';

export interface ModelCheckedMem {
    _checked: boolean
}

export default class ConfigChecker
{
    private readonly zcLoader: ConfigLoader;
    private ceb: ErrorBag<ConfigError>;

    private authControllerIdentifier: string;
    private validAccessValues: any[];

    private components: ComponentClass[] = [];

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
        const extraKeys: any = [
            nameof<AccessKeywordRecord>(s => s.all),
            nameof<AccessKeywordRecord>(s => s.allNotAuth),
            nameof<AccessKeywordRecord>(s => s.allAuth)
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
        this.checkReceivers();
        this.checkDataboxes();
        this.checkChannels();
    }

    private checkComponentIsNotRegistered(component: ComponentClass,target: Target) {
        if(this.components.includes(component)) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()
            } is already used in the configuration with another identifier or API level. All zation components are singletons.`));
        }
        else {
            this.components.push(component);
        }
    }

    private checkChannels() {
        //check Databoxes
        if (typeof this.zcLoader.appConfig.channels === 'object') {
            const channels = this.zcLoader.appConfig.channels;
            for (let identifier in channels) {
                if (channels.hasOwnProperty(identifier)) {
                    let nonFamilyCount = 0;
                    let familyCount = 0;

                    this.checkIdentifier(identifier,'Channel');

                    Iterator.iterateCompDefinition<AnyChannelClass>(channels[identifier],(channelClass, apiLevel) =>{
                        if(apiLevel !== undefined && !Number.isInteger(parseFloat(apiLevel))) {
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `Channel: '${identifier}' the API level must be an integer. The value ${apiLevel} is not allowed.`));
                        }
                        const chTarget = new Target(`Channel: '${identifier}' ${apiLevel ? `(API Level: ${apiLevel}) `: ''}`);
                        this.checkChannel(channelClass,chTarget);
                        this.checkComponentIsNotRegistered(channelClass,chTarget);
                        ComponentUtils.isFamily(channelClass) ? (familyCount++) : (nonFamilyCount++);
                    });

                    if(Math.min(nonFamilyCount,familyCount) !== 0){
                        this.ceb.addError(new ConfigError(ConfigNames.App,
                            `Channel: '${identifier}' API levels: family components can not be mixed with non-family components.`));
                    }
                }
            }
        }
        //check defaults
        if (typeof this.zcLoader.appConfig.channelDefaults === 'object') {
            const channel = this.zcLoader.appConfig.channelDefaults;
            this.checkChannelConfig(channel, new Target(nameof<AppConfig>(s => s.channelDefaults)));
        }
    }

    private checkChannel(cCh: AnyChannelClass, target: Target) {
        // noinspection SuspiciousTypeOfGuard
        if(cCh.prototype instanceof Channel || cCh.prototype instanceof ChannelFamily) {
            if(cCh.config)
                this.checkChannelConfig(cCh.config,target);
        }
        else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} is not extends the main Channel or ChannelFamily class.`));
        }
    }

    private checkChannelConfig(config: ChannelConfig, target: Target) {
        this.checkAccessConfig(config, target);
    }

    private checkAccessControllerDefaultIsSet() {
        const accessValue = getNotValue(ObjectPath.get(this.zcLoader.appConfig,
            [nameof<AppConfig>(s => s.controllerDefaults), nameof<ControllerConfig>(s => s.access)]));
        if (accessValue === undefined) {
            Logger.consoleLogConfigWarning(ConfigNames.App, 'It is recommended to set a controller default value for access or notAccess.');
        }
    }

    private checkObjectModel(obj: ObjectModel, target: Target, rememberCache: DefinitionModel[], inheritanceCheck: boolean = true, skipTargetPathAdd: boolean = false, skipProps: string[] = []) {
        const modelName = getModelName(obj);
        if(!skipTargetPathAdd && typeof modelName === 'string'){
            target = target.addPath(`(${modelName})`);
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
            obj[nameof<AnyOfModel>(s => s.anyOf)] === undefined;
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
                                   rememberCache: DefinitionModel[],
                                   inheritanceRemCache: DefinitionModel[] = [],
                                   propsOverwritten: string[] = []
    ): void
    {
        const prototype = model[modelPrototypeSymbol];
        const prototypeType = typeof prototype;
        if(prototypeType === 'object' || prototypeType === 'function') {
            const resModel = resolveIfModelTranslatable(prototype);

            const resModelName = getModelName(resModel);
            target = target.addPath(`extends=>${typeof resModelName === 'string' ? 
                resModelName : 'Anonymous'}`);

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
                    this.checkObjectModel(resModel as ObjectModel,target,rememberCache,false,true,propsOverwritten);
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
        const panelOptions = this.zcLoader.mainConfig.panel;
        const panelUserConfig = panelOptions.user;
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

        if (panelOptions.active && !hasOneUser && this.zcLoader.appConfig.middleware?.panelAuth == null) {
            Logger.consoleLogConfigWarning
            (
                [ConfigNames.Main,ConfigNames.App],
                `The zation panel is activated, but no panel user is defined in the main config, and no panel auth middleware is set.`
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
            this.zcLoader.mainConfig.panel.active) {
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
                    this.checkIdentifier(identifier,'Controller');

                    let count = 0;
                    let authControllerCount = 0;
                    Iterator.iterateCompDefinition<ControllerClass>(controller[identifier],(controllerClass,apiLevel) =>{
                        if(apiLevel !== undefined && !Number.isInteger(parseFloat(apiLevel))) {
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `Controller: '${identifier}' the API level must be an integer. The value ${apiLevel} is not allowed.`));
                        }
                        const target = new Target(`Controller: '${identifier}' ${apiLevel ? `(API Level: ${apiLevel}) `: ''}`);
                        // noinspection SuspiciousTypeOfGuard
                        if(controllerClass.prototype instanceof AuthController){
                            this.checkAuthControllerAccess(controllerClass,target);
                            authControllerCount++;
                        }
                        this.checkController(controllerClass,target);
                        this.checkComponentIsNotRegistered(controllerClass,target);
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
        if (controllerClass.config.access !== nameof<AccessKeywordRecord>(s => s.all)) {
            Logger.consoleLogConfigWarning
            (ConfigNames.App, `${target.toString()} It is recommended to set the access of the authController directly to 'all'.`);
        }
    }

    private checkController(cv: ControllerClass, target: Target) {
        // noinspection SuspiciousTypeOfGuard
        if(cv.prototype instanceof Controller) {
            if(cv.config)
                this.checkControllerConfig(cv.config,target);
        }
        else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} is not extends the main Controller class.`));
        }
    }

    private checkControllerConfig(config: ControllerConfig,target: Target) {
        this.checkAccessConfig(config, target);
        this.checkInput(config.input,target.addPath('input'));
    }

    private checkReceivers() {
        //check Receivers
        if (typeof this.zcLoader.appConfig.receivers === 'object') {
            const receivers = this.zcLoader.appConfig.receivers;
            for (let identifier in receivers) {
                if (receivers.hasOwnProperty(identifier)) {
                    this.checkIdentifier(identifier,'Receiver');

                    Iterator.iterateCompDefinition<ReceiverClass>(receivers[identifier],(receiverClass, apiLevel) =>{
                        if(apiLevel !== undefined && !Number.isInteger(parseFloat(apiLevel))) {
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `Receiver: '${identifier}' the API level must be an integer. The value ${apiLevel} is not allowed.`));
                        }
                        const reTarget = new Target(`Receiver: '${identifier}' ${apiLevel ? `(API Level: ${apiLevel}) `: ''}`);
                        this.checkReceiver(receiverClass,reTarget);
                        this.checkComponentIsNotRegistered(receiverClass,reTarget);
                    });
                }
            }
        }

        //check Receiver Defaults
        if (typeof this.zcLoader.appConfig.receiverDefaults === 'object') {
            const receiverDefaults = this.zcLoader.appConfig.receiverDefaults;
            this.checkReceiverConfig(receiverDefaults, new Target(nameof<AppConfig>(s => s.receiverDefaults)));
        }
    }

    private checkReceiver(cv: ReceiverClass, target: Target) {
        // noinspection SuspiciousTypeOfGuard
        if(cv.prototype instanceof Receiver) {
            if(cv.config)
                this.checkReceiverConfig(cv.config,target);
        }
        else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} is not extends the main Receiver class.`));
        }
    }

    private checkReceiverConfig(config: ReceiverConfig,target: Target) {
        this.checkAccessConfig(config, target);
        this.checkInput(config.input,target.addPath('input'));
    }

    private checkDataboxes() {
        //check Databoxes
        if (typeof this.zcLoader.appConfig.databoxes === 'object') {
            const databoxes = this.zcLoader.appConfig.databoxes;
            for (let identifier in databoxes) {
                if (databoxes.hasOwnProperty(identifier)) {
                    let nonFamilyCount = 0;
                    let familyCount = 0;

                    this.checkIdentifier(identifier,'Databox');

                    Iterator.iterateCompDefinition<AnyDataboxClass>(databoxes[identifier],(databoxClass, apiLevel) =>{
                        if(apiLevel !== undefined && !Number.isInteger(parseFloat(apiLevel))) {
                            this.ceb.addError(new ConfigError(ConfigNames.App,
                                `Databox: '${identifier}' the API level must be an integer. The value ${apiLevel} is not allowed.`));
                        }
                        const dbTarget = new Target(`Databox: '${identifier}' ${apiLevel ? `(API Level: ${apiLevel}) `: ''}`);
                        this.checkDatabox(databoxClass,dbTarget);
                        this.checkComponentIsNotRegistered(databoxClass,dbTarget);
                        ComponentUtils.isFamily(databoxClass) ? (familyCount++) : (nonFamilyCount++);
                    });

                    if(Math.min(nonFamilyCount,familyCount) !== 0){
                        this.ceb.addError(new ConfigError(ConfigNames.App,
                            `Databox: '${identifier}' API levels: family components can not be mixed with non-family components.`));
                    }
                }
            }
        }

        //check Databox defaults
        if (typeof this.zcLoader.appConfig.databoxDefaults === 'object') {
            const databox = this.zcLoader.appConfig.databoxDefaults;
            this.checkDataboxConfig(databox, new Target(nameof<AppConfig>(s => s.databoxDefaults)));
        }
    }

    private checkDatabox(cdb: AnyDataboxClass, target: Target) {
        // noinspection SuspiciousTypeOfGuard
        if(cdb.prototype instanceof DataboxFamily || cdb.prototype instanceof Databox) {
            if(cdb.config)
                this.checkDataboxConfig(cdb.config,target);

            if(!isDefaultImpl(cdb.prototype['fetch']) && !isDefaultImpl(cdb.prototype['singleFetch'])){
                this.ceb.addError(new ConfigError(ConfigNames.App,
                    `${target.toString()} only one of fetch and singleFetch can be overridden.`));
            }
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

        this.checkAccessConfig(config, target);

        this.checkInput(config.initInput, target.addPath('initInput'));
        this.checkInput(config.fetchInput, target.addPath('fetchInput'));
    }

    /**
     * Checks an input definition.
     * @param input
     * @param target
     */
    private checkInput(input: Input | undefined, target: Target) {
        if(typeof input === 'object' || typeof input === 'function') this.checkModel(input,target);
    }

    private checkArrayModel(value, target: Target, rememberCache: DefinitionModel[]) {
        if (value.length === 0) {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} you have to specify an array body.`));
        } else if (value.length <= 2) {
            if (value.length === 2 && typeof value[1] !== 'object') {
                const targetArrayElement2 = target.setExtraInfo('ArraySettings');
                this.ceb.addError(new ConfigError(ConfigNames.App,
                    `${targetArrayElement2.toString()} the second element should be from type object and can specify settings for the array model. Given typ is: '${typeof value[1]}'`));
            }
            if(isOptionalMetaModel(resolveIfModelTranslatable(value[0]))) {
                Logger.consoleLogConfigWarning(
                    ConfigNames.App,
                    `${target.addPath('ArrayItem').toString()} An optional model in an array is useless.`
                );
            }
            this.checkModel(value[0], target.addPath('ArrayItem'), rememberCache);
        } else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} invalid array model length: '${value.length}', 2 values are valid. First, specify the body and second to specify settings.`));
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
    private checkModel(value: Model, target: Target, rememberCache: DefinitionModel[] = []) {
        value = unwrapIfMetaModel(resolveIfModelTranslatable(value));

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

            if(Array.isArray(value)){
                //array model
                rememberCache.push(value);
                this.checkArrayModel(value, target, rememberCache);
            }
            else {
                //check input
                if (value.hasOwnProperty(nameof<ObjectModel>(s => s.properties))) {
                    //is object model
                    rememberCache.push(value);
                    this.checkObjectModel(value as ObjectModel, target, rememberCache);
                }  else if(value.hasOwnProperty(nameof<AnyOfModel>(s => s.anyOf))) {
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
                    this.checkValueModel(value as ValueModel,target);
                }
            }
        }
        else {
            this.ceb.addError(new ConfigError(ConfigNames.App,
                `${target.toString()} wrong type. An object was expected that represents an explicit or implicit model.`));
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
        const modelName = getModelName(model);
        target = target.addPath(`(${typeof modelName === 'string' ? modelName : 'Anonymous'})`);

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
        inheritanceRemCache: DefinitionModel[] = []
    ): boolean
    {
        const prototype = model[modelPrototypeSymbol];
        const prototypeType = typeof prototype;
        if(prototypeType === 'object' || prototypeType === 'function') {
            const resModel = unwrapIfMetaModel(resolveIfModelTranslatable(prototype));

            const resModelName = getModelName(resModel);
            target = target.addPath(`extends=>${typeof resModelName === 'string' ? resModelName : 'Anonymous'}`);

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

    private checkAccessConfig(config: AccessConfig<any>, target) {
        this.checkAccessKeyDependency(getNotValue(config.access),target.addPath(nameof<ControllerConfig>(s => s.access)));
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
        else if(isNot(value)) {
            this.checkAccessKeyDependency(getNotValue(value),target.addPath(`not`));
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