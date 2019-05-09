/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
// noinspection TypeScriptPreferShortImport
import {ZationToken}      from "../../constants/internal";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../../configDefinitions/appConfig";
import BackError          from "../../../api/BackError";
import Controller         from "../../../api/Controller";
import {MainBackErrors}   from "../../zationBackErrors/mainBackErrors";

export default class ZationSPC_Auth extends Controller
{
    static config : ControllerConfig = {
        systemController : true,
        access : 'all',
        versionAccess : 'all',
        input : {
            username : {
                type : 'string'
            },
            password : {
                type : 'string'
            }
        }
    };

    async handle(bag,{username,password})
    {
        if(bag.getZationConfig().mainConfig.usePanel) {

            //wait 2seconds for avoiding brute force attacks
            await new Promise((resolve) => {setTimeout(()=>{resolve();},2000)});

            if(!bag.getWorker().getPanelEngine().isPanelLoginDataValid(username,password)) {
                throw new BackError(MainBackErrors.wrongPanelAuthData);
            }
            const token = {};
            token[nameof<ZationToken>(s => s.zationPanelAccess)] = true;
            token[nameof<ZationToken>(s => s.zationOnlyPanelToken)] = true;
            token[nameof<ZationToken>(s => s.zationCheckKey)] =
                bag.getZationConfig().internalData.tokenCheckKey;
            bag.getSocket().setAuthToken(token);

            await bag.setTokenVariable('ZATION-PANEL-USER-NAME',username);
        }
        else {
            throw new BackError(MainBackErrors.panelIsNotActivated);
        }
    }
}

