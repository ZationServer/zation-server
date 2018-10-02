/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description :
This class is for the Bag, it extends the ExchangeEngine and ads
personal sc functionality.
 */

import ChExchangeEngine  = require('./chExchangeEngine');
import ChTools           = require('./chTools');
import SHBridge          = require("../bridges/shBridge");
import ZationWorker      = require("../../main/zationWorker");

class ChannelEngine extends ChExchangeEngine
{
    private readonly socket : any;
    private readonly isWebSocket : boolean;
    
    constructor(worker : ZationWorker,shBridge : SHBridge)
    {
        super(worker);
        this.socket = shBridge.getSocket();
        this.isWebSocket = shBridge.isWebSocket();
    }

    async emitToSocket(eventName : string,data : any) : Promise<object>
    {
        return new Promise<object>((resolve, reject) =>
        {
            if(this.isWebSocket) {
                this.socket.emit(eventName,data,(err,data) => {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            }
            else {
                reject(new Error(`Can't emit an socket event by an http request!`));
            }
        });
    }

    getSubChannels() : string[]
    {
        if(this.isWebSocket) {
            return this.socket.subscriptions();
        }
        else {
            return [];
        }
    }

    kickWithIndex(search : string) : void
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
        }
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
