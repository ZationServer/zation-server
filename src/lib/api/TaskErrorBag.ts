/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError = require("./TaskError");

class TaskErrorBag
{
    private taskErrors : TaskError[];

    constructor(taskError ?: TaskError)
    {
        this.taskErrors = [];

        if(taskError)
        {
            this.taskErrors.push(taskError);
        }
    }

    addTaskErrorFast(error : object,info : object) : void
    {
        this.addTaskError(new TaskError(error,info));
    }

    getAllTaskErrors() : TaskError[]
    {
        return this.taskErrors;
    }

    // noinspection JSUnusedGlobalSymbols
    addFromTaskErrorBag(taskErrorBag : TaskErrorBag) : void
    {
        let errors = taskErrorBag.getAllTaskErrors();
        for (let i = 0; i < errors.length; i++) {
            this.addTaskError(errors[i])
        }
    }

    getJsonObj(withDesc : boolean) : object
    {
        let obj: object[] = [];
        for(let i = 0; i < this.taskErrors.length; i++) {
            obj.push(this.taskErrors[i].getJsonObj(withDesc));
        }
        return obj;
    }

    addTaskError(taskError : TaskError) : void
    {
        this.taskErrors.push(taskError);
    }

    // noinspection JSUnusedGlobalSymbols
    removeAllTaskError() : void
    {
        this.taskErrors = [];
    }

    throwMeIfHaveError() : void
    {
        if(this.haveTaskError())
        {
            throw this;
        }
    }

    getTaskErrorCount() : number
    {
        return this.taskErrors.length;
    }

    haveTaskError() : boolean
    {
        return this.taskErrors.length > 0;
    }

    // noinspection JSUnusedGlobalSymbols
    haveNoTaskError() : boolean
    {
        return this.taskErrors.length === 0;
    }

    toString() : string
    {
        let text = `TaskErrorBag-> ${this.taskErrors.length} TaskErrors  ->\n`;
        for(let i = 0; i < this.taskErrors.length; i++)
        {
            text += `     ${i}: ${this.taskErrors[i]} \n`;
        }
        return text;
    }

}

export = TaskErrorBag;