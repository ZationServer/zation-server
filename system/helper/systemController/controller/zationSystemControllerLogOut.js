/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let Controller    = require('../../../api/Controller');
let Bag           = require('../../../api/Bag');

class ZationSystemControllerLogOut extends Controller
{
    handle(bag)
    {
        if(bag instanceof Bag)
        {
            bag.authOut();
        }
    }
}

module.exports = ZationSystemControllerLogOut;