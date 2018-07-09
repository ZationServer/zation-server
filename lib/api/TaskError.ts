/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let Const      = require('../helper/constants/constWrapper');

class TaskError
{
    constructor(error = {},info)
    {
        //defaultValues
        this._name        = 'TaskError';
        this._description = 'No Description define in Error';
        this._type        = Const.Error.NORMAL_ERROR;
        this._sendInfo    = false;
        this._info        = {};
        this._isPrivate   = false;
        this._isFromZationSystem = false;

        if(info !== undefined)
        {
            if (typeof info === 'string' || info instanceof String)
            {
                this._info[Const.Settings.ERROR.INFO.MAIN] = info;
            }
            else
            {
                this._info = info;
            }
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.NAME))
        {
            this._name = error[Const.Settings.ERROR.NAME];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.DESCRIPTION))
        {
            this._description = error[Const.Settings.ERROR.DESCRIPTION];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.TYPE))
        {
            this._type = error[Const.Settings.ERROR.TYPE];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.SEND_INFO))
        {
            this._sendInfo = error[Const.Settings.ERROR.SEND_INFO];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.IS_PRIVATE))
        {
            this._isPrivate = error[Const.Settings.ERROR.IS_PRIVATE];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM))
        {
            this._isFromZationSystem = error[Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM];
        }
    }

    toString()
    {
        return `TaskError  Name: ${this._name}  Description: ${this._description}  Type: ${this._type}  Info: ${JSON.stringify(this._info)}  isPrivate:${this._isPrivate}  isFromZationSystem:${this._isFromZationSystem}`;
    }

    getJsonObj(withDesc)
    {
        let obj = {};

        if(this._isPrivate)
        {
            obj['n'] = 'TaskError';
            obj['t'] = this._type;
        }
        else
        {
            obj['n'] = this._name;
            obj['t'] = this._type;
            obj['zs'] = this._isFromZationSystem;

            if(withDesc)
            {
                obj['d'] = this._description;
            }

            if(this._sendInfo)
            {
                obj['i'] = this._info;
            }
        }
        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    getName()
    {
        return this._name;
    }

    // noinspection JSUnusedGlobalSymbols
    getDescription()
    {
        return this._description;
    }

    // noinspection JSUnusedGlobalSymbols
    getType()
    {
        return this._type;
    }

    // noinspection JSUnusedGlobalSymbols
    getIsPrivate()
    {
        return this._isPrivate;
    }

    // noinspection JSUnusedGlobalSymbols
    isSendInfo()
    {
        return this._sendInfo;
    }

    // noinspection JSUnusedGlobalSymbols
    getInfo()
    {
        return this._info;
    }


    // noinspection JSUnusedGlobalSymbols
    isFromZationSystem()
    {
        return this._isFromZationSystem;
    }
}

TaskError.ErrorType = Const.Error;

module.exports = TaskError;