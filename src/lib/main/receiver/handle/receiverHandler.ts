/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker              = require('../../../core/zationWorker');
// noinspection ES6PreferShortImport
import {RawSocket}                 from '../../sc/socket';
import BackError                   from '../../../api/BackError';
import BackErrorBag                from '../../../api/BackErrorBag';
import Logger                      from '../../log/logger';
import ZationConfigFull            from '../../config/manager/zationConfigFull';
import {MainBackErrors}            from '../../zationBackErrors/mainBackErrors';
import AuthEngine                  from '../../auth/authEngine';
import RequestBag                  from '../../../api/RequestBag';
import ApiLevelUtils               from '../../apiLevel/apiLevelUtils';
import ReceiverPrepare             from '../receiverPrepare';
import {ReceiverPackage}           from '../receiverDefinitions';
import {checkValidReceiverPackage} from './receiverPackageUtils';
import {handleError}               from '../../error/errorHandlerUtils';

export default class ReceiverHandler
{
    private readonly zc: ZationConfigFull;
    private readonly worker: ZationWorker;
    private readonly receiverPrepare: ReceiverPrepare;

    //tmp variables for faster access
    private readonly defaultApiLevel: number;
    private readonly debug: boolean;

    constructor(receiverPrepare: ReceiverPrepare,worker: ZationWorker) {
        this.zc = worker.getZationConfig();
        this.worker = worker;
        this.receiverPrepare = receiverPrepare

        this.defaultApiLevel = this.zc.mainConfig.defaultClientApiLevel;
        this.debug = this.zc.isDebug();
    }

    async processPackage(pack: ReceiverPackage, socket: RawSocket)
    {
        try {
            await this._processPackage(pack,socket);
        }
        catch (err) {
            await handleError(err,this.zc.event);
        }

        if(this.debug) {
            Logger.log.debug(`Socket Receiver package -> `,pack);
        }
    }

    private async _processPackage(pack: ReceiverPackage, socket: RawSocket) {
        if(checkValidReceiverPackage(pack)) {

            const reqApiLevel = ApiLevelUtils.parseRequestApiLevel(pack.a);

            //throws if not exists or api level is incompatible
            const rInstance = this.receiverPrepare.get(pack.r, (reqApiLevel || socket.apiLevel || this.defaultApiLevel));

            const {
                systemAccessCheck,
                versionAccessCheck,
                tokenStateCheck,
                handleMiddlewareInvoke,
                inputConsume,
                finallyHandle,
            } = rInstance._preparedData;

            if(!systemAccessCheck(socket)){
                throw new BackError(MainBackErrors.noAccessWithSystem,{system: socket.clientSystem});
            }
            if(!versionAccessCheck(socket)){
                throw new BackError(MainBackErrors.noAccessWithVersion,{version: socket.clientVersion});
            }

            const authEngine: AuthEngine = socket.authEngine;

            //check access to receiver
            if(await tokenStateCheck(authEngine)) {

                let input: object;
                try {
                    input = await inputConsume(pack.d);
                }
                catch (err) {
                    //invoke controller invalid input function
                    if(err instanceof BackError || err instanceof BackErrorBag) {

                        //create backErrorBag
                        const errorBag = new BackErrorBag();
                        if(err instanceof BackError){
                            errorBag.addBackError(err);
                        }
                        else{
                            errorBag.addFromBackErrorBag(err);
                        }
                        err = errorBag;

                        const input = pack.d;
                        const reqBag = new RequestBag(socket,this.worker,input,reqApiLevel);
                        try {
                            await rInstance.invalidInput(reqBag,input,err);
                        }
                        catch (innerErr) {
                            if(innerErr instanceof BackError) {
                                err.addBackError(innerErr);
                            }
                            else if(innerErr instanceof BackErrorBag) {
                                err.addFromBackErrorBag(innerErr);
                            }
                            else {
                                //unknown error
                                throw innerErr;
                            }
                        }
                    }
                    //throw errors to block processing of request.
                    throw err;
                }

                const reqBag = new RequestBag(socket,this.worker,input,reqApiLevel);

                //process the receiver handle, before handle events and finally handle.
                let result;
                try {
                    await handleMiddlewareInvoke(rInstance,reqBag);
                    result = await rInstance.handle(reqBag,input);
                }
                catch(e) {
                    await finallyHandle(reqBag,input);
                    throw e;
                }

                await finallyHandle(reqBag,input);

                return result;
            }
            else {
                throw new BackError(MainBackErrors.noAccessWithTokenState,
                    {
                        authUserGroup: authEngine.getAuthUserGroup(),
                        authIn: authEngine.isAuth(),
                        userId: authEngine.getUserId()
                    });
            }
        }
        else {
            throw new BackError(MainBackErrors.invalidPackage, {input: pack});
        }
    }
}