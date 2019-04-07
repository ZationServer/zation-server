/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationReqTools        = require('../tools/zationReqTools');
import ZationWorker          = require("../../main/zationWorker");
import ZationConfig          = require("../../main/zationConfig");
import Logger                = require("../logger/logger");
import {SHBridgeSocket}        from "../bridges/shBridgeSocket";
import {Socket}                from "../sc/socket";

export default class SocketProcessor
{
    private readonly zc : ZationConfig;
    private readonly debug : boolean;
    private readonly worker : ZationWorker;

    constructor(zc : ZationConfig,worker : ZationWorker) {
        this.zc = zc;
        this.debug = this.zc.isDebug();
        this.worker = worker;
    }

    //SOCKET Extra Layer
    async prepareReq(socket : Socket, input, respond,reqId : string)
    {
        if(this.debug){
            Logger.printDebugInfo(`Socket Request id: ${reqId} -> `,input,true);
        }
        if(this.zc.mainConfig.logRequests){
            Logger.logFileInfo(`Socket Request id: ${reqId} -> `,input,true);
        }

        //check for validationCheckRequest
        return new SHBridgeSocket(socket,reqId,input,ZationReqTools.isValidationCheckReq(input));
    }

}

