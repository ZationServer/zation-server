const CA              = require('../constante/settings');
const TaskError       = require('../../api/TaskError');
const SyErrors        = require('../cationTaskErrors/systemTaskErrors');
const cationConfig    = require('../../../App/Config/cation.config');

const systemControllerConfig = require('../systemController/systemControler.config');
const systemControllerPath   = __dirname + './../systemController/controller';

class ControllerTools
{
    static getControllerConfig(task)
    {
        if(cationConfig[CA.CATION_CONTROLLER].hasOwnProperty(task[CA.INPUT_CONTROLLER]))
        {
            return cationConfig[CA.CATION_CONTROLLER][task[CA.INPUT_CONTROLLER]];
        }
        else if(systemControllerConfig.hasOwnProperty(task[CA.INPUT_CONTROLLER]))
        {
            return systemControllerConfig[task[CA.INPUT_CONTROLLER]];
        }
        else
        {
            throw new TaskError(SyErrors.controllerNotFound,{controllerName : task[CA.INPUT_CONTROLLER]});
        }
    }

    static getControllerFullPath(controllerConfig)
    {
        let controllerPath = controllerConfig[CA.CONTROLLER_PATH];
        let controllerName = controllerConfig[CA.CONTROLLER_NAME];

        if(controllerPath === undefined)
        {
            return controllerName;
        }
        else
        {
            return controllerPath + '/' + controllerName;
        }
    }

    static getControllerClass(controllerConfig,userConfig)
    {
        let path = ControllerTools.getControllerFullPath(controllerConfig);

        if(controllerConfig[CA.CONTROLLER_SYSTEM_CONTROLLER] !== undefined
            && controllerConfig[CA.CONTROLLER_SYSTEM_CONTROLLER])
        {
            return require(systemControllerPath + '/' + path);
        }
        else
        {
            return require(userConfig[CA.START_CONFIG_CONTROLLER_LOCATION] + '/' + path);
        }
    }

    static processBeforeHandleEvents(controllerConfig,bag)
    {
        let beforeHandle = controllerConfig[CA.CONTROLLER_BEFORE_HANDLE];
        if(beforeHandle !== undefined)
        {
            if(Array.isArray(beforeHandle))
            {
                for(let i = 0; i < beforeHandle.length; i++)
                {
                    ControllerTools.fireBeforeHandleEvent(beforeHandle[i],bag);
                }
            }
            else
            {
                ControllerTools.fireBeforeHandleEvent(beforeHandle,bag);
            }
        }
    }

    static fireBeforeHandleEvent(func,bag)
    {
        if(typeof func === "function")
        {
            func(bag);
        }
    }
}

module.exports = ControllerTools;