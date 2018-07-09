/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class Logger
{
    static printStartDebugInfo(txt,isBusy = false)
    {
        if (Logger._zc.isStartDebug())
        {
            if(isBusy)
            {
                console.log('\x1b[33m%s\x1b[0m', '   [BUSY]',txt);
            }
            else
            {
                console.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
   static printDebugWarning(txt,obj)
    {
        if (Logger._zc.isDebug())
        {
            console.log('\x1b[31m%s\x1b[0m','   [WARNING]',txt);

            if(obj !== undefined)
            {
                console.log(obj);
            }
        }
    }

    static printConfigWarning(configName,message)
    {
        if (Logger._zc.isShowConfigWarning())
        {
            console.log('\x1b[31m%s\x1b[0m','   [WARNING IN CONFIG]',`Config: ${configName} -> ${message}`);
        }
    }

    static printDebugInfo(txt,obj,jsonStringify = false)
    {
        if (Logger._zc.isDebug())
        {
            if(jsonStringify)
            {
                console.log('\x1b[34m%s\x1b[0m','   [INFO]',txt + JSON.stringify(obj));
            }
            else
            {
                console.log('\x1b[34m%s\x1b[0m','   [INFO]',txt);
                if(obj !== undefined)
                {
                    console.log(obj);
                }
            }
        }
    }

    static printConfigErrorBag(configErrorBag)
    {
        console.log('\x1b[31m%s\x1b[0m','   [FAILED]');

        let configErrors = configErrorBag.getConfigErrors();
        let errorCount = configErrorBag.getConfigErrors().length;

        console.log('\x1b[31m%s\x1b[0m'
            ,'   [CONFIG]',
            `${errorCount} configuration error${errorCount > 1 ? 's' : ''} are detected!`);


        for(let i = 0; i < configErrors.length; i++)
        {
            console.log('\x1b[31m%s\x1b[0m','   [ERROR]',configErrors[i].toString());
        }

        console.log('\x1b[34m%s\x1b[0m','   [INFO]',
            `Please fix the ${errorCount} error${errorCount > 1 ? 's' : ''} to start Zation!`);
    }

}

module.exports = Logger;