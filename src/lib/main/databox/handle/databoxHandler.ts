/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RespondFunction}           from "../../sc/socket";
import DataboxPrepare              from "../databoxPrepare";
import ZationConfig                from "../../config/manager/zationConfig";
import DataboxCore                 from "../../../api/databox/DataboxCore";
import {
    DataboxConnectReq,
    DataboxConnectRes,
} from "../dbDefinitions";
import {ClientErrorName}           from "../../definitions/clientErrorName";
import Logger                      from "../../log/logger";
import Socket                      from '../../../api/Socket';
import {isValidDataboxConnectionRequest} from './databoxReqUtils';
import ApiLevelUtils                     from '../../apiLevel/apiLevelUtils';

export default class DataboxHandler
{
    private readonly dbPrepare: DataboxPrepare;
    private readonly defaultApiLevel: number;
    private readonly socketDataboxLimit: number;
    private readonly debug: boolean;

    constructor(dbPrepare: DataboxPrepare, zc: ZationConfig) {
        this.dbPrepare = dbPrepare;
        this.defaultApiLevel = zc.mainConfig.defaultClientApiLevel;
        this.socketDataboxLimit = zc.mainConfig.socketDataboxLimit;
        this.debug = zc.isDebug();
    }

    async processConnectReq(input: DataboxConnectReq, socket: Socket, respond: RespondFunction): Promise<void> {
        try {await this._processConnectReq(input,socket, data => respond(null,data))}
        catch (err) {respond(err);}
    }

    private async _processConnectReq(request: DataboxConnectReq, socket: Socket, sendResponse: (response: DataboxConnectRes) => void): Promise<void>
    {
        //check request valid
        if(!isValidDataboxConnectionRequest(request)) {
            const err: any = new Error(`Not valid req structure.`);
            err.name = ClientErrorName.InvalidRequest;
            throw err;
        }

        if(this.debug) Logger.log.debug(`Databox Connection Request -> `,request);

        //throws if not exists or api level is incompatible
        const db: DataboxCore = this.dbPrepare.get((request.d as string),
            (ApiLevelUtils.parsePacketApiLevel(request.a) || socket.connectionApiLevel || this.defaultApiLevel));

        if(socket.getDataboxes().length > this.socketDataboxLimit){
            const err: any = new Error(`Limit of Databoxes for this socket is reached.`);
            err.name = ClientErrorName.DataboxLimitReached;
            throw err;
        }

        await db._handleConRequest(socket,request,sendResponse);
    }

}