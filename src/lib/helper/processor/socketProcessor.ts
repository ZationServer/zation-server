/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ValidChProcessor      = require('./validChProcessor');
import ZationReqTools        = require('../tools/zationReqTools');
import ZationWorker          = require("../../main/zationWorker");
import ZationConfig          = require("../../main/zationConfig");
import Logger                = require("../logger/logger");
import {Socket}                from "../sc/socket";
import {SHBridgeSocket} from "../bridges/shBridgeSocket";

class SocketProcessor
{
    //SOCKET Extra Layer
    static async runSocketProcess(socket : Socket, input, respond, zc : ZationConfig, worker : ZationWorker,reqId : string)
    {
        Logger.printDebugInfo(`Socket Request id: ${reqId} -> `,input,true);

        if(zc.mainConfig.logRequests){
            Logger.logFileInfo(`Socket Request id: ${reqId} -> `,input,true);
        }

        //check for validationCheckRequest
        if(ZationReqTools.isValidationCheckReq(input))
        {
            //validation Check req
            return await ValidChProcessor.process(input,zc,worker);
        }
        else {
            //normal Req
            return new SHBridgeSocket(socket,reqId,input);
        }
    }

}

export = SocketProcessor;