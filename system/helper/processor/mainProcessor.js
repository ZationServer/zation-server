const ControllerTools       = require('../tools/controllerTools');
const Controller            = require('../../api/Controller');
const Result                = require('../../api/Result');


const TaskError                = require('../../api/TaskError');

class MainProcessor
{
    static processController(controllerClass,controllerConfig,bag)
    {
        if (controllerClass instanceof Controller)
        {
            try
            {

                ControllerTools.processBeforeHandleEvents(controllerConfig, bag);

                let result = controllerClass.handle(bag);

                if (!(result instanceof Result)) {
                    result = new Result(result);
                }

                return {result : result, authData : bag.getAuthController()._getNewAuthData()};
            }
            catch(e)
            {
                throw {e : e,authData : bag.getAuthController()._getNewAuthData()};
            }
        }
    }

}

module.exports = MainProcessor;