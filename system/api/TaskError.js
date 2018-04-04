/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let Const      = require('../helper/constante/constWrapper');

class TaskError
{
    constructor(error = {},info)
    {
        //defaultValues
        this._name        = 'TaskError';
        this._description = 'No Description define in Error';
        this._type        = Const.Error.NORMAL_ERROR;
        this._systemError = false;
        this._sendInfo    = false;
        this._info        = {};
        this._isPrivate   = false;

        if(info !== undefined)
        {
            if (typeof info === 'string' || info instanceof String)
            {
                this._info[Const.Settings.ERROR_INFO_MAIN] = info;
            }
            else
            {
                this._info = info;
            }
        }

        if(error.hasOwnProperty(Const.Settings.ERROR_NAME))
        {
            this._name = error[Const.Settings.ERROR_NAME];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR_DESCRIPTION))
        {
            this._description = error[Const.Settings.ERROR_DESCRIPTION];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR_TYPE))
        {
            this._type = error[Const.Settings.ERROR_TYPE];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR_IS_SYSTEM_ERROR))
        {
            this._systemError = error[Const.Settings.ERROR_IS_SYSTEM_ERROR];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR_SEND_INFO))
        {
            this._sendInfo = error[Const.Settings.ERROR_SEND_INFO];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR_IS_PRIVATE))
        {
            this._isPrivate = error[Const.Settings.ERROR_IS_PRIVATE];
        }
    }

    toString()
    {
        return `TaskError  Name: ${this._name}  Description: ${this._description}  Type: ${this._type}  Info: ${JSON.stringify(this._info)}  isSystemError:${this._systemError}  isPrivate:${this._isPrivate}`;
    }

    _getJsonObj(withDesc)
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
            obj['se'] = this._systemError;

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

    isSystemError()
    {
        return this._systemError;
    }
}

TaskError.ErrorType = Const.Error;

module.exports = TaskError;