const Auth = require('../helper/authSystem/auth');


class Result
{
    constructor(data)
    {
        this._keyValuePairs = {};
        this._values = [];

        if(data !== undefined)
        {
            if(data !== null && typeof data === 'object')
            {
                this._keyValuePairs = data;
            }
            else if(Array.isArray(data))
            {
                this._values = data;
            }
            else
            {
                this.addValue(data);
            }
        }
    }

    _getJsonObj()
    {
        let obj = {};
        obj['kv'] = this._keyValuePairs;
        obj['v'] = this._values;

        return obj;
    }

    // noinspection JSUnusedGlobalSymbols
    removePair(key)
    {
        delete this._keyValuePairs[key];
    }

    // noinspection JSUnusedGlobalSymbols
    removeValue(index)
    {
        delete this._values[index];
    }

    // noinspection JSUnusedGlobalSymbols
    addPair(key,value)
    {
        if(this._keyValuePairs.hasOwnProperty(key))
        {
            return false;
        }
        else
        {
            this._keyValuePairs[key] = value;
            return true;
        }
    }

    addValue(value)
    {
        this._values.push(value);
    }

    // noinspection JSUnusedGlobalSymbols
    clearResult()
    {
        this._keyValuePairs = {};
        this._values = [];
    }

    // noinspection JSUnusedGlobalSymbols
    getValueFromKey(key)
    {
        return this._keyValuePairs[key];
    }

    // noinspection JSUnusedGlobalSymbols
    getValueFromIndex(index)
    {
        return this._values[index];
    }


}

module.exports = Result;