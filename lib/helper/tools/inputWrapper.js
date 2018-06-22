/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const         = require('../constants/constWrapper');
const ObjectPath    = require('./objectPath');

class InputWrapper
{
    constructor(inputData)
    {
        this._input = new ObjectPath(inputData[Const.Settings.INPUT_DATA.INPUT]);
        this._inputMissing = inputData[Const.Settings.INPUT_DATA.INPUT_MISSING];
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