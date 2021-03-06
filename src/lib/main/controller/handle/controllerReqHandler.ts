/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RespondFunction}           from '../../sc/socket';
import BackError                   from '../../../api/BackError';
import BackErrorBag                from '../../../api/BackErrorBag';
import Logger                      from '../../log/logger';
import ZationConfigFull            from '../../config/manager/zationConfigFull';
import {MainBackErrors}            from '../../systemBackErrors/mainBackErrors';
import ControllerPrepare           from '../controllerPrepare';
import ErrorUtils                  from '../../utils/errorUtils';
import ApiLevelUtils               from '../../apiLevel/apiLevelUtils';
import Packet                      from '../../../api/Packet';
import Socket                      from '../../../api/Socket';
import {ClientErrorName}           from '../../definitions/clientErrorName';
import {ControllerBaseReq, ControllerStandardReq, SpecialController}                from '../controllerDefinitions';
import {checkValidControllerBaseRequest, isValidationCheckRequest}                  from './controllerReqUtils';

export default class ControllerReqHandler
{
    private readonly zc: ZationConfigFull;
    private readonly controllerPrepare: ControllerPrepare;

    //tmp variables for faster access
    private readonly defaultApiLevel: number;
    private readonly debug: boolean;
    private readonly authControllerIdentifier: string;
    private readonly sendErrDescription: boolean;
    private readonly validationCheckLimit: number;

    constructor(controllerPrepare: ControllerPrepare,zc: ZationConfigFull) {
        this.zc = zc;
        this.controllerPrepare = controllerPrepare;

        this.defaultApiLevel = this.zc.mainConfig.defaultClientApiLevel;
        this.debug = this.zc.isDebug();
        this.authControllerIdentifier = this.controllerPrepare.authControllerIdentifier;
        this.sendErrDescription = this.zc.mainConfig.sendErrorDescription || this.zc.isDebug();
        this.validationCheckLimit = this.zc.mainConfig.validationCheckLimit;
    }

    async processRequest(request: ControllerBaseReq, socket: Socket, respond: RespondFunction)
    {
        try {
            const result = await this._processRequest(request,socket);
            respond(null,result);
            if(this.debug)
                Logger.log.debug(`Socket Controller request -> `,request,
                    ' processed successfully with result -> ',result);
        }
        catch (err) {
            if(!(err instanceof BackError || err instanceof BackErrorBag)) {
                Logger.log.error(`Unknown error while processing a controller request:`,err);
                this.zc.event.error(err);
            }

            const errWrapper: any = new Error();
            errWrapper.name = ClientErrorName.RequestProcessError;
            errWrapper.backErrors = ErrorUtils.dehydrate(err,this.sendErrDescription);
            respond(errWrapper);

            if(this.debug) Logger.log.debug(`Socket Controller request -> `,request, ` processed not successfully with error -> `, err);
        }
    }

    private async _processRequest(request: ControllerBaseReq, socket: Socket) {
        if(checkValidControllerBaseRequest(request)) {
            let controllerIdentifier;
            if(request.c === SpecialController.AuthController) {
                if(this.authControllerIdentifier === undefined) {
                    throw new BackError(MainBackErrors.authControllerNotSet);
                }
                controllerIdentifier = this.authControllerIdentifier;
            }
            else {
                controllerIdentifier = request.c;
            }

            const packetApiLevel = ApiLevelUtils.parsePacketApiLevel(request.a);

            //throws if not exists or api level is incompatible
            const cInstance = this.controllerPrepare.get(controllerIdentifier,
                (packetApiLevel || socket.connectionApiLevel || this.defaultApiLevel));

            if(isValidationCheckRequest(request)) {
                const checks = Array.isArray(request.v) ? request.v : [];

                //check is over validation check limit
                if(checks.length > this.validationCheckLimit){
                    throw new BackError(MainBackErrors.validationCheckLimitReached,{
                        limit: this.validationCheckLimit,
                        checksCount: checks.length
                    });
                }

                await cInstance._preparedData.checkInputValidation(checks);
                return undefined;
            }
            else {
                const {
                    checkAccess,
                    handleMiddlewareInvoke,
                    consumeInput,
                } = cInstance._preparedData;

                //check access to controller
                if(await checkAccess(socket)) {
                    const packet = new Packet((request as ControllerStandardReq).d,packetApiLevel);
                    let input: object;
                    try {
                        input = await consumeInput((request as ControllerStandardReq).d);
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

                            const input = (request as ControllerStandardReq).d;
                            try {
                                await cInstance.invalidInput(socket,input,packet,err);
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

                    //process the controller handle and before handle events.
                    let result;
                    try {
                        await handleMiddlewareInvoke(cInstance,socket,packet);
                        result = await cInstance.handle(socket,input,packet);
                    }
                    catch(e) {throw e;}

                    return result;
                }
                else throw new BackError(MainBackErrors.accessDenied, {reason: 'tokenState'});
            }
        }
        else {
            throw new BackError(MainBackErrors.invalidRequest, {input: request});
        }
    }
}