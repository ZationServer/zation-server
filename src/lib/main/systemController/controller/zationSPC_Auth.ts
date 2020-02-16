/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
// noinspection TypeScriptPreferShortImport
import {ZationToken}      from "../../constants/internal";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../../config/definitions/controllerConfig";
import BackError          from "../../../api/BackError";
import Controller         from "../../../api/Controller";
import {MainBackErrors}   from "../../zationBackErrors/mainBackErrors";
import TokenUtils         from "../../token/tokenUtils";

export default class ZationSPC_Auth extends Controller
{
    static config: ControllerConfig = {
        access: 'all',
        versionAccess: 'all',
        input: {
            username: {
                type: 'string'
            },
            password: {
                type: 'string'
            }
        }
    };


    async handle(bag,{username,password})
    {
        if(bag.getZationConfig().mainConfig.usePanel) {

            //wait 2seconds for avoiding brute force attacks
            await new Promise((resolve) => {setTimeout(()=>{resolve();},1500)});

            if(!(await bag.getWorker().getPanelEngine().isPanelLoginDataValid(username,password))) {
                throw new BackError(MainBackErrors.wrongPanelAuthData);
            }
            const token = TokenUtils.generateToken(bag.getZationConfig().internalData.tokenClusterKey);
            token[nameof<ZationToken>(s => s.panelAccess)] = true;
            token[nameof<ZationToken>(s => s.onlyPanelToken)] = true;
            bag.getRawSocket().setAuthToken(token);

            await bag.setTokenVariable('ZATION-PANEL-USER-NAME',username);
        }
        else {
            throw new BackError(MainBackErrors.panelIsNotActivated);
        }
    }
}