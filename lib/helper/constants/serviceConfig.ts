/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ServiceConfig {}

ServiceConfig.KEYS = {};
//Services
ServiceConfig.KEYS.SERVICES           = 'services';

ServiceConfig.SERVICES = {};
ServiceConfig.SERVICES.MYSQL          = 'mySql';
ServiceConfig.SERVICES.NODE_MAILER    = 'nodeMailer';
ServiceConfig.SERVICES.POSTGRES_SQL   = 'postgresSql';
ServiceConfig.SERVICES.MONGO_DB       = 'mongoDb';

ServiceConfig.KEYS.CUSTOM_SERVICES    = 'customServices';

ServiceConfig.CUSTOM_SERVICES = {};
ServiceConfig.CUSTOM_SERVICES.CREATE  = 'create';
ServiceConfig.CUSTOM_SERVICES.GET     = 'get';

ServiceConfig.OPTIONS = {};
ServiceConfig.OPTIONS.AUTO            = 'auto';

module.exports = ServiceConfig;