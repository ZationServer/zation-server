/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const              = require('./../constants/constWrapper');
const ObjectTools        = require('./../tools/objectTools');

class ConfigPeCompiler
{
    constructor(zationConfig)
    {
        this._zc = zationConfig;
        this._prepare();
    }

    preCompile()
    {
        this._preCompileObjects();
        this._preCompileController();
    }

    _prepare()
    {
        this._prepareControllerDefaults();
        this._prepareObjectsConfig();
        this._prepareValidationGroupConfig();
    }

    _prepareControllerDefaults()
    {
        this._controllerDefaults = {};

        let cd = this._zc.getApp(Const.App.KEYS.CONTROLLER_DEFAULT);

        //setDefaults if not set!
        if(cd !== undefined) {
            this._controllerDefaults = cd;
        }
    }

    _prepareObjectsConfig()
    {
        this._objectsConfig
            = this._zc.isApp(Const.App.KEYS.OBJECTS) ? this._zc.getApp(Const.App.KEYS.OBJECTS) : {};
    }

    _prepareValidationGroupConfig()
    {
        this._validationGroupConfig
            = this._zc.isApp(Const.App.KEYS.VALIDATION_GROUPS) ? this._zc.getApp(Const.App.KEYS.VALIDATION_GROUPS) : {};
    }

    _preCompileObjects()
    {
        //compile first validation groups form every object
        for(let objName in this._objectsConfig)
        {
            if(this._objectsConfig.hasOwnProperty(objName))
            {
                this._preCompileObjectValidationGroup(this._objectsConfig[objName]);
            }
        }

        //than resolve the objects links
        for(let objName in this._objectsConfig)
        {
            if(this._objectsConfig.hasOwnProperty(objName))
            {
                this._preCompileObjectResolveLinks(this._objectsConfig[objName]);
            }
        }
    }

    _preCompileObjectResolveLinks(obj)
    {
        let properties = obj[Const.App.OBJECTS.PROPERTIES];
        for(let propName in properties) {
            if (properties.hasOwnProperty(propName))
            {
                this._preCompileResolveObjects(propName,properties);
            }
        }
    }

    _preCompileObjectValidationGroup(obj)
    {
        let properties = obj[Const.App.OBJECTS.PROPERTIES];
        for(let propName in properties) {
            if (properties.hasOwnProperty(propName))
            {
                this._preCompileValidationGroups(properties[propName]);
            }
        }
    }

    _preCompileResolveObjects(key,obj)
    {
        let nowValue = obj[key];

        if(typeof nowValue === 'string')
        {
            let objConfig = this._objectsConfig[nowValue];
            obj[key] = {};
            ObjectTools.addObToOb(obj[key],objConfig);
        }
        else if(Array.isArray(nowValue))
        {
            let objName = nowValue[0];
            let objConfig = this._objectsConfig[objName];
            obj[key] = {};
            ObjectTools.addObToOb(obj[key],objConfig);
            obj[key][Const.App.INPUT.IS_ARRAY] = true;
        }
        else if(typeof nowValue === "object" && nowValue.hasOwnProperty(Const.App.OBJECTS.PROPERTIES))
        {
            //isObject
            this._preCompileObjectResolveLinks(nowValue);
        }
    }

    _preCompileValidationGroups(value)
    {
        if(typeof value === "object" && !Array.isArray(value))
        {
            //check input
            if(value.hasOwnProperty(Const.App.OBJECTS.PROPERTIES))
            {
                //isObject
                this._preCompileObjectValidationGroup(value);
            }
            else
            {
                //isNormalInputBody
                if(value.hasOwnProperty(Const.App.INPUT.VALIDATION_GROUP))
                {
                    let validationGroupName = value[Const.App.INPUT.VALIDATION_GROUP];
                    let group = this._validationGroupConfig[validationGroupName];

                    //remove old validation if there
                    for(let k in value)
                    {
                        if(value.hasOwnProperty(k))
                        {
                            if
                            (!
                                (k === Const.App.INPUT.IS_ARRAY ||
                                 k === Const.App.INPUT.IS_OPTIONAL)
                            )
                            {
                                delete value[k];
                            }
                        }
                    }
                    ObjectTools.addObToOb(value,group,true);
                }
            }
        }
    }

    _preCompileController()
    {
        //set if controller property is not found
        if(!this._zc.getApp(Const.App.KEYS.CONTROLLER))
        {
            this._zc.getAppConfig()[Const.App.KEYS.CONTROLLER] = {};
        }

        //iterate over controller
        let controller = this._zc.getApp(Const.App.KEYS.CONTROLLER);
        for(let k in controller)
        {
            if(controller.hasOwnProperty(k))
            {
                //set name property to key if not there
                if(controller[k][Const.App.CONTROLLER.NAME] === undefined)
                {
                    controller[k][Const.App.CONTROLLER.NAME] = k;
                }

                //set the defaults if property missing
                for(let property in this._controllerDefaults)
                {
                    if(this._controllerDefaults.hasOwnProperty(property) && controller[k][property] === undefined)
                    {
                        controller[k][property] = this._controllerDefaults[property];
                    }
                }

                if(controller[k].hasOwnProperty(Const.App.CONTROLLER.INPUT))
                {
                    let input = controller[k][Const.App.CONTROLLER.INPUT];
                    for(let inputName in input)
                    if(input.hasOwnProperty(inputName))
                    {
                        //Compile validation groups and resolve object links
                        this._preCompileValidationGroups(input[inputName]);
                        this._preCompileResolveObjects(inputName,input);
                    }
                }
            }
        }
    }

}

module.exports = ConfigPeCompiler;