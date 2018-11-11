/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig      = require("../../main/zationConfig");
import ObjectTools       = require('../tools/objectTools');
import {
    ChannelConfig,
    ChannelDefault,
    ChannelSettings,
    CustomChannelConfig
} from "../configs/channelConfig";
import {ArrayPropertyConfig, ControllerConfig, ObjectPropertyConfig} from "../configs/appConfig";
import PropertyImportEngine = require("./propertyImportEngine");

class ConfigPeCompiler
{
    private readonly zc : ZationConfig;

    private controllerDefaults : object;

    private objectsConfig : object;
    private valuesConfig : object;
    private arraysConfig : object;

    private propertyImportEngine : PropertyImportEngine;
    
    constructor(zationConfig)
    {
        this.zc = zationConfig;
        this.prepare();
    }

    preCompile() : void
    {
        this.preCompileArrays(this.arraysConfig);
        this.preCompileObjects(this.objectsConfig);
        this.preCompileTmpBuilds();
        this.preCompileController();
        this.preCompileChannelConfig();
        this.preCompileErrorConfig();

        //view precompiled app config
        console.dir(this.zc.appConfig,{depth:null});
        console.dir(this.zc.channelConfig,{depth:null});
    }

    private prepare() : void
    {
        this.prepareControllerDefaults();
        this.prepareObjectsConfig();
        this.prepareValuesConfig();
        this.prepareArraysConfig();

        this.propertyImportEngine =
            new PropertyImportEngine(this.objectsConfig,this.valuesConfig,this.arraysConfig);
    }

    private prepareControllerDefaults() : void
    {
        this.controllerDefaults = {};

        let cd = this.zc.appConfig.controllerDefaults;

        //setDefaults if not set!
        if(cd !== undefined) {
            this.controllerDefaults = cd;
        }
    }

    private preCompileChannelConfig() : void
    {
        const channelConfig = this.zc.channelConfig;

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

    private preCompileErrorConfig() : void
    {
        if(typeof this.zc.errorConfig === 'object')
        {
            const errors = this.zc.errorConfig;
            for(let k in errors)
            {
                if(errors.hasOwnProperty(k) && errors[k].name === undefined) {
                    errors[k].name= k;
                }
            }
        }
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

    private prepareObjectsConfig() : void {
        this.objectsConfig = typeof this.zc.appConfig.objects === 'object' ?
            this.zc.appConfig.objects : {};
    }

    private prepareValuesConfig() : void {
        this.valuesConfig = typeof this.zc.appConfig.values === 'object' ?
            this.zc.appConfig.values : {};
    }

    private prepareArraysConfig() : void {
        this.arraysConfig = typeof this.zc.appConfig.arrays === 'object' ?
            this.zc.appConfig.arrays : {};
    }

    private preCompileObjects(objects : object) : void
    {
        //than resolve the links and short syntax
        for(let objName in objects) {
            if(objects.hasOwnProperty(objName)) {
                this.preCompileObjectResolveExtras(objects[objName]);
            }
        }

        //than resolve the objects inheritance
        for(let objName in objects) {
            if(objects.hasOwnProperty(objName)) {
                this.preCompileInheritance(objects[objName]);
            }
        }
    }

    private preCompileArrays(arrays : object) : void
    {
        //first pre compile the array short syntax on main level
        //to get references for fix import issues array
        for(let arrayName in arrays) {
            if(arrays.hasOwnProperty(arrayName)) {
                this.preCompileArrayShortSynatx(arrayName,arrays)
            }
        }

        //than resolve the links and short array syntax
        for(let arrayName in arrays) {
            if(arrays.hasOwnProperty(arrayName)) {
               this.preCompileResolveExtras(arrayName,arrays)
            }
        }
    }

    private preCompileTmpBuilds() : void {
        this.preCompileArrays(this.propertyImportEngine.tmpCreatedArrays);
        this.preCompileObjects(this.propertyImportEngine.tmpCreatedObjects);
    }

    private preCompileObjectResolveExtras(obj : ObjectPropertyConfig) : void
    {
        const properties = obj.properties;
        for(let propName in properties) {
            if (properties.hasOwnProperty(propName)) {
                this.preCompileResolveExtras(propName,properties);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    private preCompileArrayShortSynatx(key : string,obj : object) : void
    {
        const nowValue = obj[key];
        if(Array.isArray(nowValue))
        {
            const inArray = nowValue[0];
            let arrayExtras = {};

            if(nowValue.length === 2 && typeof nowValue[1] === 'object') {
                arrayExtras = nowValue[1];
            }

            obj[key] = {};
            ObjectTools.addObToOb(obj[key],arrayExtras);
            obj[key][nameof<ArrayPropertyConfig>(s => s.array)] = inArray;
        }
    }

    private preCompileResolveExtras(key : string, obj : object) : void
    {
        const nowValue = obj[key];

        if(typeof nowValue === 'string')
        {
            //resolve object import
            obj[key] = this.propertyImportEngine.resolve(nowValue);
        }
        else if(Array.isArray(nowValue))
        {
            let inArray = {};
            let needArrayPreCompile = false;

            if(typeof nowValue[0] === 'string') {
                inArray = this.propertyImportEngine.resolve(nowValue[0]);
            }
            else if(typeof nowValue[0] === 'object' || Array.isArray(nowValue[0])) {
                inArray = nowValue[0];
                needArrayPreCompile = true;
            }

            let arrayExtras = {};
            if(nowValue.length === 2 && typeof nowValue[1] === 'object') {
                arrayExtras = nowValue[1];
            }

            obj[key] = {};
            ObjectTools.addObToOb(obj[key],arrayExtras);
            obj[key][nameof<ArrayPropertyConfig>(s => s.array)] = inArray;

            if(needArrayPreCompile) {
                this.preCompileResolveExtras(nameof<ArrayPropertyConfig>(s => s.array),obj[key]);
            }
        }
        else if(typeof nowValue === "object")
        {
            if(nowValue.hasOwnProperty(nameof<ObjectPropertyConfig>(s => s.properties))) {
                //isObject
                //check all properties of object!
                this.preCompileObjectResolveExtras(nowValue);
            }
            else if(nowValue.hasOwnProperty(nameof<ArrayPropertyConfig>(s => s.array))) {
                //we have array look in the array body!
                this.preCompileResolveExtras(nameof<ArrayPropertyConfig>(s => s.array),nowValue);
            }
        }
    }

    private preCompileInheritance(value : any) : void
    {
        if(typeof value === "object")
        {
            //check input
            if(value.hasOwnProperty(nameof<ObjectPropertyConfig>(s => s.properties)))
            {
                //isObject
                if(typeof value[nameof<ObjectPropertyConfig>(s => s.extends)] === 'string')
                {
                    //extends there
                    //check super extends before this
                    const superName = value[nameof<ObjectPropertyConfig>(s => s.extends)];
                    this.preCompileInheritance(this.objectsConfig[superName]);

                    //lastExtend

                    const superObj = this.objectsConfig[superName];

                    //extend Props
                    const superProps = superObj[nameof<ObjectPropertyConfig>(s => s.properties)];
                    ObjectTools.addObToOb(value[nameof<ObjectPropertyConfig>(s => s.properties)],superProps,false);

                    //check for prototype
                    const superPrototype = superObj[nameof<ObjectPropertyConfig>(s => s.prototype)];
                    if(superPrototype){
                        if(!value[nameof<ObjectPropertyConfig>(s => s.prototype)]){
                            value[nameof<ObjectPropertyConfig>(s => s.prototype)] = {};
                        }
                        Object.setPrototypeOf(value[nameof<ObjectPropertyConfig>(s => s.prototype)],superPrototype);
                    }

                    //extend construct
                    const superConstruct =
                        typeof superObj[nameof<ObjectPropertyConfig>(s => s.construct)] === 'function' ?
                        superObj[nameof<ObjectPropertyConfig>(s => s.construct)] :
                        async () => {};
                    const currentConstruct = value[nameof<ObjectPropertyConfig>(s => s.construct)];
                    if(typeof currentConstruct === 'function') {
                        value[nameof<ObjectPropertyConfig>(s => s.construct)] = async (obj, smallBag) => {
                            await superConstruct(obj,smallBag);
                            await currentConstruct(obj,smallBag);
                        };
                    }else {
                        value[nameof<ObjectPropertyConfig>(s => s.construct)] = async (obj, smallBag) => {
                            await superConstruct(obj,smallBag);
                        };
                    }

                    //extend convert
                    const superConvert =
                        typeof superObj[nameof<ObjectPropertyConfig>(s => s.convert)] === 'function' ?
                            superObj[nameof<ObjectPropertyConfig>(s => s.convert)] :
                            async (obj) => {return obj;};
                    const currentConvert = value[nameof<ObjectPropertyConfig>(s => s.convert)];
                    if(typeof currentConvert === 'function') {
                        value[nameof<ObjectPropertyConfig>(s => s.convert)] = async (obj, smallBag) => {
                            return await currentConvert(await superConvert(obj,smallBag),smallBag);
                        };
                    }else {
                        value[nameof<ObjectPropertyConfig>(s => s.convert)] = async (obj, smallBag) => {
                            return await superConvert(obj,smallBag);
                        };
                    }

                    //remove extension
                    delete value[nameof<ObjectPropertyConfig>(s => s.extends)];
                }
            }
            else if(value.hasOwnProperty(nameof<ArrayPropertyConfig>(s => s.array)))
            {
                //is array
                let inArray = value[nameof<ArrayPropertyConfig>(s => s.array)];
                this.preCompileInheritance(inArray);
            }
        }
    }

    private preCompileController() : void
    {
        //set if controller property is not found
        if(!this.zc.appConfig.controller) {
            this.zc.appConfig.controller = {};
        }

        //iterate over controller
        const controller = this.zc.appConfig.controller;
        for(let k in controller)
        {
            if(controller.hasOwnProperty(k))
            {
                const currentC : ControllerConfig = controller[k];
                //set name property to key if not there
                if(currentC.fileName === undefined) {
                    currentC.fileName = k;
                }

                //set the defaults if property missing
                for(let property in this.controllerDefaults) {
                    if(this.controllerDefaults.hasOwnProperty(property) && currentC[property] === undefined) {
                        currentC[property] = this.controllerDefaults[property];
                    }
                }

                if(typeof currentC.input === 'object')
                {
                    const input = currentC.input;
                    for(let inputName in input)
                    if(input.hasOwnProperty(inputName))
                    {
                        //resolve values,object,array links and resolve inheritance
                        this.preCompileResolveExtras(inputName,input);
                        this.preCompileInheritance(input[inputName]);
                    }
                }
            }
        }
    }

}

export = ConfigPeCompiler;