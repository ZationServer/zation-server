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
const ChTools           = require('./chTools');

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

    getSubChannels()
    {
        if(this._isSocket)
        {
            return this._socket.subscriptions();
        }
        else
        {
            return undefined;
        }
    }

    kickWithIndex(search)
    {
        if(this._isSocket)
        {
            let subs = this.getSubChannels();
            for(let i = 0; i < subs.length; i++)
            {
                if(subs[i].indexOf(search)!== -1)
                {
                    ChTools.kickOut(this._socket,search);
                }
            }
            return true;
        }
        return false;
    }


    kickCustomIdChannel(name,id)
    {
        this.kickWithIndex(ChTools.buildCustomIdChannelName(name,id));
    }

    kickCustomChannel(name)
    {
        this.kickWithIndex(ChTools.buildCustomChannelName(name));
    }

}

module.exports = ChannelEngine;
