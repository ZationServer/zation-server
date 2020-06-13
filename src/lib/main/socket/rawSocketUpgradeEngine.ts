/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RawSocket}        from '../sc/socket';
import SidBuilder         from "../utils/sidBuilder";
import AuthEngine         from "../auth/authEngine";
import Socket             from "../../api/socket";
import ZationWorker     = require("../../core/zationWorker");
import Mapper             from "../utils/mapper";
import SocketSet          from "../utils/socketSet";
import {RawZationToken}   from "../constants/internal";

export default class RawSocketUpgradeEngine
{

    private readonly worker: ZationWorker;
    private readonly sidBuilder: SidBuilder;

    private mapUserIdToSc: Mapper<RawSocket>;
    private mapTokenIdToSc: Mapper<RawSocket>;
    private mapAuthUserGroupToSc: Mapper<RawSocket>;
    private defaultUserGroupSet: SocketSet;
    private panelUserSet: SocketSet;

    constructor(worker: ZationWorker) {
        this.worker = worker;
        this.sidBuilder = new SidBuilder(worker.options.instanceId,worker.id);

        this.mapUserIdToSc = worker.getUserIdToScMapper();
        this.mapTokenIdToSc = worker.getTokenIdToScMapper();
        this.mapAuthUserGroupToSc = worker.getAuthUserGroupToScMapper();
        this.defaultUserGroupSet = worker.getDefaultUserGroupSet();
        this.panelUserSet = worker.getPanelUserSet();
    }

    /**
     * Upgrades the raw socket with zation functionality.
     * @param socket
     */
    upgradeRawSocket(socket: RawSocket): asserts socket is RawSocket {
        //ids build
        socket[nameof<RawSocket>(s => s.sid)] = this.sidBuilder.buildSid(socket.id);
        socket[nameof<RawSocket>(s => s.tid)] = Date.now() + socket.id;

        socket[nameof<RawSocket>(s => s._socket)] = new Socket(socket as RawSocket);

        //init
        socket[nameof<RawSocket>(s => s.zationSocketVariables)] = {};
        socket[nameof<RawSocket>(s => s.databoxes)] = [];
        socket[nameof<RawSocket>(s => s.channels)] = [];

        const authEngine = new AuthEngine(socket as RawSocket,this.worker);
        socket[nameof<RawSocket>(s => s.authEngine)] = authEngine;

        //token observer
        //for update the authEngine and worker socket mapper
        const initToken = socket.authToken;
        let currentToken: RawZationToken | null = null;
        Object.defineProperty(socket, 'authToken', {
            get: () => {
                return currentToken;
            },

            /**
             * @param newToken
             * Notice that the token expire can be undefined of the new token.
             * (SC sets the token and then sign the token)
             */
            set: (newToken: RawZationToken | null) => {
                if(newToken === undefined) newToken = null;

                authEngine.refresh(newToken);

                (async () => {
                    const p: Promise<void>[] = [];
                    const checkObjectives = [...socket.databoxes,...socket.channels];
                    for(let i = 0; i < checkObjectives.length; i++) {
                        p.push(checkObjectives[i]._checkSocketHasStillAccess(socket));
                    }
                    await Promise.all(p);
                })();

                //update worker map and recheck
                if(newToken != null) {
                    if(currentToken == null) {
                        //new authenticated remove from default and map to the other maps
                        //that requires a token.
                        this.defaultUserGroupSet.remove(socket);

                        if(newToken.authUserGroup !== undefined){
                            this.mapAuthUserGroupToSc.map(newToken.authUserGroup,socket);
                        }

                        this.mapTokenIdToSc.map(newToken.tid,socket);

                        if(newToken.userId !== undefined){
                            this.mapUserIdToSc.map(newToken.userId.toString(),socket);
                        }

                        if(typeof newToken.onlyPanelToken === 'boolean' && newToken.onlyPanelToken){
                            this.panelUserSet.add(socket);
                        }
                    }
                    else {
                        //updated authentication
                        //check for changes and update map
                        if(newToken.authUserGroup !== currentToken.authUserGroup) {
                            this.mapAuthUserGroupToSc.unMap(currentToken.authUserGroup,socket);
                            if(newToken.authUserGroup !== undefined){
                                this.mapAuthUserGroupToSc.map(newToken.authUserGroup,socket);
                            }
                        }
                        //token id can not be changed.

                        //Only one '=' (userId can be a number or string)
                        if(newToken.userId != currentToken.userId){
                            if(currentToken.userId !== undefined){
                                this.mapUserIdToSc.unMap(currentToken.userId.toString(),socket);
                            }
                            if(newToken.userId !== undefined){
                                this.mapUserIdToSc.map(newToken.userId.toString(),socket);
                            }
                        }
                        if(newToken.onlyPanelToken !== currentToken.onlyPanelToken) {
                            if(typeof newToken.onlyPanelToken === 'boolean' && newToken.onlyPanelToken){
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
                    if(currentToken != null) {
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