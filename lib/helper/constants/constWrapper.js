/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const appConfig     = require('./appConfig');
const channelConfig = require('./channelConfig');
const errorTypes    = require('./errorTypes');
const events        = require('./events');
const mainConfig    = require('./mainConfig');
const settings      = require('./settings');
const validator     = require('./validator');
const serviceConfig = require('./serviceConfig');

class ConstWrapper {}

ConstWrapper.App       = appConfig;
ConstWrapper.Channel   = channelConfig;
ConstWrapper.Error     = errorTypes;
ConstWrapper.Event     = events;
ConstWrapper.Main      = mainConfig;
ConstWrapper.Settings  = settings;
ConstWrapper.Validator = validator;
ConstWrapper.Service   = serviceConfig;

module.exports = ConstWrapper;