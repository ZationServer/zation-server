/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import {Controller} from "../../../api/Controller";

class ZationSC_Ping extends Controller
{
    async handle(bag)
    {
       return true;
    }
}

export = ZationSC_Ping;