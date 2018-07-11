/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let Const      = require('../helper/constants/constWrapper');

class TaskError
{
    private name : string;
    private description : string;
    private type : string;
    private sendInfo : boolean;
    private info : object;
    private privateE : boolean;
    private readonly fromZationSystem : boolean;

    constructor(error : object = {},info ?: object | string)
    {
        //defaultValues
        this.name        = 'TaskError';
        this.description = 'No Description define in Error';
        this.type        = Const.Error.NORMAL_ERROR;
        this.sendInfo    = false;
        this.info        = {};
        this.privateE   = false;
        this.fromZationSystem = false;

        if(info !== undefined)
        {
            if (typeof info === 'string')
            {
                this.info[Const.Settings.ERROR.INFO.MAIN] = info;
            }
            else
            {
                this.info = info;
            }
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.NAME))
        {
            this.name = error[Const.Settings.ERROR.NAME];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.DESCRIPTION))
        {
            this.description = error[Const.Settings.ERROR.DESCRIPTION];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.TYPE))
        {
            this.type = error[Const.Settings.ERROR.TYPE];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.SEND_INFO))
        {
            this.sendInfo = error[Const.Settings.ERROR.SEND_INFO];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.IS_PRIVATE))
        {
            this.privateE = error[Const.Settings.ERROR.IS_PRIVATE];
        }

        if(error.hasOwnProperty(Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM))
        {
            this.fromZationSystem = error[Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM];
        }
    }

    toString()
    {
        return `TaskError  Name: ${this.name}  Description: ${this.description}  Type: ${this.type}  Info: ${JSON.stringify(this.info)}  isPrivate:${this.privateE}  isFromZationSystem:${this.fromZationSystem}`;
    }

    getJsonObj(withDesc : boolean = false) : object
    {
        let obj = {};

        if(this.privateE)
        {
            obj['n'] = 'TaskError';
            obj['t'] = this.type;
        }
        else
        {
            obj['n'] = this.name;
            obj['t'] = this.type;
            obj['zs'] = this.fromZationSystem;

            if(withDesc)
            {
                obj['d'] = this.description;
            }

            if(this.sendInfo)
            {
                obj['i'] = this.info;
            }
        }
        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    getName() : string
    {
        return this.name;
    }

    // noinspection JSUnusedGlobalSymbols
    setName(name : string) : void
    {
        this.name = name;
    }

    // noinspection JSUnusedGlobalSymbols
    getDescription() : string
    {
        return this.description;
    }

    // noinspection JSUnusedGlobalSymbols
    setDescription(description : string) : void
    {
        this.description = description;
    }

    // noinspection JSUnusedGlobalSymbols
    getType() : string
    {
        return this.type;
    }

    // noinspection JSUnusedGlobalSymbols
    setType(type : string) : void
    {
        this.type = type;
    }

    // noinspection JSUnusedGlobalSymbols
    isPrivate() : boolean
    {
        return this.privateE;
    }

    // noinspection JSUnusedGlobalSymbols
    setPrivate(privateE : boolean) : void
    {
        this.privateE = privateE;
    }

    // noinspection JSUnusedGlobalSymbols
    isSendInfo() : boolean
    {
        return this.sendInfo;
    }

    // noinspection JSUnusedGlobalSymbols
    setSendInfo(sendInfo : boolean) : void
    {
        this.sendInfo = sendInfo;
    }

    // noinspection JSUnusedGlobalSymbols
    getInfo() : object
    {
        return this.info;
    }

    // noinspection JSUnusedGlobalSymbols
    setInfo(info : object) : void
    {
        this.info = info;
    }

    // noinspection JSUnusedGlobalSymbols
    isFromZationSystem() : boolean
    {
        return this.fromZationSystem;
    }
}

export = TaskError;