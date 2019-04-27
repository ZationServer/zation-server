/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import Controller         from "../../../api/Controller";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../../configDefinitions/appConfig";

export default class ZationSC_Ping extends Controller
{
    static config : ControllerConfig = {
        systemController : true,
        access : 'all',
        versionAccess : 'all',
        multiInput : {}
    };

    async handle(bag) {
       return true;
    }
}

