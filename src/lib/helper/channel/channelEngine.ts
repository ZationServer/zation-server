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

import ChExchangeEngine  = require('./chExchangeEngine');
import ChTools           = require('./chTools');
import SHBridge          = require("../bridges/shBridge");

class ChannelEngine extends ChExchangeEngine
{
    private readonly socket : any;
    private readonly isWebSocket : boolean;
    
    constructor(scServer : any,shBridge : SHBridge)
    {
        super(scServer);
        this.socket = shBridge.getSocket();
        this.isWebSocket = shBridge.isWebSocket();
    }

    emitToSocket(eventName : string,data : any,cb ?: Function) : void
    {
        if(this.isWebSocket)
        {
            this.socket.emit(eventName,data,cb);
        }
    }

    getSubChannels() : any[] | undefined
    {
        if(this.isWebSocket)
        {
            return this.socket.subscriptions();
        }
        else
        {
            return undefined;
        }
    }

    kickWithIndex(search : string) : boolean
    {
        if(this.isWebSocket)
        {
            let subs : any = this.getSubChannels();
            for(let i = 0; i < subs.length; i++)
            {
                if(subs[i].indexOf(search)!== -1)
                {
                    ChTools.kickOut(this.socket,search);
                }
            }
            return true;
        }
        return false;
    }


    kickCustomIdChannel(name : string,id : string) : void
    {
        this.kickWithIndex(ChTools.buildCustomIdChannelName(name,id));
    }

    kickCustomChannel(name : string) : void
    {
        this.kickWithIndex(ChTools.buildCustomChannelName(name));
    }

}

export = ChannelEngine;
