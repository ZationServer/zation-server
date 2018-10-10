/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import {Controller}     from "../../../api/Controller";
import Const          = require("../../constants/constWrapper");
import TaskError      = require("../../../api/TaskError");
import MainTaskErrors = require("./../../zationTaskErrors/mainTaskErrors");

class ZationSC_Ping extends Controller
{
    async handle(bag,{userName,hashPassword})
    {
        if(!bag.getWorker().getPanelEngine().isPanelLoginDataValid(userName,hashPassword)) {
            throw new TaskError(MainTaskErrors.wrongPanelAuthData);
        }
        const token = {};
        token[Const.Settings.TOKEN.PANEL_ACCESS] = true;
        token[Const.Settings.TOKEN.ONLY_PANEL_TOKEN] = true;
        bag.getSocket().setAuthToken(token)
    }
}

export = ZationSC_Ping;