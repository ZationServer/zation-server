/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket, {RawSocket} from '../sc/socket';
import SidBuilder         from "../utils/sidBuilder";
import AuthEngine         from "../auth/authEngine";
import ZSocket            from "../internalApi/zSocket";
import ZationWorker     = require("../../core/zationWorker");
import Mapper             from "../utils/mapper";
import SocketSet          from "../utils/socketSet";
import {ZationToken}      from "../constants/internal";

export default class SocketUpgradeEngine
{

    private readonly worker: ZationWorker;
    private readonly sidBuilder: SidBuilder;

    private mapUserIdToSc: Mapper<UpSocket>;
    private mapTokenIdToSc: Mapper<UpSocket>;
    private mapAuthUserGroupToSc: Mapper<UpSocket>;
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
     * Upgrades the sc socket with zation functionality.
     * @param socket
     */
    upgradeSocket(socket: RawSocket): asserts socket is UpSocket {
        //ids build
        socket[nameof<UpSocket>(s => s.sid)] = this.sidBuilder.buildSid(socket.id);
        socket[nameof<UpSocket>(s => s.tid)] = Date.now() + socket.id;

        socket[nameof<UpSocket>(s => s.zSocket)] = new ZSocket(socket as UpSocket);

        //init
        socket[nameof<UpSocket>(s => s.zationSocketVariables)] = {};
        socket[nameof<UpSocket>(s => s.databoxes)] = [];
        socket[nameof<UpSocket>(s => s.channels)] = [];

        const authEngine = new AuthEngine(socket as UpSocket,this.worker);
        socket[nameof<UpSocket>(s => s.authEngine)] = authEngine;

        //token observer
        //for update the authEngine and worker socket mapper
        const initToken = socket.authToken;
        let currentToken: ZationToken | null = null;
        Object.defineProperty(socket, 'authToken', {
            get: () => {
                return currentToken;
            },

            /**
             * @param newToken
             * Notice that the token expire can be undefined of the new token.
             * (SC sets the token and then sign the token)
             */
            set: (newToken: ZationToken) => {
                authEngine.refresh(newToken);

                (async () => {
                    const p: Promise<void>[] = [];
                    const checkObjectives = [...(socket as UpSocket).databoxes,...(socket as UpSocket).channels];
                    for(let i = 0; i < checkObjectives.length; i++) {
                        p.push(checkObjectives[i]._checkSocketHasStillAccess(socket as UpSocket));
                    }
                    await Promise.all(p);
                })();

                //update worker map and recheck
                if(newToken !== null) {
                    if(currentToken === null) {
                        //new authenticated remove from default and map to the other maps
                        //that requires a token.
                        this.defaultUserGroupSet.remove(socket as UpSocket);

                        if(newToken.authUserGroup !== undefined){
                            this.mapAuthUserGroupToSc.map(newToken.authUserGroup,socket as UpSocket);
                        }

                        this.mapTokenIdToSc.map(newToken.tid,socket as UpSocket);

                        if(newToken.userId !== undefined){
                            this.mapUserIdToSc.map(newToken.userId.toString(),socket as UpSocket);
                        }

                        if(typeof newToken.onlyPanelToken === 'boolean' && newToken.onlyPanelToken){
                            this.panelUserSet.add(socket as UpSocket);
                        }
                    }
                    else {
                        //updated authentication
                        //check for changes and update map
                        if(newToken.authUserGroup !== currentToken.authUserGroup) {
                            this.mapAuthUserGroupToSc.unMap(currentToken.authUserGroup,socket as UpSocket);
                            if(newToken.authUserGroup !== undefined){
                                this.mapAuthUserGroupToSc.map(newToken.authUserGroup,socket as UpSocket);
                            }
                        }
                        //token id can not be changed.

                        //Only one '=' (userId can be a number or string)
                        if(newToken.userId != currentToken.userId){
                            if(currentToken.userId !== undefined){
                                this.mapUserIdToSc.unMap(currentToken.userId.toString(),socket as UpSocket);
                            }
                            if(newToken.userId !== undefined){
                                this.mapUserIdToSc.map(newToken.userId.toString(),socket as UpSocket);
                            }
                        }
                        if(newToken.onlyPanelToken !== currentToken.onlyPanelToken) {
                            if(typeof newToken.onlyPanelToken === 'boolean' && newToken.onlyPanelToken){
                                this.panelUserSet.add(socket as UpSocket);
                            }
                            else {
                                this.panelUserSet.remove(socket as UpSocket);
                            }
                        }
                    }
                }
                else {
                    //add to default group
                    this.defaultUserGroupSet.add(socket as UpSocket);
                    if(currentToken !== null) {
                        //Deauthenticated remove from other mappings that requires a token
                        //if the old token was a token.
                        this.worker.unmapSocketToken(currentToken,socket as UpSocket);
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