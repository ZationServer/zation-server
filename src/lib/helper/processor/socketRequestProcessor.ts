/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import SHBridgeSocket        from "../bridges/shBridgeSocket";
import UpSocket              from "../sc/socket";
import ZationConfig          from "../configManager/zationConfig";
import Logger                from "../logger/logger";
import ZationReqUtils        from "../utils/zationReqUtils";

export default class SocketRequestProcessor
{
    private readonly zc : ZationConfig;
    private readonly defaultApiLevel : number;
    private readonly debug : boolean;

    constructor(zc : ZationConfig) {
        this.zc = zc;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
        this.debug = this.zc.isDebug();
    }

    //SOCKET Extra Layer
    async prepareReq(socket : UpSocket, input, respond, reqId : string)
    {
        if(this.debug){
            Logger.printDebugInfo(`Socket Request id: ${reqId} -> `,input,true);
        }
        if(this.zc.mainConfig.logRequests){
            Logger.logFileInfo(`Socket Request id: ${reqId} -> `,input,true);
        }

        //check for validationCheckRequest
        return new SHBridgeSocket(socket,reqId,input,ZationReqUtils.isValidationCheckReq(input),this.defaultApiLevel);
    }

}

