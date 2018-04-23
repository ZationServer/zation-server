/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const         = require('./../../helper/constante/constWrapper');

class InputWrapper
{
    constructor(paramData)
    {
        this._params = paramData[Const.Settings.PARAM_DATA_PARAMS];
        this._paramMissing = paramData[Const.Settings.PARAM_DATA_PARAMS_MISSING];
    }

    getParams()
    {
        return this._params;
    }

    isParamMissing()
    {
        return this._paramMissing;
    }

}

module.exports = InputWrapper;