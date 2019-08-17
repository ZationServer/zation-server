/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ConfigError from "./configError";

export default class ConfigErrorBag
{
    private readonly configErrors : ConfigError[];

    constructor()
    {
        this.configErrors = [];
    }

    toString() : string
    {
        let output : string = '';

        for(let i = 0; i < this.configErrors.length; i++)
        {
            output += this.configErrors[i].toString();
        }

        return output;
    }

    // noinspection JSUnusedGlobalSymbols
    addConfigError(configError : ConfigError) : void
    {
        this.configErrors.push(configError);
    }

    getConfigErrors() : ConfigError[]
    {
        return this.configErrors;
    }

    // noinspection JSUnusedGlobalSymbols
    hasConfigError() : boolean
    {
        return this.configErrors.length !== 0;
    }
}