/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ZationStarter   = require('./system/main/zationStarter');

//starter
module.exports.start = (options) =>
{
    new ZationStarter(options);
};

//Api Classes
module.exports.Bag = require('./system/api/Bag');
module.exports.SmallBag = require('./system/api/SmallBag');
module.exports.Controller = require('./system/api/Controller');
module.exports.Result = require('./system/api/Result');
module.exports.TaskError = require('./system/api/TaskError');
module.exports.TaskErrorBag = require('./system/api/TaskErrorBag');

module.exports.ErrorType = require('./system/helper/constante/errorTypes');