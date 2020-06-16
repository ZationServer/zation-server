/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection ES6PreferShortImport
import {RawSocket}        from '../sc/socket';
import SidBuilder         from "../utils/sidBuilder";
import Socket             from "../../api/Socket";
import ZationWorker     = require("../../core/zationWorker");
import AuthConfig         from '../auth/authConfig';

export default class RawSocketUpgradeFactory
{
    private readonly worker: ZationWorker;
    private readonly sidBuilder: SidBuilder;

    constructor(worker: ZationWorker, private authConfig: AuthConfig) {
        this.worker = worker;
        this.sidBuilder = new SidBuilder(worker.options.instanceId,worker.id);
    }

    /**
     * Upgrades the raw socket with zation functionality.
     * @param rawSocket
     */
    upgrade(rawSocket: RawSocket): asserts rawSocket is RawSocket {
        rawSocket[nameof<RawSocket>(s => s.sid)] = this.sidBuilder.buildSid(rawSocket.id);
        rawSocket[nameof<RawSocket>(s => s.tid)] = Date.now() + rawSocket.id;

        const socket = new Socket(rawSocket,this.authConfig);
        socket._addBeforeTokenChangeHandler((token, newToken) =>
            this.worker.updateSocketTokenMaps(token,newToken,socket));

        rawSocket[nameof<RawSocket>(s => s._socket)] = socket;
    }

}