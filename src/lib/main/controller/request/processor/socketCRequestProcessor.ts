/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import SHBridgeSocket        from "../bridges/shBridgeSocket";
import UpSocket              from "../../../sc/socket";
import ZationConfig          from "../../../config/manager/zationConfig";
import Logger                from "../../../log/logger";
import ControllerReqUtils    from "../controllerReqUtils";

export default class SocketCRequestProcessor
{
    private readonly zc: ZationConfig;
    private readonly defaultApiLevel: number;
    private readonly debug: boolean;

    constructor(zc: ZationConfig) {
        this.zc = zc;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
        this.debug = this.zc.isDebug();
    }

    //SOCKET Extra Layer
    async prepareReq(socket: UpSocket, input, respond, reqId: string): Promise<SHBridgeSocket>
    {
        //performance boost
        if(this.debug)
            Logger.log.debug(`Socket Controller Request id: ${reqId} -> `,input);

        //check for validationCheckRequest
        return new SHBridgeSocket(socket,reqId,input,ControllerReqUtils.isValidationCheckReq(input),this.defaultApiLevel);
    }

}

