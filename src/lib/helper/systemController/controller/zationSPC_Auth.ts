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
            userName : {
                type : 'string'
            },
            password : {
                type : 'string'
            }
        }
    };

    async handle(bag,{userName,password})
    {
        if(bag.getZationConfig().mainConfig.usePanel) {
            if(!bag.getWorker().getPanelEngine().isPanelLoginDataValid(userName,password)) {
                throw new TaskError(MainTaskErrors.wrongPanelAuthData);
            }
            const token = {};
            token[nameof<ZationToken>(s => s.zationPanelAccess)] = true;
            token[nameof<ZationToken>(s => s.zationOnlyPanelToken)] = true;
            bag.getSocket().setAuthToken(token);
        }
        else {
            throw new TaskError(MainTaskErrors.panelIsNotActivated);
        }
    }
}

export = ZationSPC_Auth;