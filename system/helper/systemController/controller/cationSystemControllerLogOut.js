let Controller    = require('../../../api/Controller');
let Bag           = require('../../../api/Bag');

class CationSystemControllerLogOut extends Controller
{
    handle(bag)
    {
        if(bag instanceof Bag)
        {
            bag.authOut();
        }
    }
}

module.exports = CationSystemControllerLogOut;