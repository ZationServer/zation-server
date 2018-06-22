/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description :
This class is for the Bag, it extends the ExchangeEngine and ads
personal socket functionality.
 */

const ChExchangeEngine  = require('./chExchangeEngine');

class ChannelEngine extends ChExchangeEngine
{
    constructor(scServer,shBridge)
    {
        super(scServer);
        this._socket = shBridge.getSocket();
        this._isSocket = shBridge.isSocket();
    }

    emitToSocket(eventName,data,cb)
    {
        if(this._isSocket)
        {
            this._socket.emit(eventName,data,cb);
        }
    }
}

module.exports = ChannelEngine;
