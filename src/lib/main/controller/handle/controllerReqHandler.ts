/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker              = require('../../../core/zationWorker');
import UpSocket, {RespondFunction} from '../../sc/socket';
import BackError                   from '../../../api/BackError';
import BackErrorBag                from '../../../api/BackErrorBag';
import Logger                      from '../../log/logger';
import {isCodeError}               from '../../error/codeError';
import ZationConfigFull            from '../../config/manager/zationConfigFull';
import {MainBackErrors}            from '../../zationBackErrors/mainBackErrors';
import AuthEngine                  from '../../auth/authEngine';
import RequestBag                  from '../../../api/RequestBag';
import ControllerPrepare           from '../controllerPrepare';
import ErrorUtils                  from '../../utils/errorUtils';
import ApiLevelUtils               from '../../apiLevel/apiLevelUtils';
import {ControllerBaseReq, ControllerRes, ControllerStandardReq, SpecialController} from '../controllerDefinitions';
import {checkValidControllerBaseRequest, isValidationCheckRequest}                  from './controllerReqUtils';

export default class ControllerReqHandler
{
    private readonly zc: ZationConfigFull;
    private readonly worker: ZationWorker;
    private readonly controllerPrepare: ControllerPrepare;

    //tmp variables for faster access
    private readonly defaultApiLevel: number;
    private readonly debug: boolean;
    private readonly authControllerIdentifier: string;
    private readonly sendErrDescription: boolean;
    private readonly validationCheckLimit: number;

    constructor(worker: ZationWorker) {
        this.zc = worker.getZationConfig();
        this.worker = worker;
        this.controllerPrepare = this.worker.getControllerPrepare();

        this.defaultApiLevel = this.zc.mainConfig.defaultClientApiLevel;
        this.debug = this.zc.isDebug();
        this.authControllerIdentifier = this.controllerPrepare.authControllerIdentifier;
        this.sendErrDescription = this.zc.mainConfig.sendErrorDescription || this.zc.isDebug();
        this.validationCheckLimit = this.zc.mainConfig.validationCheckLimit;
    }

    async processRequest(request: ControllerBaseReq, socket: UpSocket, respond: RespondFunction)
    {
        let response: ControllerRes
        try {
            const result = await this._processRequest(request,socket);
            if(result !== undefined){
                response = ([[],result] as ControllerRes);
            }
            respond(null,response);
        }
        catch (err) {
            response = [ErrorUtils.dehydrate(err,this.sendErrDescription)];
            respond(null,response);

            await this.handleReqError(err);
        }

        if(this.debug) {
            Logger.log.debug(`Socket controller request -> `,request,
                ' processed to response -> ',response !== undefined ? response : 'Successful without result');
        }
    }

    private async _processRequest(request: ControllerBaseReq, socket: UpSocket) {
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

            const reqApiLevel = ApiLevelUtils.parseRequestApiLevel(request.a);

            //throws if not exists or api level is incompatible
            const cInstance = this.controllerPrepare.get(controllerIdentifier,
                (reqApiLevel || socket.apiLevel || this.defaultApiLevel));

            if(isValidationCheckRequest(request)) {
                const checks = Array.isArray(request.v) ? request.v : [];

                //check is over validation check limit
                if(checks.length > this.validationCheckLimit){
                    throw new BackError(MainBackErrors.validationCheckLimitReached,{
                        limit: this.validationCheckLimit,
                        checksCount: checks.length
                    });
                }

                await cInstance._preparedData.inputValidationCheck(checks);
                return undefined;
            }
            else {
                const {
                    systemAccessCheck,
                    versionAccessCheck,
                    tokenStateCheck,
                    middlewareInvoke,
                    inputConsume,
                    finallyHandle,
                } = cInstance._preparedData;

                if(!systemAccessCheck(socket)){
                    throw new BackError(MainBackErrors.noAccessWithSystem,{system: socket.clientSystem});
                }

                if(!versionAccessCheck(socket)){
                    throw new BackError(MainBackErrors.noAccessWithVersion,{version: socket.clientVersion});
                }

                const authEngine: AuthEngine = socket.authEngine;

                //check access to controller
                if(await tokenStateCheck(authEngine)) {

                    let input: object;
                    try {
                        input = await inputConsume((request as ControllerStandardReq).i);
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

                            const input = (request as ControllerStandardReq).i;
                            const reqBag = new RequestBag(socket,this.worker,input,reqApiLevel);
                            try {
                                await cInstance.invalidInput(reqBag,input,err);
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

                    //process the controller handle, before handle events and finally handle.
                    let result;
                    try {
                        await middlewareInvoke(cInstance,reqBag);
                        result = await cInstance.handle(reqBag,input);
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
        }
        else {
            throw new BackError(MainBackErrors.invalidRequest, {input: request});
        }
    }

    private async handleReqError(err) {
        const promises: (Promise<void> | void)[] = [];

        const backErrors = (err instanceof BackErrorBag) ? err.getBackErrors() :
            ((err instanceof  BackError) ? [err] : undefined);

        if(backErrors){
            const length = backErrors.length;
            let tmpBackError;
            for(let i = 0; i < length; i++){
                tmpBackError = backErrors[i];
                if(isCodeError(tmpBackError)){
                    Logger.log.error(`Code error -> ${tmpBackError.toString()}/n stack-> ${tmpBackError.stack}`);
                    promises.push(this.zc.event.codeError(tmpBackError));
                }
            }
            promises.push(this.zc.event.backErrors(backErrors));
        }
        else {
            Logger.log.error('Unknown error while processing a controller request:',err);
            promises.push(this.zc.event.error(err));
        }
        await Promise.all(promises);
    }
}