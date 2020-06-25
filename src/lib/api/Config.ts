/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ServiceConfig} from "../main/config/definitions/main/serviceConfig";
import {AppConfig}     from "../main/config/definitions/main/appConfig";
import {StarterConfig}  from "../main/config/definitions/main/starterConfig";
import {MainConfig}     from "../main/config/definitions/main/mainConfig";
import ObjectUtils      from "../main/utils/objectUtils";
import Controller, {ControllerClass} from "./Controller";
import {ApiLevelSwitch} from "../main/apiLevel/apiLevelUtils";
import ConfigBuildError from "../main/config/manager/configBuildError";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {
    ControllerConfig
} from "../main/config/definitions/parts/controllerConfig";
import {createTokenCheckFunction, TokenCheckFunction}     from "../main/access/accessOptions";
import DataboxFamily                        from "./databox/DataboxFamily";
import Databox                              from "./databox/Databox";
import {RawZationToken}                     from "../main/definitions/internal";
import {registerBagExtension,BagExtension}  from 'zation-bag-extension';
import {ComponentClass}                     from './component/Component';
import {AnyDataboxClass}                    from './databox/AnyDataboxClass';
import {AnyChannelClass}                    from './channel/AnyChannelClass';
import ChannelFamily                        from './channel/ChannelFamily';
import Channel                              from './channel/Channel';
import Receiver, {ReceiverClass}            from './Receiver';

export default class Config
{
    private static tmpControllers: Record<string,ControllerClass | ApiLevelSwitch<ControllerClass>> = {};
    private static tmpReceivers: Record<string,ReceiverClass | ApiLevelSwitch<ReceiverClass>> = {};
    private static tmpDataboxes: Record<string,AnyDataboxClass | ApiLevelSwitch<AnyDataboxClass>> = {};
    private static tmpChannels: Record<string,AnyChannelClass | ApiLevelSwitch<AnyChannelClass>> = {};

    //Part main helper methods

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Merge configs together.
     * If config has key conflicts the first one will be taken.
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
     * buildController(LoginController,{access: false});
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
     * This method registers a new component (Controller, Databox or Channel) in the app config.
     * Watch out that you don't use an identifier that is already defined in the app config.
     * If you use this method in another file as the app config,
     * make sure that you import this file in app config.
     * Also, notice that if you want to register more components with the same identifier and different API levels,
     * make sure that all register methods with that identifier provided an API level.
     * @example
     * //without API level
     * Config.registerComponent('myDatabox',MyDatabox);
     * //with API level
     * Config.registerComponent('myController',MyControllerVersion1,1);
     * Config.registerComponent('myController',MyControllerVersion2,2);
     * @param identifier
     * @param componentClass
     * @param apiLevel
     */
    static registerComponent(identifier: string, componentClass: ComponentClass, apiLevel?: number)
    {
        let type;
        let pType;
        let container;

        if(componentClass.prototype instanceof Controller){
            type = 'controller';
            pType = 'controllers';
            container = this.tmpControllers;
        }
        else if(componentClass.prototype instanceof Receiver){
            type = 'receiver';
            pType = 'receivers';
            container = this.tmpReceivers;
        }
        else if(componentClass.prototype instanceof DataboxFamily || componentClass.prototype instanceof Databox){
            type = 'databox';
            pType = 'databoxes';
            container = this.tmpDataboxes;
        }
        else if(componentClass.prototype instanceof ChannelFamily || componentClass.prototype instanceof Channel){
            type = 'channel';
            pType = 'channels';
            container = this.tmpChannels;
        }
        else {
            throw new ConfigBuildError(`Register component can only register classes that extend the Controller, Receiver, Databox, DataboxFamily, Channel or ChannelFamily class.`);
        }

        if(typeof apiLevel === 'number'){
            if(typeof container[identifier] === 'function'){
                throw new ConfigBuildError(`A ${type} with identifier: ${identifier} is already defined.`+
                    ` To define more ${pType} with the same identifier every register should provide an API level.`);
            }
            else {
                if(!container.hasOwnProperty(identifier)){
                    container[identifier] = {};
                }

                if(container[identifier].hasOwnProperty(apiLevel)){
                    throw new ConfigBuildError(`A ${type} with identifier: ${identifier} with the API level ${apiLevel} is already defined.`);
                }
                else {
                    container[identifier][apiLevel] = componentClass;
                }
            }
        }
        else {
            if(container.hasOwnProperty(identifier)){
                throw new ConfigBuildError(`A ${type} with identifier: ${identifier} is already defined.`+
                    ` To define more ${pType} with the same identifier every register should provide an API level.`);
            }
            else {
                container[identifier] = componentClass;
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
            config.controllers = config.controllers || {};
            config.receivers = config.receivers || {};
            config.databoxes = config.databoxes || {};
            config.channels = config.channels || {};

            Config.configAdd(Config.tmpControllers,config.controllers,'controller identifier');
            Config.configAdd(Config.tmpReceivers,config.receivers,'receiver identifier');
            Config.configAdd(Config.tmpDataboxes,config.databoxes,'databox identifier');
            Config.configAdd(Config.tmpChannels,config.channels,'channel identifier');
        }
        return config;
    }

    private static configAdd(tmpConfig: object,config: object,target: string)
    {
        for(const key in tmpConfig){
            if(tmpConfig.hasOwnProperty(key)){
                if(config.hasOwnProperty(key)){
                    throw new ConfigBuildError
                    (`Conflict with ${target}: ${key}, the ${target} is defined in the app config and with the config utils.`);
                }
                else {
                    config[key] = tmpConfig[key];
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
    static createTokenCheckFunction(checkFunction: (token: RawZationToken | null) => boolean): TokenCheckFunction {
        return createTokenCheckFunction(checkFunction);
    }

}