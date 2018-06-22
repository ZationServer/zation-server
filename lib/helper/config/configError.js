/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ConfigError extends Error
{
    constructor(configName,message)
    {
        super();
        this._message = message;
        this._configName = configName;
    }

    toString()
    {
        return `Config: ${this._configName}  Error: ${this._message}`;
    }

    // noinspection JSUnusedGlobalSymbols
    getConfigName()
    {
        return this._configName;
    }

    // noinspection JSUnusedGlobalSymbols
    getMessage()
    {
        return super.message;
    }
}

module.exports = ConfigError;