/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket           from "../sc/socket";
import SidBuilder         from "../utils/sidBuilder";
import BaseSHBridgeSocket from "../bridges/baseSHBridgeSocket";
import AuthEngine         from "../auth/authEngine";
import ZSocket            from "../internalApi/ZSocket";
import ZationWorker     = require("../../core/zationWorker");
import Mapper             from "../utils/mapper";
import SocketSet          from "../utils/socketSet";
import {ZationToken}      from "../constants/internal";
import ChAccessHelper     from "../channel/chAccessHelper";
import {ChannelPrepare}   from "../channel/channelPrepare";
import DataboxAccessHelper from "../databox/databoxAccessHelper";

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
        // @ts-ignore
        socket.sid = this.sidBuilder.buildSid(socket.id);
        // @ts-ignore
        socket.tid = Date.now() + socket.id;

        //engine build
        const baseSHBridge = new BaseSHBridgeSocket(socket);
        // @ts-ignore
        socket.baseSHBridge = baseSHBridge;

        const authEngine = new AuthEngine(baseSHBridge,this.worker);
        // @ts-ignore
        socket.authEngine = authEngine;

        // @ts-ignore
        socket.zSocket = new ZSocket(socket);

        //socket variables
        // @ts-ignore
        socket.zationSocketVariables = {};

        //databoxes
        socket.databoxes = [];

        //token observer
        //for update the authEngine and worker socket mapper
        const initToken = socket.authToken;
        let currentToken : ZationToken | null = null;
        Object.defineProperty(socket, 'authToken', {
            get: () => {
                return currentToken;
            },

            set: (newToken : ZationToken) => {
                authEngine.refresh(newToken);

                (async () => {
                    const p : Promise<void>[] = [];
                    p.push(ChAccessHelper.checkSocketCustomChAccess(socket,this.channelPrepare));
                    p.push(DataboxAccessHelper.checkSocketDataboxAccess(socket));
                    ChAccessHelper.checkSocketZationChAccess(socket);
                    await Promise.all(p);
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
                        this.worker.unmapSocketToken(currentToken,socket);
                    }
                }

                currentToken = newToken;
            },
            enumerable: true,
            configurable: true
        });

        //fire update with init token
        socket.authToken = initToken;
    }

}