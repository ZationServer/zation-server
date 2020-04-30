/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker                                        = require('../../../core/zationWorker');
import UpSocket, {RespondFunction}                           from '../../sc/socket';
import BackError                                             from '../../../api/BackError';
import BackErrorBag                                          from '../../../api/BackErrorBag';
import IdCounter                                             from '../../utils/idCounter';
import Logger                                                from '../../log/logger';
import {isCodeError}                                         from '../../error/codeError';
import ZationConfigFull                                      from '../../config/manager/zationConfigFull';
import {ControllerReq, ControllerRequestType, ControllerRes} from './controllerDefinitions';
import ControllerReqUtils                                    from './controllerReqUtils';
import {MainBackErrors}                                      from '../../zationBackErrors/mainBackErrors';
import AuthEngine                                            from '../../auth/authEngine';
import RequestBag                                            from '../../../api/RequestBag';
import ControllerPrepare                                     from '../controllerPrepare';
import ErrorUtils                                            from '../../utils/errorUtils';

export default class ControllerReqHandler
{
    private readonly zc: ZationConfigFull;
    private readonly worker: ZationWorker;
    private reqIdCounter: IdCounter;
    private readonly controllerPrepare: ControllerPrepare;

    //tmp variables for faster access
    private readonly defaultApiLevel: number;
    private readonly debug: boolean;
    private readonly reqIdPreFix: string;
    private readonly authControllerIdentifier: string;
    private readonly useTokenStateCheck: boolean;
    private readonly sendErrDescription: boolean;
    private readonly validationCheckLimit: number;

    constructor(worker) {
        this.zc = worker.getZationConfig();
        this.worker = worker;
        this.reqIdCounter = new IdCounter();
        this.controllerPrepare = this.worker.getControllerPrepare();

        this.defaultApiLevel = this.zc.mainConfig.defaultClientApiLevel;
        this.debug = this.zc.isDebug();
        this.reqIdPreFix = `${this.worker.options.instanceId}-${this.worker.getFullWorkerId()}-`;
        this.authControllerIdentifier = this.controllerPrepare.authControllerIdentifier;
        this.useTokenStateCheck = this.zc.mainConfig.useTokenStateCheck;
        this.sendErrDescription = this.zc.mainConfig.sendErrorDescription || this.zc.isDebug();
        this.validationCheckLimit = this.zc.mainConfig.validationCheckLimit;
    }

    async processRequest(request: ControllerReq, socket: UpSocket, respond: RespondFunction)
    {
        const reqId = this.createReqId();

        //performance boost
        if(this.debug)
            Logger.log.debug(`Socket Controller Request id: ${reqId} -> `,request);

        try {
            let response;
            const result = await this._processRequest(reqId,request,socket);
            if(result !== undefined){
                response = ([[],result] as ControllerRes);
            }
            respond(null,response);

            if(this.debug)
                Logger.log.debug(`Socket Controller Response id: ${reqId} ->`,
                    response !== undefined ? response : 'Successful without result');
        }
        catch (err) {
            const response: ControllerRes =
                [ErrorUtils.convertErrorToResponseErrors(err,this.sendErrDescription)];
            respond(null,response);

            if(this.debug)
                Logger.log.debug(`Socket Controller Response id: ${reqId} ->`,response);
            await this.handleReqError(err);
        }
    }

    private async _processRequest(reqId: string,request: ControllerReq, socket: UpSocket) {
        if(ControllerReqUtils.isValidReqStructure(request)) {
            let controllerIdentifier;
            let isSystemController;

            //Check for a auth req
            if(request.t === ControllerRequestType.Auth) {
                if(this.authControllerIdentifier === undefined) {
                    throw new BackError(MainBackErrors.authControllerNotSet);
                }
                isSystemController = false;
                controllerIdentifier = this.authControllerIdentifier;
            }
            // check auth start active ?
            else if(this.worker.getIsAuthStartActive()) {
                throw new BackError(MainBackErrors.authStartActive);
            }
            else {
                isSystemController = ControllerReqUtils.isSystemControllerReq(request);
                controllerIdentifier = ControllerReqUtils.getControllerId(request,isSystemController);
            }

            //Trows if not exists
            this.controllerPrepare.checkControllerExist(controllerIdentifier,isSystemController);

            const reqApiLevel = request.al != undefined ? Math.floor(request.al) : undefined;
            const currentApiLevel = reqApiLevel || socket.apiLevel || this.defaultApiLevel;

            //Throws if apiLevel not found
            const {
                controllerInstance,
                systemAccessCheck,
                versionAccessCheck,
                tokenStateCheck,
                middlewareInvoke,
                inputConsume,
                finallyHandle,
                inputValidationCheck
            } = this.controllerPrepare.getControllerPreparedData(controllerIdentifier,currentApiLevel,isSystemController);

            //is validation check request?
            if(request.t === ControllerRequestType.ValidationCheck) {
                //Validation check request...
                const checks = Array.isArray(request.i) ? request.i : [];

                //check is over validation check limit
                if(checks.length > this.validationCheckLimit){
                    throw new BackError(MainBackErrors.validationCheckLimitReached,{
                        limit: this.validationCheckLimit,
                        checksCount: checks.length
                    });
                }

                await inputValidationCheck(request.i);
                return {};
            }
            else {
                //Auth or normal request...

                if(!systemAccessCheck(socket)){
                    throw new BackError(MainBackErrors.noAccessWithSystem,{system: socket.clientSystem});
                }

                if(!versionAccessCheck(socket)){
                    throw new BackError(MainBackErrors.noAccessWithVersion,{version: socket.clientVersion});
                }

                const authEngine: AuthEngine = socket.authEngine;

                //check access to controller
                if(!this.useTokenStateCheck || (await tokenStateCheck(authEngine))) {

                    let input: object;
                    try {
                        input = await inputConsume(request.i);
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

                            const input = request.i;
                            const reqBag = new RequestBag(socket,this.worker,reqId,input,reqApiLevel);
                            try {
                                await controllerInstance.invalidInput(reqBag,input,err);
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

                    const reqBag = new RequestBag(socket,this.worker,reqId,input,reqApiLevel);

                    //process the controller handle, before handle events and finally handle.
                    let result;
                    try {
                        await middlewareInvoke(controllerInstance,reqBag);
                        result = await controllerInstance.handle(reqBag,input);
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
            throw new BackError(MainBackErrors.wrongInputDataStructure, {input: request});
        }
    }

    private createReqId() {
        this.reqIdCounter.increase();
        // scalable unique id for every req based on instanceId-workerId-time/count
        return this.reqIdPreFix + this.reqIdCounter.getId();
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
            Logger.log.error('Unknown error while processing a request:',err);
            promises.push(this.zc.event.error(err));
        }
        await Promise.all(promises);
    }
}