/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */
// noinspection TypeScriptPreferShortImport
import {RawZationToken}   from "../../../definitions/internal";
// noinspection TypeScriptPreferShortImport,ES6PreferShortImport
import {ControllerConfig} from "../../../config/definitions/parts/controllerConfig";
import BackError          from "../../../../api/BackError";
import Controller         from "../../../../api/Controller";
import {MainBackErrors}   from "../../../systemBackErrors/mainBackErrors";
import TokenUtils         from "../../../token/tokenUtils";
import Socket             from '../../../../api/Socket';
// noinspection ES6PreferShortImport
import {bag}              from '../../../../api/Bag';

export default class PanelAuthController extends Controller
{
    static config: ControllerConfig = {
        access: 'all',
        input: {
            properties: {
                username: {
                    type: 'string'
                },
                password: {
                    type: 'string'
                }
            }
        }
    };


    async handle(socket: Socket,{username,password})
    {
        if(bag.getZationConfig().mainConfig.panel.active) {

            //wait 1.5 seconds for avoiding brute force attacks
            await new Promise<void>((resolve) => {setTimeout(() => resolve(),1500)});

            if(!(await bag.getWorker().getPanelEngine().isPanelLoginDataValid(username,password))) {
                throw new BackError(MainBackErrors.invalidPanelAuthData);
            }
            const token = TokenUtils.generateToken(bag.getZationConfig().internalData.tokenClusterKey);
            token[nameof<RawZationToken>(s => s.panelAccess)] = true;
            token[nameof<RawZationToken>(s => s.onlyPanelToken)] = true;
            token[nameof<RawZationToken>(s => s.payload)] = {['ZATION-PANEL-USER-NAME']: username};
            await socket._setToken(token);
        }
        else {
            throw new BackError(MainBackErrors.panelDeactivated);
        }
    }
}