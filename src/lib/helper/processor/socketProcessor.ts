/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import MainProcessor         = require('./mainProcessor');
import ValidChProcessor      = require('./validChProcessor');
import SHBridge              = require('../bridges/shBridge');
import ZationReqTools        = require('../tools/zationReqTools');
import ZationWorker = require("../../main/zationWorker");
import ZationConfig = require("../../main/zationConfig");
import {Socket} from "../sc/socket";

class SocketProcessor
{
    //SOCKET Extra Layer
    static async runSocketProcess(socket : Socket, input, respond, zc : ZationConfig, worker : ZationWorker)
    {
        //check for validationCheckRequest
        if(ZationReqTools.isValidationCheckReq(input))
        {
            //validation Check req
            return await ValidChProcessor.process(input,zc,worker);
        }
        else
        {
            //normal Req
            let shBridge = new SHBridge(
                {
                    isWebSocket : true,
                    socketData : input,
                    socketRespond : respond,
                    socket : socket
                },zc);
            return await MainProcessor.process(shBridge,zc,worker);
        }
    }

}

export = SocketProcessor;