/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

// noinspection TypeScriptPreferShortImport
import Controller         from "../../../api/Controller";
// noinspection TypeScriptPreferShortImport
import {ControllerConfig} from "../../config/definitions/controllerConfig";

export default class ZationSC_Ping extends Controller
{
    static config : ControllerConfig = {
        access : 'all',
        versionAccess : 'all',
        input : {}
    };

    async handle(bag) {
       return true;
    }
}

