/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const              = require('../constants/constWrapper');
import {ErrorConstruct} from "../configEditTool/errorConfigStructure";
import TaskError          = require("../../api/TaskError");

class TaskErrorBuilder
{
    private errorSettings : ErrorConstruct = {};
    private errorInfo : object = {};

    constructor()
    {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.NORMAL_ERROR;
    }

    name(name : string) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.NAME] = name;
        return this;
    }

    typ(type : string) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = type;
        return this;
    }

    isSystemError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.SYSTEM_ERROR;
        return this;
    }

    isInputError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.INPUT_ERROR;
        return this;
    }

    isValidationError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.VALIDATION_ERROR;
        return this;
    }

    isAuthError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.AUTH_ERROR;
        return this;
    }

    isProtocolError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.PROTOCOL_ERROR;
        return this;
    }

    isTokenError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.TOKEN_ERROR;
        return this;
    }

    isDatabaseError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.DATABASE_ERROR;
        return this;
    }

    isCompatibilityError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.COMPATIBILITY_ERROR;
        return this;
    }

    isTimeError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.TIME_ERROR;
        return this;
    }

    isNormalError() : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.TYPE] = Const.Error.NORMAL_ERROR;
        return this;
    }

    description(description : string) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.DESCRIPTION] = description;
        return this;
    }

    sendInfo(sendInfo : boolean) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.SEND_INFO] = sendInfo;
        return this;
    }

    private(isPrivate : boolean) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.IS_PRIVATE] = isPrivate;
        return this;
    }

    fromZationSystem(fromZationSystem : boolean) : TaskErrorBuilder {
        this.errorSettings[Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM] = fromZationSystem;
        return this;
    }

    addInfo(key : string, value : any, override : boolean = true)
    {
        if(override || !this.errorInfo.hasOwnProperty(key))
        {
            this.errorInfo[key] = value;
        }
        return this;
    }

    get() : TaskError
    {
        return new TaskError(this.errorSettings,this.errorInfo);
    }

}

export = TaskErrorBuilder;
