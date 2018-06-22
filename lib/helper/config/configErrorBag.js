/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ConfigError = require('./configError');

class ConfigErrorBag
{
    constructor()
    {
        this._configErrors = [];
    }

    toString()
    {
        return "";
    }

    // noinspection JSUnusedGlobalSymbols
    addConfigError(configError)
    {
        if(configError instanceof ConfigError)
        {
            this._configErrors.push(configError);
        }
    }

    getConfigErrors()
    {
        return this._configErrors;
    }

    // noinspection JSUnusedGlobalSymbols
    hasConfigError()
    {
        return this._configErrors.length !== 0;
    }
}

module.exports = ConfigErrorBag;