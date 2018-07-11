/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const           = require('../constants/constWrapper');
import ServiceBox      = require('./serviceBox');

import MySql           = require("mysql");
import PostgresSql     = require('pg-pool');



class ServiceEngine
{
    private readonly sc : object;
    private readonly csc : object;

    private readonly customServices : object;

    private mySqlServiceBox : ServiceBox;
    private nodeMailerServiceBox : ServiceBox;
    private postgresSqlBox : ServiceBox;
    private mongoDbBox : ServiceBox;

    constructor(zc)
    {
        this.sc = zc.getService(Const.Service.KEYS.SERVICES);
        this.csc = zc.getService(Const.Service.KEYS.CUSTOM_SERVICES);

        if(this.sc === undefined) {this.sc = {};}
        if(this.csc === undefined) {this.csc = {};}

        this.customServices = {};
    }

    async init() : Promise<void>
    {
        let promises : Promise<void>[] = [];

        this.mySqlServiceBox =
            new ServiceBox(Const.Service.SERVICES.MYSQL,this.sc[Const.Service.SERVICES.MYSQL],async (c) : Promise<MySql.Pool> =>
            {
                return MySql.createPool(c);
            });
        promises.push(this.mySqlServiceBox.init());

        this.nodeMailerServiceBox =
            new ServiceBox(Const.Service.SERVICES.NODE_MAILER,this.sc[Const.Service.SERVICES.NODE_MAILER],async (c) =>
            {
                const nodeMailer = require('nodemailer');
                return nodeMailer.createTransport(c);
            });
        promises.push(this.nodeMailerServiceBox.init());

        this.postgresSqlBox =
            new ServiceBox(Const.Service.SERVICES.POSTGRES_SQL,this.sc[Const.Service.SERVICES.POSTGRES_SQL],async (c) =>
            {
                let pool : PostgresSql.Pool =  new PostgresSql.Pool(c);
                return await pool.connect();
            });
        promises.push(this.postgresSqlBox.init());

        this.mongoDbBox =
            new ServiceBox(Const.Service.SERVICES.MONGO_DB,this.sc[Const.Service.SERVICES.MONGO_DB],async (c) =>
            {
                const mongo = require('mongodb-pool');
                // noinspection JSUnresolvedFunction
                return await mongo.getConnection(c.url,c);
            });
        promises.push(this.mongoDbBox.init());

        //customServices
        for(let k in this.csc)
        {
            if(this.csc.hasOwnProperty(k))
            {
                let howToCreate = this.csc[k][Const.Service.CUSTOM_SERVICES.CREATE];
                let howToGet    = this.csc[k][Const.Service.CUSTOM_SERVICES.GET];
                //remove
                delete this.csc[k][Const.Service.CUSTOM_SERVICES.CREATE];
                delete this.csc[k][Const.Service.CUSTOM_SERVICES.GET];

                this.customServices[k] = new ServiceBox(k,this.csc[k],howToCreate,howToGet);
                promises.push(this.customServices[k].init());
            }
        }

        await Promise.all(promises);
    }

    getMySqlService(key : string) : MySql.Pool
    {
        return this.mySqlServiceBox.getService(key);
    }

    getNodeMailerService(key : string) : any
    {
        return this.nodeMailerServiceBox.getService(key);
    }

    getPostgresSqlService(key : string) : any
    {
        return this.postgresSqlBox.getService(key);
    }

    getMongoDbService(key : string) : any
    {
        return this.mongoDbBox.getService(key);
    }

    // noinspection JSUnusedGlobalSymbols
    isCustomService(serviceName : string) : boolean
    {
        return this.customServices[serviceName] instanceof ServiceBox
    }

    getCustomService(serviceName : string,key : string) : any
    {
        if(this.customServices[serviceName] instanceof ServiceBox)
        {
            return this.customServices[serviceName].getService(key);
        }
        else
        {
            return undefined;
        }
    }

}

export = ServiceEngine;