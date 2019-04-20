/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class ConfigError extends Error
{
    message : string;
    private readonly configName : string;

    constructor(configName,message)
    {
        super();
        this.message = message;
        this.configName = configName;
    }

    toString() : string
    {
        return `Config: ${this.configName}  Error: ${this.message}`;
    }

    // noinspection JSUnusedGlobalSymbols
    getConfigName() : string
    {
        return this.configName;
    }

    // noinspection JSUnusedGlobalSymbols
    getMessage() : string
    {
        return super.message;
    }
}