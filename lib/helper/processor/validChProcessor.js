/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                 = require('../constants/constWrapper');
const ControllerTools       = require('../tools/controllerTools');
const Controller            = require('../../api/Controller');
const Result                = require('../../api/Result');
const MainErrors            = require('../zationTaskErrors/mainTaskErrors');
const TaskError             = require('../../api/TaskError');
const ZationReqTools        = require('../tools/zationReqTools');
const SystemVersionChecker  = require('../checker/systemVersionChecker');
const ParamChecker          = require('../checker/inputChecker');
const AuthEngine            = require('../auth/authEngine');
const Bag                   = require('../../api/Bag');
const TokenEngine           = require('./../token/tokenEngine');
const InputWrapper          = require('../tools/inputWrapper');

class ValidChProcessor
{
    static async process(reqData,zc,worker)
    {
        if(ZationReqTools.isValidValidationStructure(reqData))
        {
            let validReq = reqData[Const.Settings.VALIDATION_REQUEST_INPUT.MAIN];
            let cName = validReq[Const.Settings.VALIDATION_REQUEST_INPUT.CONTROLLER];

            //throws if not found!
            let controller = ControllerTools.getControllerConfig(zc,cName);
            let inputToCheck = validReq[Const.Settings.VALIDATION_REQUEST_INPUT.INPUT];

            for(let i = 0; i < inputToCheck.length; i++)
            {
                if
                (
                    typeof inputToCheck[i] === 'object' &&
                    typeof inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.KEY_PATH] === 'string' &&
                    inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.VALUE] !== undefined
                )
                {
                    let keyPath = inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.KEY_PATH];
                    let value   = inputToCheck[i][Const.Settings.VALIDATION_REQUEST_INPUT.VALUE];





                }
                else
                {
                    throw new TaskError(MainErrors.wrongInputData);
                }
            }
        }
        else
        {
            throw new TaskError(MainErrors.wrongInputData);
        }
    }
}

module.exports = ValidChProcessor;