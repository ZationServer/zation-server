/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS
{
    static readonly SERVICES           = 'services';
    static readonly CUSTOM_SERVICES    = 'customServices';
}

class SERVICES
{
    static readonly MYSQL          = 'mySql';
    static readonly NODE_MAILER    = 'nodeMailer';
    static readonly POSTGRES_SQL   = 'postgresSql';
    static readonly MONGO_DB       = 'mongoDb';
}

class CUSTOM_SERVICES
{
    static readonly CREATE  = 'create';
    static readonly GET     = 'get';
}

class ServiceConfig
{
    public static readonly KEYS = KEYS;
    public static readonly SERVICES = SERVICES;
    public static readonly CUSTOM_SERVICES = CUSTOM_SERVICES;
}

export = ServiceConfig;