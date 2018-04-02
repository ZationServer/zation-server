//Import Zation Stuff
const TaskError       = require('./../api/TaskError');
const TaskErrorBag    = require('./../api/TaskErrorBag');
const CEvents          = require('./../helper/constante/events');
const HttpProcessor   = require('./../helper/processor/httpProcessor');
const SocketProcessor = require('./../helper/processor/socketProcessor');
const Returner        = require('./../helper/response/returner');

let zationSingleton = null;

class Zation
{
    constructor(Config,debug)
    {
        if(zationSingleton)
        {
            let errorMessage = 'The Zation master object is a singleton,' +
                'it can only be instantiated once per process';
            throw new Error(errorMessage);
        }

        zationSingleton = this;

        this._debug = debug;
        this._config = userConfig;
        this.eventSConfig = userConfig['events'];
        this.registerEvents();
    }

    registerEvents()
    {
        if(this.eventConfig[Events.ZATION_BEFORE_ERROR] instanceof Function)
        {
            this.beforeError(this.eventConfig[Events.ZATION_BEFORE_ERROR]);
        }
        if(this.eventConfig[Events.ZATION_BEFORE_TASK_ERROR] instanceof Function)
        {
            this.beforeTaskError(this.eventConfig[Events.ZATION_BEFORE_TASK_ERROR]);
        }
        if(this.eventConfig[Events.ZATION_BEFORE_TASK_ERROR_BAG] instanceof Function)
        {
            this.beforeTaskErrorBag(this.eventConfig[Events.ZATION_BEFORE_TASK_ERROR_BAG]);
        }
    }

    beforeError(func)
    {
        this.beforeErrorFunc = func;
    }

    beforeTaskError(func)
    {
        this.beforeTaskErrorFunc = func;
    }

    beforeTaskErrorBag(func)
    {
        this.beforeTaskErrorBagFunc = func;
    }

    static fireEvent(func,param)
    {
        if(func && {}.toString.call(func) === '[object Function]')
        {
            func(param);
        }
    }

    async run(data)
    {
        data['debug'] = this.debug;
        data['userConfig'] = this.userConfig;

        if(this.debug)
        {
            console.log('ZATION GET REQUEST ->');
            console.log(data.input);
        }

        let returner = new Returner(data);

        try
        {
            if(data.isSocket)
            {
                returner.getResultAndReact(await SocketProcessor.runSocketProcess(data));
            }
            else
            {
                returner.getResultAndReact(await HttpProcessor.runHttpProcess(data));
            }
        }
        catch(data)
        {
            let e = data;

            if(data['authData'] !== undefined)
            {
                e = data['e'];
            }

            if(this.debug)
            {
                console.error(e);
            }
            Zation.fireEvent(this.beforeErrorFunc,e);

            if(e instanceof  TaskError)
            {
                Zation.fireEvent(this.beforeTaskErrorFunc,e);
            }
            else if(e instanceof TaskErrorBag)
            {
                Zation.fireEvent(this.beforeTaskErrorBagFunc,e);
            }

            returner.reactOnError(e,data['authData']);
        }
    }


}

module.exports = Zation;