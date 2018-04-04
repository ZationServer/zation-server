/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const TaskError       = require('./../api/TaskError');
const TaskErrorBag    = require('./../api/TaskErrorBag');
const Const           = require('../helper/constante/constWrapper');
const HttpProcessor   = require('./../helper/processor/httpProcessor');
const SocketProcessor = require('./../helper/processor/socketProcessor');
const Returner        = require('./../helper/response/returner');

let zationSingleton = null;

class Zation
{
    constructor(zc)
    {
        if(zationSingleton)
        {
            let errorMessage = 'The Zation master object is a singleton,' +
                'it can only be instantiated once per process';
            throw new Error(errorMessage);
        }

        zationSingleton = this;

        this._zc = zc;
    }

    async run(data)
    {
        data.zc = this._zc;

        if(this._zc.isDebug())
        {

            if(data.isSocket)
            {
                console.log('ZATION GET SOCKET REQUEST ->');
                console.log(data.input);
            }
            else
            {
                console.log('ZATION GET HTTP REQUEST ->');
                console.log(data.req.body[Const.Main.POST_KEY_WORD]);
            }
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

            if(this._zc.isDebug())
            {
                console.error(e);
            }
            this._zc.emitEvent(Const.Event.ZATION_BEFORE_ERROR,
                (f) => {f(e)});

            if(e instanceof  TaskError)
            {
                this._zc.emitEvent(Const.Event.ZATION_BEFORE_TASK_ERROR,
                    (f) => {f(e)});
            }
            else if(e instanceof TaskErrorBag)
            {
                this._zc.emitEvent(Const.Event.ZATION_BEFORE_TASK_ERROR_BAG,
                    (f) => {f(e)});
            }

            returner.reactOnError(e,data['authData']);
        }
    }


}

module.exports = Zation;