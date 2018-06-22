/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const              = require('./../constants/constWrapper');
const Logger             = require('./../logger/logger');

class ConfigPeCompiler
{
    //-1 set controllerName attribute to key from controller if is it undefined
    //-2 preCompile the validation groups

    constructor(zationConfig)
    {
        this._zc = zationConfig;
        this._prepare();
    }

    preCompile()
    {
        this._preCompileController();
    }

    _prepare()
    {
        this._prepareControllerDefaults();
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

                //preCompileValidationGroups
                this._preCompileValidationGroups(controller[k]);
            }
        }
    }

    _preCompileValidationGroups(controller)
    {


    }

}

module.exports = ConfigPeCompiler;