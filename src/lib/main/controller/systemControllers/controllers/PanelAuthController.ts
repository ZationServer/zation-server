/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
// noinspection TypeScriptPreferShortImport
import {RawZationToken}   from "../../../constants/internal";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig} from "../../../config/definitions/parts/controllerConfig";
import BackError          from "../../../../api/BackError";
import Controller         from "../../../../api/Controller";
import {MainBackErrors}   from "../../../zationBackErrors/mainBackErrors";
import TokenUtils         from "../../../token/tokenUtils";

export default class PanelAuthController extends Controller
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

            //wait 1.5 seconds for avoiding brute force attacks
            await new Promise((resolve) => {setTimeout(() => resolve(),1500)});

            if(!(await bag.getWorker().getPanelEngine().isPanelLoginDataValid(username,password))) {
                throw new BackError(MainBackErrors.invalidPanelAuthData);
            }
            const token = TokenUtils.generateToken(bag.getZationConfig().internalData.tokenClusterKey);
            token[nameof<RawZationToken>(s => s.panelAccess)] = true;
            token[nameof<RawZationToken>(s => s.onlyPanelToken)] = true;
            bag.getRawSocket().setAuthToken(token);

            await bag.setTokenVariable('ZATION-PANEL-USER-NAME',username);
        }
        else {
            throw new BackError(MainBackErrors.panelIsNotActivated);
        }
    }
}