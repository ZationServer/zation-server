/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const         = require('../constants/constWrapper');
const ObjectPath    = require('./objectPath');

class InputWrapper
{
    constructor(input)
    {
        this._input = new ObjectPath(input);
    }

    getInput(path)
    {
        return this._input.get(path);
    }

}

module.exports = InputWrapper;