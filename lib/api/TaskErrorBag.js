/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TaskError = require('./TaskError');

class TaskErrorBag
{
    constructor(taskError)
    {
        this._taskErrors = [];

        if(taskError instanceof TaskError)
        {
            this._taskErrors.push(taskError);
        }
    }

    addTaskErrorFast(error,info)
    {
        return this.addTaskError(new TaskError(error,info));
    }

    getAllTaskErrors()
    {
        return this._taskErrors;
    }

    addErrorsFromTaskErrorBag(bag)
    {
        if(bag instanceof TaskErrorBag)
        {
            let errors = bag.getAllTaskErrors();
            for (let i = 0; i < errors.length; i++) {
                this.addTaskError(errors[i])
            }
            return true;
        }
        else
        {
            return false;
        }
    }

    getJsonObj(withDesc)
    {
        let obj = [];
        for(let i = 0; i < this._taskErrors.length; i++) {
            obj.push(this._taskErrors[i].getJsonObj(withDesc));
        }
        return obj;
    }

    addTaskError(taskError)
    {
        if(taskError instanceof TaskError)
        {
            this._taskErrors.push(taskError);
            return true;
        }
        else
        {
            return false;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    removeAllTaskError()
    {
        this._taskErrors = [];
    }

    throwMeIfHaveError()
    {
        if(this.haveTaskError())
        {
            throw this;
        }
    }

    getTaskErrorCount()
    {
        return this._taskErrors.length;
    }

    haveTaskError()
    {
        return this._taskErrors.length > 0;
    }

    // noinspection JSUnusedGlobalSymbols
    haveNoTaskError()
    {
        return this._taskErrors === 0;
    }

    toString()
    {
        let text = `TaskErrorBag-> ${this._taskErrors.length} TaskErrors  ->\n`;
        for(let i = 0; i < this._taskErrors.length; i++)
        {
            text += `     ${i}: ${this._taskErrors[i]} \n`;
        }
        return text;
    }

}

module.exports = TaskErrorBag;