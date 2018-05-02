/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const                     = require('../constants/constWrapper');
const TempDbUp                  = require('./tempDbUp');

class TempDbMongoDown extends TempDbUp
{
    constructor()
    {
        super();
    }
}

module.exports = TempDbMongoDown;