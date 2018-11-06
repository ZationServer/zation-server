/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import {Controller}     from "../../../api/Controller";
import TaskError      = require("../../../api/TaskError");
import MainTaskErrors = require("./../../zationTaskErrors/mainTaskErrors");
import {ZationToken} from "../../constants/internal";

class ZationSC_Ping extends Controller
{
    async handle(bag,{userName,hashPassword})
    {
        if(!bag.getWorker().getPanelEngine().isPanelLoginDataValid(userName,hashPassword)) {
            throw new TaskError(MainTaskErrors.wrongPanelAuthData);
        }
        const token = {};
        token[nameof<ZationToken>(s => s.zationPanelAccess)] = true;
        token[nameof<ZationToken>(s => s.zationOnlyPanelToken)] = true;
        bag.getSocket().setAuthToken(token)
    }
}

export = ZationSC_Ping;