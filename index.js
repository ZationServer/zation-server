/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const ZationStarter   = require('./src/main/zationStarter');

//starter
module.exports.start = (options) =>
{
    new ZationStarter(options);
};

//Api Classes
module.exports.Bag = require('./src/api/Bag');
module.exports.SmallBag = require('./src/api/SmallBag');
module.exports.Controller = require('./src/api/Controller');
module.exports.Result = require('./src/api/Result');
module.exports.TaskError = require('./src/api/TaskError');
module.exports.TaskErrorBag = require('./src/api/TaskErrorBag');

module.exports.ErrorType = require('./src/helper/constants/errorTypes');