/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ErrorConstruct}     from "../helper/configEditTool/errorConfigStructure";
import TaskErrorBuilder   = require("../helper/builder/taskErrorBuilder");
let Const                 = require('../helper/constants/constWrapper');

class TaskError extends Error
{
    private description : string;
    private type : string;
    private sendInfo : boolean;
    private info : object;
    private privateE : boolean;
    private readonly fromZationSystem : boolean;

    constructor(errorConstruct : ErrorConstruct = {}, info ?: object | string)
    {
        super();
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

        if(errorConstruct.hasOwnProperty(Const.Settings.ERROR.NAME))
        {
            this.name = errorConstruct[Const.Settings.ERROR.NAME];
        }

        if(errorConstruct.hasOwnProperty(Const.Settings.ERROR.DESCRIPTION))
        {
            this.description = errorConstruct[Const.Settings.ERROR.DESCRIPTION];
        }

        if(errorConstruct.hasOwnProperty(Const.Settings.ERROR.TYPE))
        {
            this.type = errorConstruct[Const.Settings.ERROR.TYPE];
        }

        if(errorConstruct.hasOwnProperty(Const.Settings.ERROR.SEND_INFO))
        {
            this.sendInfo = errorConstruct[Const.Settings.ERROR.SEND_INFO];
        }

        if(errorConstruct.hasOwnProperty(Const.Settings.ERROR.IS_PRIVATE))
        {
            this.privateE = errorConstruct[Const.Settings.ERROR.IS_PRIVATE];
        }

        if(errorConstruct.hasOwnProperty(Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM))
        {
            this.fromZationSystem = errorConstruct[Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM];
        }
    }

    toString()
    {
        return `TaskError  Name: ${this.name}  Description: ${this.description}  Type: ${this.type}  Info: ${JSON.stringify(this.info)}  isPrivate:${this.privateE}  isFromZationSystem:${this.fromZationSystem}`;
    }

    getJsonObj(withDesc : boolean = false) : object
    {
        let obj = {};

        obj[Const.Settings.RESPONSE.ERROR.TYPE] = this.type;
        obj[Const.Settings.RESPONSE.ERROR.FROM_ZATION_SYSTEM] = this.fromZationSystem;

        if(this.privateE) {
            obj[Const.Settings.RESPONSE.ERROR.Name] = 'TaskError';
        }
        else
        {
            obj[Const.Settings.RESPONSE.ERROR.Name] = this.name;

            if(withDesc) {
                obj[Const.Settings.RESPONSE.ERROR.DESCRIPTION] = this.description;
            }

            if(this.sendInfo) {
                obj[Const.Settings.RESPONSE.ERROR.INFO] = this.info;
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

    static build() : TaskErrorBuilder
    {
        return new TaskErrorBuilder();
    }
}

export = TaskError;