const ZationStarter   = require('./system/main/cationStarter');

//starter
module.exports.start = (options1,options2) =>
{
    new ZationStarter(options1,options2);
};

//Api Classes
module.exports.Bag = require('./system/api/Bag');
module.exports.Controller = require('./system/api/Controller');
module.exports.Result = require('./system/api/Result');
module.exports.TaskError = require('./system/api/TaskError');
module.exports.TaskErrorBag = require('./system/api/TaskErrorBag');
