/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
// noinspection TypeScriptPreferShortImport
import {Controller}     from "../../../api/Controller";
import TaskError      = require("../../../api/TaskError");
import MainTaskErrors = require("./../../zationTaskErrors/mainTaskErrors");
import {ZationToken}      from "../../constants/internal";
import {ControllerConfig} from "../../../..";

class ZationSPC_Auth extends Controller
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
            await new Promise((resolve) => {setTimeout(()=>{resolve();},2000)})

            if(!bag.getWorker().getPanelEngine().isPanelLoginDataValid(username,password)) {
                throw new TaskError(MainTaskErrors.wrongPanelAuthData);
            }
            const token = {};
            token[nameof<ZationToken>(s => s.zationPanelAccess)] = true;
            token[nameof<ZationToken>(s => s.zationOnlyPanelToken)] = true;
            bag.getSocket().setAuthToken(token);

            console.log(bag.getTokenVariable());

            await bag.setTokenVariable('ZATION-PANEL-USER-NAME',username);
        }
        else {
            throw new TaskError(MainTaskErrors.panelIsNotActivated);
        }
    }
}

export = ZationSPC_Auth;