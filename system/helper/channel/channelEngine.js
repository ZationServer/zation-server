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

const Const           = require('./../constante/constWrapper');
const ChExchangeEngine  = require('./chExchangeEngine');

class ChannelEngine extends ChExchangeEngine
{
    constructor()
    {
        super(scServer);
    }

    emitToSocket(eventName,data,cb)
    {
        this._socket.emit(eventName,data,cb);
    }
}

module.exports = ChannelEngine;
