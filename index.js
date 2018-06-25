/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ZationStarter   = require('./lib/main/zationStarter');

//starter
module.exports.start = (options) =>
{
    new ZationStarter(options);
};

//Api Classes
module.exports.Bag = require('./lib/api/Bag');
module.exports.SmallBag = require('./lib/api/SmallBag');
module.exports.Controller = require('./lib/api/Controller');
module.exports.Result = require('./lib/api/Result');
module.exports.TaskError = require('./lib/api/TaskError');
module.exports.TaskErrorBag = require('./lib/api/TaskErrorBag');

module.exports.ErrorType = require('./lib/helper/constants/errorTypes');
module.exports.ValidationType = require('./lib/helper/constants/validator').TYPE;