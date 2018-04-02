const ZationStarter   = require('./system/main/zationStarter');

//starter
module.exports.start = (options) =>
{
    new ZationStarter(options);
};

//Api Classes
module.exports.Bag = require('./system/api/Bag');
module.exports.Controller = require('./system/api/Controller');
module.exports.Result = require('./system/api/Result');
module.exports.TaskError = require('./system/api/TaskError');
module.exports.TaskErrorBag = require('./system/api/TaskErrorBag');
