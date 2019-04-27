/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Socket             from "../sc/socket";
import SidBuilder         from "../utils/sidBuilder";
import BaseShBridgeSocket from "../bridges/baseShBridgeSocket";
import ChannelEngine      from "../channel/channelEngine";
import AuthEngine         from "../auth/authEngine";
import SocketInfo         from "../infoObjects/socketInfo";
import ZationWorker = require("../../main/zationWorker");

export default class SocketUpgradeEngine
{

    private readonly worker : ZationWorker;
    private readonly sidBuilder : SidBuilder;

    constructor(worker : ZationWorker) {
        this.worker = worker;
        this.sidBuilder = new SidBuilder(worker.options.instanceId,worker.id);
    }

    /**
     * Upgrades the sc socket with zation functionality.
     * @param socket
     */
    upgradeSocket(socket : Socket) {
        //id build
        socket.sid = this.sidBuilder.buildSid(socket.id);
        socket.tid = Date.now() + socket.id;

        //engine build
        const baseSHBridge = new BaseShBridgeSocket(socket);
        socket.baseSHBridge = baseSHBridge;

        socket.channelEngine = new ChannelEngine(this.worker,baseSHBridge);

        const authEngine = new AuthEngine(baseSHBridge,this.worker);
        socket.authEngine = authEngine;

        socket.socketInfo = new SocketInfo(socket);

        //socket variables
        socket.zationSocketVariables = {};

        //token observer
        //for update the authEngine and worker socket mapper
        let currentToken = socket.authToken;
        Object.defineProperty(socket, 'authToken', {
            get: () => {
                return currentToken;
            },

            set: (newToken) => {

                authEngine.refresh(newToken);



                /*
                if(shBridge.isWebSocket()) {
                    await chAccessEngine.checkSocketCustomChAccess(shBridge.getSocket());
                }

                 */

                //update worker map
                //check custom ch access
                // check zation ch access

                currentToken = newToken;
            },
            enumerable: true,
            configurable: true
        });

        //fire update init event
        socket.authToken = currentToken;
    }

}