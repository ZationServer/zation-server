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
    public static readonly App = appConfig;
    public static readonly Channel = channelConfig;
    public static readonly Error = errorTypes;
    public static readonly Event = events;
    public static readonly Main = mainConfig;
    public static readonly Settings = settings;
    public static readonly Validator = validator;
    public static readonly Service = serviceConfig;
}

export = ConstWrapper;
