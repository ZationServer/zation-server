/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const MainProcessor         = require('./mainProcessor');
const SHBridge              = require('../bridges/shBridge');

class SocketProcessor
{
    //SOCKET Extra Layer
    static async runSocketProcess({socket, input, respond, zc, worker})
    {
        let shBridge = new SHBridge(
            {
                isSocket : true,
                socketData : input,
                socketRespond : respond,
                socket : socket
            });

        return await MainProcessor.process(shBridge,zc,worker);
    }

}

module.exports = SocketProcessor;