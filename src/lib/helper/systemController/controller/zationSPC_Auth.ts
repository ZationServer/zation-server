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
        await bag.authenticate(Const.Settings.PANEL.AUTH_USER_GROUP);
    }
}

export = ZationSC_Ping;