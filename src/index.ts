/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationStarter   = require('./lib/main/zationStarter');
import Bag             = require('./lib/api/Bag');
import SmallBag        = require('./lib/api/SmallBag');
import Controller      = require('./lib/api/Controller');
import Result          = require('./lib/api/Result');
import TaskError       = require('./lib/api/TaskError');
import TaskErrorBag    = require('./lib/api/TaskErrorBag');
import ErrorType       = require('./lib/helper/constants/errorTypes');

//starter
const start = (options) =>
{
    new ZationStarter(options);
};

export = {start,Bag,SmallBag,Controller,Result,TaskError,TaskErrorBag,ErrorType};