/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import TaskError        = require("./TaskError");
import {ErrorConstruct}   from "../helper/configs/errorConfig";

class TaskErrorBag
{
    private taskErrors : TaskError[];

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Creates an task error bag.
     * Here you can collect task errors
     * and throw them later all together.
     * Then all errors are sent to the client.
     * @example
     * new TaskErrorBag(myError,myError2).throw();
     * @param taskError
     */
    constructor(...taskError : TaskError[])
    {
        this.taskErrors = taskError;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Adds a new task error to the bag.
     * By using the constructor of the taskError.
     * @example
     * addNewTaskError({name : 'inputNotMatchWithMinLength'},{minLength : 5, inputLength : 3});
     * @param errorConstruct
     * Create a new error construct
     * or get one from the errorConfig by using the method getErrorConstruct on the bag/smallBag.
     * @param info
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    addNewTaskError(errorConstruct : ErrorConstruct, info ?: object | string) : void
    {
        this.addTaskError(new TaskError(errorConstruct,info));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns all task errors from the bag as an TaskError array.
     */
    getTaskErrors() : TaskError[]
    {
        return this.taskErrors;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Add all errors of other task error bags to this bag.
     * @param taskErrorBag
     */
    addFromTaskErrorBag(...taskErrorBag : TaskErrorBag[]) : void
    {
        for(let j = 0;  j < taskErrorBag.length; j++) {
            this.addTaskError(...taskErrorBag[j].getTaskErrors());
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * This method is used internal!
     * @param withDesc
     */
    _getJsonObj(withDesc : boolean) : object
    {
        let obj: object[] = [];
        for(let i = 0; i < this.taskErrors.length; i++) {
            obj.push(this.taskErrors[i]._getJsonObj(withDesc));
        }
        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Add task error/s to this bag.
     * @param taskError
     */
    addTaskError(...taskError : TaskError[]) : void
    {
        this.taskErrors.push(...taskError);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Empty the bag.
     * So all task errors in this bag will be removed.
     */
    emptyBag() : void
    {
        this.taskErrors = [];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throw this bag if it has at least one task error.
     */
    throwIfHasError() : void
    {
        if(this.isNotEmpty()) {
            throw this;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throw this bag.
     * Does not matter if the bag is empty or not.
     */
    throw() : void
    {
        throw this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the count of task error there are in the bag.
     */
    getTaskErrorCount() : number
    {
        return this.taskErrors.length;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the task error bag is not empty.
     * It means that the bag hast at least one error.
     */
    isNotEmpty() : boolean
    {
        return this.taskErrors.length > 0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the task error bag is empty.
     */
    isEmpty() : boolean
    {
        return this.taskErrors.length === 0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the complete information as a string.
     */
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