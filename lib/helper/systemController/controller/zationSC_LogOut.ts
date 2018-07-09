/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let Controller    = require('../../../api/Controller');
let Bag           = require('../../../api/Bag');

class ZationSC_LogOut extends Controller
{
    async handle(bag)
    {
        if(bag instanceof Bag)
        {
            await bag.authOut();
        }
    }
}

module.exports = ZationSC_LogOut;