/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import appConfig     = require('./appConfig');
import channelConfig = require('./channelConfig');
import errorTypes    = require('./errorTypes');
import events        = require('./events');
import mainConfig    = require('./mainConfig');
import settings      = require('./settings');
import validator     = require('./validator');
import serviceConfig = require('./serviceConfig');

class ConstWrapper
{
    static readonly App = appConfig;
    static readonly Channel = channelConfig;
    static readonly Error = errorTypes;
    static readonly Event = events;
    static readonly Main = mainConfig;
    static readonly Settings = settings;
    static readonly Validator = validator;
    static readonly Service = serviceConfig;
}

export = ConstWrapper;
