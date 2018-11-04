/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig      = require("../../main/zationConfig");
import Const             = require('../constants/constWrapper');
import ObjectTools       = require('../tools/objectTools');

class ConfigPeCompiler
{
    private readonly zc : ZationConfig;

    private controllerDefaults : object;
    private objectsConfig : object;
    private inputGroupConfig : object;
    
    constructor(zationConfig)
    {
        this.zc = zationConfig;
        this.prepare();
    }

    preCompile() : void
    {
        this.preCompileObjects();
        this.preCompileController();
        this.preCompileChannelConfig();
        this.preCompileErrorConfig();

        //view precompiled app config
        console.dir(this.zc.getAppConfig(),{depth:null});
        console.dir(this.zc.getChannelConfig(),{depth:null});
    }

    private prepare() : void
    {
        this.prepareControllerDefaults();
        this.prepareObjectsConfig();
        this.preparePropertiesConfig();
    }

    private prepareControllerDefaults() : void
    {
        this.controllerDefaults = {};

        let cd = this.zc.getApp(Const.App.KEYS.CONTROLLER_DEFAULTS);

        //setDefaults if not set!
        if(cd !== undefined) {
            this.controllerDefaults = cd;
        }
    }

    private preCompileChannelConfig() : void
    {
        const channelConfig = this.zc.getChannelConfig();

        for(let k in channelConfig)
        {
            if(channelConfig.hasOwnProperty(k))
            {
                if(typeof channelConfig[k] === 'object')
                {
                    if(k === Const.Channel.KEYS.CUSTOM_ID_CHANNELS || k === Const.Channel.KEYS.CUSTOM_CHANNELS) {
                        this.preCompileChannelDefault(channelConfig[k]);
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
        if(typeof this.zc.getErrorConfig() === 'object')
        {
            let errors = this.zc.getErrorConfig();
            for(let k in errors)
            {
                if(errors.hasOwnProperty(k) && errors[k][Const.Settings.ERROR.NAME] === undefined)
                {
                    errors[k][Const.Settings.ERROR.NAME] = k;
                }
            }
        }
    }

    private preCompileChannelDefault(channels : object) : void
    {
        if(channels[Const.Channel.CHANNEL_DEFAULT.DEFAULT])
        {
            let defaultCh = channels[Const.Channel.CHANNEL_DEFAULT.DEFAULT];
            for(let chName in channels)
            {
                if(channels.hasOwnProperty(chName) && chName !== Const.Channel.CHANNEL_DEFAULT.DEFAULT)
                {
                    if(!(channels[chName].hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_ACCESS) ||
                        channels[chName].hasOwnProperty(Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS)))
                    {
                        if(defaultCh[Const.Channel.CHANNEL.SUBSCRIBE_ACCESS] !== undefined)
                        {
                            channels[chName][Const.Channel.CHANNEL.SUBSCRIBE_ACCESS] =
                                defaultCh[Const.Channel.CHANNEL.SUBSCRIBE_ACCESS];
                        }
                        if(defaultCh[Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS] !== undefined)
                        {
                            channels[chName][Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS] =
                                defaultCh[Const.Channel.CHANNEL.SUBSCRIBE_NOT_ACCESS];
                        }
                    }

                    if(!(channels[chName].hasOwnProperty(Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS) ||
                        channels[chName].hasOwnProperty(Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS)))
                    {
                        if(defaultCh[Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS] !== undefined)
                        {
                            channels[chName][Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS] =
                                defaultCh[Const.Channel.CHANNEL.CLIENT_PUBLISH_ACCESS];
                        }
                        if(defaultCh[Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS] !== undefined)
                        {
                            channels[chName][Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS] =
                                defaultCh[Const.Channel.CHANNEL.CLIENT_PUBLISH_NOT_ACCESS];
                        }
                    }

                    this.processDefaultValue(channels[chName],defaultCh,Const.Channel.CHANNEL.ON_CLIENT_PUBLISH);
                    this.processDefaultValue(channels[chName],defaultCh,Const.Channel.CHANNEL.ON_SUBSCRIPTION);
                    this.processDefaultValue(channels[chName],defaultCh,Const.Channel.CHANNEL.ON_UNSUBSCRIPTION);
                    this.processDefaultValue(channels[chName],defaultCh,Const.Channel.CHANNEL_SETTINGS.SOCKET_GET_OWN_PUBLISH);
                }
            }
            delete channels[Const.Channel.CHANNEL_DEFAULT.DEFAULT];
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

    private prepareObjectsConfig() : void
    {
        this.objectsConfig
            = this.zc.isApp(Const.App.KEYS.OBJECTS) ? this.zc.getApp(Const.App.KEYS.OBJECTS) : {};
    }

    private preparePropertiesConfig() : void
    {
        this.inputGroupConfig
            = this.zc.isApp(Const.App.KEYS.VALUES) ? this.zc.getApp(Const.App.KEYS.VALUES) : {};
    }

    private preCompileObjects() : void
    {
        //compile first validation groups form every object
        for(let objName in this.objectsConfig)
        {
            if(this.objectsConfig.hasOwnProperty(objName))
            {
                this.preCompileObjectInputGroup(this.objectsConfig[objName]);
            }
        }

        //than resolve the objects links
        for(let objName in this.objectsConfig)
        {
            if(this.objectsConfig.hasOwnProperty(objName))
            {
                this.preCompileObjectResolveExtras(this.objectsConfig[objName]);
            }
        }

        //than resolve the objects inheritance
        for(let objName in this.objectsConfig)
        {
            if(this.objectsConfig.hasOwnProperty(objName))
            {
                this.preCompileInheritance(this.objectsConfig[objName]);
            }
        }
    }

    private preCompileObjectResolveExtras(obj : object) : void
    {
        let properties = obj[Const.App.OBJECT.PROPERTIES];
        for(let propName in properties) {
            if (properties.hasOwnProperty(propName))
            {
                this.preCompileResolveExtras(propName,properties);
            }
        }
    }

    private preCompileObjectInputGroup(obj : object) : void
    {
        let properties = obj[Const.App.OBJECT.PROPERTIES];
        for(let propName in properties) {
            if (properties.hasOwnProperty(propName))
            {
                this.preCompileInputGroups(propName,properties);
            }
        }
    }

    private preCompileResolveExtras(key : string, obj : object) : void
    {
        let nowValue = obj[key];

        if(typeof nowValue === 'string')
        {
            //resolve object import
            if(!nowValue.startsWith('g.')) {
                obj[key] = this.objectsConfig[nowValue.replace('o.','')];
            }
        }
        else if(Array.isArray(nowValue))
        {
            let inArray = {};
            let isNewObj = false;

            if(typeof nowValue[0] === 'string') {
                const value = nowValue[0];
                if(!value.startsWith('g.')) {
                    inArray = this.objectsConfig[value.replace('o.','')];
                }
            }
            else if(typeof nowValue[0] === 'object' || Array.isArray(nowValue[0])) {
                inArray = nowValue[0];
                isNewObj = true;
            }

            let arrayExtras = {};
            if(nowValue.length === 2 && typeof nowValue[1] === 'object') {
                arrayExtras = nowValue[1];
            }

            obj[key] = {};
            ObjectTools.addObToOb(obj[key],arrayExtras);
            obj[key][Const.App.VALUE.ARRAY] = inArray;

            if(isNewObj) {
                this.preCompileResolveExtras(Const.App.VALUE.ARRAY,obj[key]);
            }
        }
        else if(typeof nowValue === "object")
        {
            if(nowValue.hasOwnProperty(Const.App.OBJECT.PROPERTIES))
            {
                //isObject
                //check all properties of object!
                this.preCompileObjectResolveExtras(nowValue);
            }
            else if(nowValue.hasOwnProperty(Const.App.VALUE.ARRAY))
            {
                //we have array look in the array body!
                this.preCompileResolveExtras(Const.App.VALUE.ARRAY,nowValue);
            }
        }
    }

    private preCompileInheritance(value : any) : void
    {
        if(typeof value === "object")
        {
            //check input
            if(value.hasOwnProperty(Const.App.OBJECT.PROPERTIES))
            {
                //isObject
                if(typeof value[Const.App.OBJECT.EXTENDS] === 'string')
                {
                    //extends there
                    //check super extends before this
                    const superName = value[Const.App.OBJECT.EXTENDS];
                    this.preCompileInheritance(this.objectsConfig[superName]);

                    //lastExtend
                    //extend Props
                    const superProps = this.objectsConfig[superName][Const.App.OBJECT.PROPERTIES];
                    ObjectTools.addObToOb(value[Const.App.OBJECT.PROPERTIES],superProps,false);
                    //extend Methods
                    let superMethods = this.objectsConfig[superName][Const.App.OBJECT.PROTOTYPE];

                    if(superMethods){
                        if(!value[Const.App.OBJECT.PROTOTYPE]){
                            value[Const.App.OBJECT.PROTOTYPE] = {};
                        }
                        Object.setPrototypeOf(value[Const.App.OBJECT.PROTOTYPE],superMethods);
                    }

                    //extend construct
                    const superObj = this.objectsConfig[superName];

                    const superConstruct =
                        typeof superObj[Const.App.OBJECT.CONSTRUCT] === 'function' ?
                        superObj[Const.App.OBJECT.CONSTRUCT] :
                        async (obj) => {return obj;};

                    const currentConstruct =
                        typeof value[Const.App.OBJECT.CONSTRUCT] === 'function' ?
                        value[Const.App.OBJECT.CONSTRUCT] :
                        async (obj) => {return obj;};

                    value[Const.App.OBJECT.CONSTRUCT] = async (obj, smallBag) => {
                        return await currentConstruct(await superConstruct(obj,smallBag),smallBag);
                    };

                    //remove extension
                    delete value[Const.App.OBJECT.EXTENDS];
                }
            }
            else if(value.hasOwnProperty(Const.App.VALUE.ARRAY))
            {
                //is array
                let inArray = value[Const.App.VALUE.ARRAY];
                this.preCompileInheritance(inArray);
            }
        }
    }

    private preCompileInputGroups(key : string | number, obj : object) : void
    {
        const value = obj[key];

        if(typeof value === 'string')
        {
            //resolve object import
            if(value.startsWith('g.')) {
                obj[key] = this.inputGroupConfig[value.replace('g.','')];
            }
        }
        else if(Array.isArray(value))
        {
            //arrayShortCut
            this.preCompileInputGroups(0,value);
        }
        else if(typeof value === "object")
        {
            //check input
            if(value.hasOwnProperty(Const.App.OBJECT.PROPERTIES))
            {
                //isObject
                this.preCompileObjectInputGroup(value);
            }
            else if(value.hasOwnProperty(Const.App.VALUE.ARRAY))
            {
                //is array
                this.preCompileInputGroups(Const.App.VALUE.ARRAY,value);
            }
        }
    }

    private preCompileController() : void
    {
        //set if controller property is not found
        if(!this.zc.getApp(Const.App.KEYS.CONTROLLER))
        {
            this.zc.getAppConfig()[Const.App.KEYS.CONTROLLER] = {};
        }

        //iterate over controller
        let controller = this.zc.getApp(Const.App.KEYS.CONTROLLER);
        for(let k in controller)
        {
            if(controller.hasOwnProperty(k))
            {
                //set name property to key if not there
                if(controller[k][Const.App.CONTROLLER.FILE_NAME] === undefined)
                {
                    controller[k][Const.App.CONTROLLER.FILE_NAME] = k;
                }

                //set the defaults if property missing
                for(let property in this.controllerDefaults)
                {
                    if(this.controllerDefaults.hasOwnProperty(property) && controller[k][property] === undefined)
                    {
                        controller[k][property] = this.controllerDefaults[property];
                    }
                }

                if(controller[k].hasOwnProperty(Const.App.CONTROLLER.INPUT))
                {
                    let input = controller[k][Const.App.CONTROLLER.INPUT];
                    for(let inputName in input)
                    if(input.hasOwnProperty(inputName))
                    {
                        //Compile validation groups and resolve object links
                        this.preCompileInputGroups(inputName,input);
                        this.preCompileResolveExtras(inputName,input);
                        this.preCompileInheritance(input[inputName]);
                    }
                }
            }
        }
    }

}

export = ConfigPeCompiler;