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
import {MainBackErrors}            from '../../systemBackErrors/mainBackErrors';
import ApiLevelUtils               from '../../apiLevel/apiLevelUtils';
import ReceiverPrepare             from '../receiverPrepare';
import {ReceiverPackage}           from '../receiverDefinitions';
import {checkValidReceiverPackage} from './receiverPackageUtils';
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
            if(this.debug) Logger.log.debug(`Socket Receiver package -> `,pack, ` processed successfully.`);
        }
        catch (err) {
            if(!(err instanceof BackError || err instanceof BackErrorBag)) {
                Logger.log.error(`Unknown error while processing a receiver package:`,err);
                this.zc.event.error(err);
            }
            if(this.debug) Logger.log.debug(`Socket Receiver package -> `,pack, ` processed not successfully with error -> `, err);
        }
    }

    private async _processPackage(pack: ReceiverPackage, socket: Socket) {
        if(checkValidReceiverPackage(pack)) {

            const packetApiLevel = ApiLevelUtils.parsePacketApiLevel(pack.a);

            //throws if not exists or api level is incompatible
            const rInstance = this.receiverPrepare.get(pack.r, (packetApiLevel || socket.connectionApiLevel || this.defaultApiLevel));

            const {
                checkAccess,
                handleMiddlewareInvoke,
                consumeInput
            } = rInstance._preparedData;

            //check access to receiver
            if(await checkAccess(socket)) {
                const packet = new Packet(pack.d,packetApiLevel);
                let input: object;
                try {
                    input = await consumeInput(pack.d);
                }
                catch (err) {
                    //invoke controller invalid input function
                    if(err instanceof BackError || err instanceof BackErrorBag) {

                        //create backErrorBag
                        const errorBag = new BackErrorBag();
                        if(err instanceof BackError){
                            errorBag.add(err);
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
            else throw new BackError(MainBackErrors.accessDenied, {reason: 'tokenState'});
        }
        else throw new BackError(MainBackErrors.invalidPackage, {input: pack});
    }
}