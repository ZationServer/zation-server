/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection ES6PreferShortImport
import BackError                   from '../../../api/BackError';
import BackErrorBag                from '../../../api/BackErrorBag';
import Logger                      from '../../log/logger';
import ZationConfigFull            from '../../config/manager/zationConfigFull';
import {MainBackErrors}            from '../../zationBackErrors/mainBackErrors';
import ApiLevelUtils               from '../../apiLevel/apiLevelUtils';
import ReceiverPrepare             from '../receiverPrepare';
import {ReceiverPackage}           from '../receiverDefinitions';
import {checkValidReceiverPackage} from './receiverPackageUtils';
import {handleError}               from '../../error/errorHandlerUtils';
import Socket                      from '../../../api/Socket';
import Packet                      from '../../../api/Packet';

export default class ReceiverHandler
{
    private readonly zc: ZationConfigFull;
    private readonly receiverPrepare: ReceiverPrepare;

    //tmp variables for faster access
    private readonly defaultApiLevel: number;
    private readonly debug: boolean;

    constructor(receiverPrepare: ReceiverPrepare,zc: ZationConfigFull) {
        this.zc = zc;
        this.receiverPrepare = receiverPrepare

        this.defaultApiLevel = this.zc.mainConfig.defaultClientApiLevel;
        this.debug = this.zc.isDebug();
    }

    async processPackage(pack: ReceiverPackage, socket: Socket)
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

    private async _processPackage(pack: ReceiverPackage, socket: Socket) {
        if(checkValidReceiverPackage(pack)) {

            const packetApiLevel = ApiLevelUtils.parsePacketApiLevel(pack.a);

            //throws if not exists or api level is incompatible
            const rInstance = this.receiverPrepare.get(pack.r, (packetApiLevel || socket.connectionApiLevel || this.defaultApiLevel));

            const {
                systemAccessCheck,
                versionAccessCheck,
                tokenStateCheck,
                handleMiddlewareInvoke,
                inputConsume
            } = rInstance._preparedData;

            if(!systemAccessCheck(socket)){
                throw new BackError(MainBackErrors.noAccessWithSystem,{system: socket.clientSystem});
            }
            if(!versionAccessCheck(socket)){
                throw new BackError(MainBackErrors.noAccessWithVersion,{version: socket.clientVersion});
            }

            //check access to receiver
            if(await tokenStateCheck(socket)) {
                const packet = new Packet(pack.d,packetApiLevel);
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
                        try {
                            await rInstance.invalidInput(socket,input,packet,err);
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

                //process the receiver handle, before handle events and finally handle.
                let result;
                try {
                    await handleMiddlewareInvoke(rInstance,socket,packet);
                    result = await rInstance.handle(socket,input,packet);
                }
                catch(e) {throw e;}

                return result;
            }
            else {
                throw new BackError(MainBackErrors.noAccessWithTokenState,
                    {
                        authUserGroup: socket.authUserGroup,
                        authIn: socket.isAuthenticated(),
                        userId: socket.userId
                    });
            }
        }
        else {
            throw new BackError(MainBackErrors.invalidPackage, {input: pack});
        }
    }
}