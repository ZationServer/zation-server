/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const         = require('../constants/constWrapper');
const ObjectPath    = require('./objectPath');

class InputWrapper
{
    constructor(input,inputMissing)
    {
        this._input = new ObjectPath(input);
        this._inputMissing = inputMissing;
    }

    getInput(path)
    {
        return this._input.get(path);
    }

    isInputMissing()
    {
        return this._inputMissing;
    }

}

module.exports = InputWrapper;