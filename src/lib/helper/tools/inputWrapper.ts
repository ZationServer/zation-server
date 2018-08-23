/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ObjectPath    = require('./objectPath');

class InputWrapper
{
    private input : ObjectPath;

    constructor(input)
    {
        this.input = new ObjectPath(input);
    }

    getInput(path ?: string | string[]) : any
    {
        return this.input.get(path);
    }

    hasInput(path ?: string | string[]) : boolean
    {
        return this.input.has(path);
    }
}

export = InputWrapper;