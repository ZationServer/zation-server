class ConfigTools
{

    // noinspection JSUnusedGlobalSymbols
    static addEvents(config,events)
    {
        for(let k in events)
        {
            if(events.hasOwnProperty(k))
            {
                config[k] = events[k];
            }
        }
        return config;
    }

    static getDefault(input,defaultValue)
    {
        let res = input;
        if(input === undefined)
        {
            res = defaultValue;
        }
        return res;
    }

    static checkMiddlewareEvent(event,req,next)
    {
        if(event !== undefined && typeof event === 'function')
        {
            let res  = event(req);
            if(res !== undefined && typeof res === "boolean" && res)
            {
                return true;
            }
            else
            {
                if(typeof res === 'object')
                {
                    next(res);
                    return false;
                }
                else
                {
                    let err = new Error('Access is in middleware from cation event blocked!');
                    err.code = 4650;
                    next(err);
                    return false;
                }
            }
        }
        else
        {
            return true;
        }
    }

    static emitEvent(func,howToEmit = (f) => {f();})
    {
        if(func !== undefined && typeof func === 'function')
        {
            howToEmit(func);
        }
    }
}


module.exports = ConfigTools;