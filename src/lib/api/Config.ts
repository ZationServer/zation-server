/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ServiceConfig} from "../main/config/definitions/main/serviceConfig";
import {AppConfig} from "../main/config/definitions/main/appConfig";
import {
    ZationChannelsConfig, CustomChannelConfig
} from "../main/config/definitions/parts/channelsConfig";
import {StarterConfig}  from "../main/config/definitions/main/starterConfig";
import {MainConfig}     from "../main/config/definitions/main/mainConfig";
import ObjectUtils      from "../main/utils/objectUtils";
import Controller, {ControllerClass} from "./Controller";
import {ApiLevelSwitch} from "../main/apiLevel/apiLevelUtils";
import ConfigBuildError from "../main/config/manager/configBuildError";
import {
    Model,
    SingleModelInput
} from "../main/config/definitions/parts/inputConfig";
// noinspection TypeScriptPreferShortImport
import {
    ControllerConfig
} from "../main/config/definitions/parts/controllerConfig";
import {DataboxClassDef}                                  from "../main/config/definitions/parts/databoxConfig";
import {createTokenCheckFunction, TokenCheckFunction}     from "../main/access/accessOptions";
import DataboxFamily                        from "./databox/DataboxFamily";
import Databox                              from "./databox/Databox";
import {Component}                          from "../main/config/definitions/parts/component";
import {ZationToken}                        from "../main/constants/internal";
import {registerBagExtension,BagExtension}  from 'zation-bag-extension';

export default class Config
{

    private static tmpModels: Record<string,Model> = {};
    private static tmpControllers: Record<string,ControllerClass | ApiLevelSwitch<ControllerClass>> = {};
    private static tmpDataboxes: Record<string,DataboxClassDef | ApiLevelSwitch<DataboxClassDef>> = {};
    private static tmpCustomChs: Record<string,CustomChannelConfig> = {};
    private static tmpZationChannels: ZationChannelsConfig[] = [];
    private static tmpAuthController: string | undefined;

    //Part main helper methods

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Merge configs together.
     * If config has name conflicts the first one will be taken.
     * @example
     * merge(appConfig1,appConfig2,appConfig3);
     * @param configs
     */
    static merge(...configs: object[]): object {
        return ObjectUtils.deepMergeObjects(...configs);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Changes the configuration of a controller.
     * Can be used for setting the configuration in the app config.
     * @example
     * buildController(LoginController,{httpAccess: false});
     * @param controller
     * The controller that should be updated.
     * @param config
     * The new configuration.
     * @param overrideControllerConfig
     * If the new configuration properties override the controller properties.
     * Default value is false.
     */
    static buildController(controller: ControllerClass,config: ControllerConfig,overrideControllerConfig: boolean = false): ControllerClass {
        ObjectUtils.mergeTwoObjects(controller.config,config,overrideControllerConfig);
        return controller;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method defines a new model in the app config.
     * Watch out that you don't use a name that is already defined in the models of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * @example
     * Config.defineModel('user',{
     *     properties: {
     *         name: {type: 'string'},
     *         age: {type: 'number'}
     *     }
     * });
     * @param name
     * @param model
     */
    static defineModel(name: string, model: Model) {
        if(!Config.tmpModels.hasOwnProperty(name)){
            Config.tmpModels[name] = model;
        }
        else {
            throw new ConfigBuildError(`The model name: ${name} is already defined.`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method defines a new custom channel in the app config.
     * Watch out that you don't use a name that is already defined in the custom channels of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * @example
     * Config.defineCustomCh('myCustomCh',{
     *    subscribeAccess: 'allAuth',
     * });
     * @param name
     * @param customCh
     */
    static defineCustomCh(name: string,customCh: CustomChannelConfig) {
        if(!Config.tmpCustomChs.hasOwnProperty(name)){
            Config.tmpCustomChs[name] = customCh;
        }
        else {
            throw new ConfigBuildError(`The custom channel: ${name} is already defined.`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Merge zation channel configs to the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * @example
     * Config.defineChannels({
     *    userCh: {
     *       clientPublishAccess: false
     *    },
     * });
     * @param config
     */
    static defineZationChannels(config: ZationChannelsConfig) {
        Config.tmpZationChannels.push(config);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method defines new models in the app config.
     * Watch out that you don't use a name that is already defined in the models of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * @example
     * Config.defineModels({
     *    user: {
     *        properties: {
     *          name: 'user_name',
     *          age: {type: 'number'}
     *        }
     *    },
     *    user_name: {
     *        type: 'string',
     *        maxLength: 10
     *    }
     * });
     * @param models
     */
    static defineModels(models: Record<string,Model>) {
        for(let name in models){
            if(models.hasOwnProperty(name)){
                Config.defineModel(name,models[name]);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method registers a new controller in the app config.
     * Watch out that you don't use a name that is already defined in the controllers of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * Also, notice that if you want to register more controllers with the same name and different API levels,
     * make sure that all register methods with that name provided an API level.
     * @example
     * //without API level
     * Config.registerController('myController',MyController);
     * //with API level
     * Config.registerController('myController2',MyController2Version1,1);
     * Config.registerController('myController2',MyController2Version2,2);
     * @param name
     * @param controllerClass
     * @param apiLevel
     */
    static registerController(name: string, controllerClass: ControllerClass, apiLevel?: number) {
        Config.registerComponent(name,controllerClass,apiLevel);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method registers a new Databox or DataboxFamily in the app config.
     * Watch out that you don't use a name that is already defined in the Databoxes of the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * Also, notice that if you want to register more Databoxes with the same name and different API levels,
     * make sure that all register methods with that name provided an API level.
     * @example
     * //without API level
     * Config.registerDatabox('myDatabox',MyDatabox);
     * //with API level
     * Config.registerDatabox('myDatabox2',MyDatabox2Version1,1);
     * Config.registerDatabox('myDatabox2',MyDatabox2Version2,2);
     * @param name
     * @param databoxClass
     * @param apiLevel
     */
    static registerDatabox(name: string, databoxClass: DataboxClassDef, apiLevel?: number) {
        Config.registerComponent(name,databoxClass,apiLevel);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * This method registers a new component (Controller or Databox) in the app config.
     * Watch out that you don't use a name that is already defined in the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * Also, notice that if you want to register more components with the same name and different API levels,
     * make sure that all register methods with that name provided an API level.
     * @example
     * //without API level
     * Config.registerComponent('myDatabox',MyDatabox);
     * //with API level
     * Config.registerComponent('myController',MyControllerVersion1,1);
     * Config.registerComponent('myController',MyControllerVersion2,2);
     * @param name
     * @param componentClass
     * @param apiLevel
     */
    static registerComponent(name: string, componentClass: Component, apiLevel?: number)
    {
        let type;
        let pName;
        let container;

        if(componentClass.prototype instanceof Controller){
            type = 'controller';
            pName = 'controllers';
            container = this.tmpControllers;
        }
        else if(componentClass.prototype instanceof  DataboxFamily || componentClass.prototype instanceof Databox){
            type = 'databox';
            pName = 'databoxes';
            container = this.tmpDataboxes;
        }
        else {
            throw new ConfigBuildError(`Register component can only register classes that extend the Databox, DataboxFamily, or Controller class.`);
        }

        if(typeof apiLevel === 'number'){
            if(typeof container[name] === 'function'){
                throw new ConfigBuildError(`The ${type} name: ${name} is already defined.`+
                    ` To define more ${pName} with the same name every register should provide an API level.`);
            }
            else {
                if(!container.hasOwnProperty(name)){
                    container[name] = {};
                }

                if(container[name].hasOwnProperty(apiLevel)){
                    throw new ConfigBuildError(`The ${type} name: ${name} with the API level ${apiLevel} is already defined.`);
                }
                else {
                    container[name][apiLevel] = componentClass;
                }
            }
        }
        else {
            if(container.hasOwnProperty(name)){
                throw new ConfigBuildError(`The ${type} name: ${name} is already defined.`+
                    ` To define more ${pName} with the same name every register should provide an API level.`);
            }
            else {
                container[name] = componentClass;
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Registers a BagExtension.
     * @param extension
     */
    static registerBagExtension(extension: BagExtension) {
        registerBagExtension(extension);
    }

    static single(model: Model): SingleModelInput {
        return [model];
    }

    /**
     * With this function, you can set the auth controller.
     * Notice that you can set only one auth controller.
     * @param name
     */
    static setAuthController(name: string) {
        if(this.tmpAuthController !== undefined && name !== this.tmpAuthController){
            throw new ConfigBuildError(`The authController: '${this.tmpAuthController}' is already set, you can not override it.`);
        }
        else {
            this.tmpAuthController = name;
        }
    }

    //Part main configs
    // noinspection JSUnusedGlobalSymbols
    /**
     * Function to create the app configuration for the server.
     * @param config
     * @param isPrimaryAppConfig
     * Indicates if this is your primary app config.
     * If you have more app configs and you want to merge
     * them than only one of them should be the primary app config.
     */
    static appConfig(config: AppConfig,isPrimaryAppConfig: boolean = true): AppConfig {
        if(isPrimaryAppConfig){
            config.models = config.models || {};
            config.controllers = config.controllers || {};
            config.databoxes = config.databoxes || {};
            config.customChannels = config.customChannels || {};
            config.zationChannels = config.zationChannels || {};

            Config.configAdd(Config.tmpModels,config.models,'model name');
            Config.configAdd(Config.tmpControllers,config.controllers,'controller name');
            Config.configAdd(Config.tmpDataboxes,config.databoxes,'databox name');
            Config.configAdd(Config.tmpCustomChs,config.customChannels as object,'custom channel');
            Config.merge(config.zationChannels,...Config.tmpZationChannels);

            if(this.tmpAuthController !== undefined){
                if(config.authController !== undefined){
                    throw new ConfigBuildError(
                        `Conflict with the auth controller, the authController is defined in the app config and the config utils.`);
                }
                else {
                    config.authController = this.tmpAuthController;
                }
            }
        }
        return config;
    }

    private static configAdd(tmpConfig: object,config: object,target: string)
    {
        for(let name in tmpConfig){
            if(tmpConfig.hasOwnProperty(name)){
                if(config.hasOwnProperty(name)){
                    throw new ConfigBuildError
                    (`Conflict with ${target}: ${name}, the ${target} is defined in the app config and with the config utils.`);
                }
                else {
                    config[name] = tmpConfig[name];
                }
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    static mainConfig(config: MainConfig): MainConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static starterConfig(config: StarterConfig): StarterConfig {return config;}
    // noinspection JSUnusedGlobalSymbols
    static serviceConfig(config: ServiceConfig): ServiceConfig {return config;}

    //Advanced utils

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates a token check function.
     * It can be used for more advanced use cases.
     * With the token check-function, you can check the access with the token of a client.
     * You can use it in the access check properties,
     * for example, in the controller, databox, or custom channel config.
     * @example
     * access: Config.createTokenCheckFunction((token) => token !== null)
     * @param checkFunction
     */
    static createTokenCheckFunction(checkFunction: (token: ZationToken | null) => boolean): TokenCheckFunction {
        return createTokenCheckFunction(checkFunction);
    }

}

export const $single = Config.single;