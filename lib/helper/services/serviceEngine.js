/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const           = require('../constants/constWrapper');
const ServiceBox      = require('./serviceBox');

class ServiceEngine
{
    constructor(zc)
    {
        this._sc = zc.getService(Const.Service.KEYS.SERVICES);
        this._csc = zc.getService(Const.Service.KEYS.CUSTOM_SERVICES);

        if(this._sc === undefined) {this._sc = {};}
        if(this._csc === undefined) {this._csc = {};}

        this._customServices = {};
    }

    async init()
    {
        let promises = [];

        this._mySqlServiceBox =
            new ServiceBox(Const.Service.SERVICES.MYSQL,this._sc[Const.Service.SERVICES.MYSQL],async (c) =>
            {
                const mySql = require('mysql');
                return mySql.createPool(c);
            });
        promises.push(this._mySqlServiceBox.init());

        this._nodeMailerServiceBox =
            new ServiceBox(Const.Service.SERVICES.NODE_MAILER,this._sc[Const.Service.SERVICES.NODE_MAILER],async (c) =>
            {
                const nodeMailer = require('nodemailer');
                return nodeMailer.createTransport(c);
            });
        promises.push(this._nodeMailerServiceBox.init());

        this._postgresSqlBox =
            new ServiceBox(Const.Service.SERVICES.POSTGRES_SQL,this._sc[Const.Service.SERVICES.POSTGRES_SQL],async (c) =>
            {
                const postgresSql = require('pg-pool');
                let pool =  new postgresSql(c);
                return await pool.connect();
            });
        promises.push(this._postgresSqlBox.init());

        this._mongoDbBox =
            new ServiceBox(Const.Service.SERVICES.MONGO_DB,this._sc[Const.Service.SERVICES.MONGO_DB],async (c) =>
            {
                const mongo = require('mongodb-pool');
                // noinspection JSUnresolvedFunction
                return await mongo.getConnection(c.url,c);
            });
        promises.push(this._mongoDbBox.init());

        //customServices
        for(let k in this._csc)
        {
            if(this._csc.hasOwnProperty(k))
            {
                let howToCreate = this._csc[k][Const.Service.CUSTOM_SERVICES.CREATE];
                let howToGet    = this._csc[k][Const.Service.CUSTOM_SERVICES.GET];
                //remove
                delete this._csc[k][Const.Service.CUSTOM_SERVICES.CREATE];
                delete this._csc[k][Const.Service.CUSTOM_SERVICES.GET];

                this._customServices[k] = new ServiceBox(k,this._csc[k],howToCreate,howToGet);
                promises.push(this._customServices[k].init());
            }
        }

        await Promise.all(promises);
    }

    getMySqlService(key)
    {
        this._mySqlServiceBox.getService(key);
    }

    getNodeMailerService(key)
    {
        this._nodeMailerServiceBox.getService(key);
    }

    getPostgresSqlService(key)
    {
        this._postgresSqlBox.getService(key);
    }

    getMongoDbService(key)
    {
        this._mongoDbBox.getService(key);
    }

    // noinspection JSUnusedGlobalSymbols
    isCustomService(serviceName)
    {
        return this._customServices[serviceName] instanceof ServiceBox
    }

    getCustomService(serviceName,key)
    {
        if(this._customServices[serviceName] instanceof ServiceBox)
        {
            return this._customServices[serviceName].getService(key);
        }
        else
        {
            return undefined;
        }
    }

}

module.exports = ServiceEngine;