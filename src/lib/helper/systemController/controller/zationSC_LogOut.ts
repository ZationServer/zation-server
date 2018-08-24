/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let Controller    = require('../../../api/Controller');

class ZationSC_LogOut extends Controller
{
    async handle(bag)
    {
        await bag.deauthenticate();
    }
}

export = ZationSC_LogOut;