/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let Controller    = require('../../../api/Controller');

class ZationSC_Ping extends Controller
{
    async handle(bag)
    {
       return true;
    }
}

export = ZationSC_Ping;