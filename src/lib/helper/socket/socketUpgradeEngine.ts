/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import UpSocket             from "../sc/socket";
import SidBuilder         from "../utils/sidBuilder";
import BaseShBridgeSocket from "../bridges/baseShBridgeSocket";
import AuthEngine         from "../auth/authEngine";
import SocketInfo         from "../infoObjects/socketInfo";
import ZationWorker     = require("../../main/zationWorker");
import Mapper             from "../utils/mapper";
import SocketSet          from "../utils/socketSet";
import {ZationToken}      from "../constants/internal";
import ChAccessHelper     from "../channel/chAccessHelper";
import {ChannelPrepare}   from "../channel/channelPrepare";

export default class SocketUpgradeEngine
{

    private readonly worker : ZationWorker;
    private readonly sidBuilder : SidBuilder;
    private readonly channelPrepare : ChannelPrepare;

    private mapUserIdToSc : Mapper<UpSocket>;
    private mapTokenIdToSc : Mapper<UpSocket>;
    private mapAuthUserGroupToSc : Mapper<UpSocket>;
    private defaultUserGroupSet : SocketSet;
    private panelUserSet : SocketSet;

    constructor(worker : ZationWorker,channelPrepare : ChannelPrepare) {
        this.worker = worker;
        this.sidBuilder = new SidBuilder(worker.options.instanceId,worker.id);
        this.channelPrepare = channelPrepare;

        this.mapUserIdToSc = worker.getUserIdToScMapper();
        this.mapTokenIdToSc = worker.getTokenIdToScMapper();
        this.mapAuthUserGroupToSc = worker.getAuthUserGroupToScMapper();
        this.defaultUserGroupSet = worker.getDefaultUserGroupSet();
        this.panelUserSet = worker.getPanelUserSet();
    }

    /**
     * Upgrades the sc socket with zation functionality.
     * @param socket
     */
    upgradeSocket(socket : UpSocket) {
        //id build
        socket.sid = this.sidBuilder.buildSid(socket.id);
        socket.tid = Date.now() + socket.id;

        //engine build
        const baseSHBridge = new BaseShBridgeSocket(socket);
        socket.baseSHBridge = baseSHBridge;

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

            set: (newToken : ZationToken) => {
                authEngine.refresh(newToken);

                (async () => {
                    const p = ChAccessHelper.checkSocketCustomChAccess(socket,this.channelPrepare);
                    ChAccessHelper.checkSocketZationChAccess(socket);
                    await p;
                })();

                //update worker map and recheck
                if(newToken !== null) {
                    if(currentToken === null) {
                        //new authenticated remove from default and map to the other maps
                        //that requires a token.
                        this.defaultUserGroupSet.remove(socket);

                        if(newToken.zationAuthUserGroup !== undefined){
                            this.mapAuthUserGroupToSc.map(newToken.zationAuthUserGroup,socket);
                        }

                        this.mapTokenIdToSc.map(newToken.zationTokenId,socket);

                        if(newToken.zationUserId !== undefined){
                            this.mapUserIdToSc.map(newToken.zationUserId.toString(),socket);
                        }

                        if(typeof newToken.zationOnlyPanelToken === 'boolean' && newToken.zationOnlyPanelToken){
                            this.panelUserSet.add(socket);
                        }
                    }
                    else {
                        //updated authentication
                        //check for changes and update map
                        if(newToken.zationAuthUserGroup !== currentToken.zationAuthUserGroup) {
                            this.mapAuthUserGroupToSc.unMap(currentToken.zationAuthUserGroup,socket);
                            if(newToken.zationAuthUserGroup !== undefined){
                                this.mapAuthUserGroupToSc.map(newToken.zationAuthUserGroup,socket);
                            }
                        }
                        //token id can not be changed.

                        //Only one '=' (userId can be a number or string)
                        if(newToken.zationUserId != currentToken.zationUserId){
                            if(currentToken.zationUserId !== undefined){
                                this.mapUserIdToSc.unMap(currentToken.zationUserId.toString(),socket);
                            }
                            if(newToken.zationUserId !== undefined){
                                this.mapUserIdToSc.map(newToken.zationUserId.toString(),socket);
                            }
                        }
                        if(newToken.zationOnlyPanelToken !== currentToken.zationOnlyPanelToken) {
                            if(typeof newToken.zationOnlyPanelToken === 'boolean' && newToken.zationOnlyPanelToken){
                                this.panelUserSet.add(socket);
                            }
                            else {
                                this.panelUserSet.remove(socket);
                            }
                        }
                    }
                }
                else {
                    //add to default group
                    this.defaultUserGroupSet.add(socket);
                    if(currentToken !== null) {
                        //Deauthenticated remove from other mappings that requires a token
                        //if the old token was a token.
                        this.mapAuthUserGroupToSc.unMap(currentToken.zationAuthUserGroup,socket);
                        this.mapTokenIdToSc.unMap(currentToken.zationTokenId,socket);
                        if(currentToken.zationUserId !== undefined){
                            this.mapUserIdToSc.unMap(currentToken.zationUserId.toString(),socket);
                        }
                        this.panelUserSet.remove(socket);
                    }
                }

                currentToken = newToken;
            },
            enumerable: true,
            configurable: true
        });

        //fire update init event
        socket.authToken = currentToken;
    }

}