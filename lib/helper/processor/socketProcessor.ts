/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const MainProcessor         = require('./mainProcessor');
const ValidChProcessor      = require('./validChProcessor');
const SHBridge              = require('../bridges/shBridge');
const ZationReqTools        = require('../tools/zationReqTools');

class SocketProcessor
{
    //SOCKET Extra Layer
    static async runSocketProcess({socket, input, respond, zc, worker})
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

module.exports = SocketProcessor;