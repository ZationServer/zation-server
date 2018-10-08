/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import {Controller} from "../../../api/Controller";
import Const        = require("../../constants/constWrapper");

class ZationSC_Ping extends Controller
{
    async handle(bag,{userName,hashPassword})
    {
        if(!bag.getWorker().getPanelEngine().isPanelLoginDataValid(userName,hashPassword))
        {
            //throw
        }

        const token = {};
        token[Const.Settings.TOKEN.PANEL_ACCESS] = true;
        token[Const.Settings.TOKEN.ONLY_PANEL_TOKEN] = true;
        bag.getSocket().setAuthToken(token)
    }
}

export = ZationSC_Ping;