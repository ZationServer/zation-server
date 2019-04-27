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

import ZationWorker      = require("../../main/zationWorker");
import BaseSHBridge      from "../bridges/baseSHBridge";
import ChExchangeEngine  from "./chExchangeEngine";
import ChUtils           from "./chUtils";
import Socket            from "../sc/socket";

export default class ChannelEngine extends ChExchangeEngine
{
    private readonly socket : Socket;
    private readonly isWebSocket : boolean;

    constructor(worker : ZationWorker,shBridge : BaseSHBridge)
    {
        super(worker);
        this.socket = shBridge.getSocket();
        this.isWebSocket = shBridge.isWebSocket();
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
        if(this.isWebSocket) {
            let subs : any = this.getSubChannels();
            for(let i = 0; i < subs.length; i++) {
                if(subs[i].indexOf(search)!== -1) {
                    ChUtils.kickOut(this.socket,search);
                }
            }
        }
    }


    kickCustomIdChannel(name : string,id : string) : void {
        this.kickWithIndex(ChUtils.buildCustomIdChannelName(name,id));
    }

    kickCustomChannel(name : string) : void {
        this.kickWithIndex(ChUtils.buildCustomChannelName(name));
    }

}