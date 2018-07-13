/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const                = require('../constants/constWrapper');
import ServiceBox           = require('./serviceBox');
import ServiceNotFoundError = require("./serviceNotFoundError");

import MySql                = require("mysql");
import Pg                   = require('pg');
import nodeMailer           = require('nodemailer');
import mongodb              = require('mongodb');
import {MongoClient}          from "mongodb";

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
            new ServiceBox(Const.Service.SERVICES.MYSQL,this.sc[Const.Service.SERVICES.MYSQL],
                async (c) : Promise<MySql.Pool> =>
            {
                return MySql.createPool(c);
            });
        promises.push(this.mySqlServiceBox.init());

        this.nodeMailerServiceBox =
            new ServiceBox(Const.Service.SERVICES.NODE_MAILER,this.sc[Const.Service.SERVICES.NODE_MAILER],
                async (c) : Promise<nodeMailer.Transporter> =>
            {
                return nodeMailer.createTransport(c);
            });
        promises.push(this.nodeMailerServiceBox.init());

        this.postgresSqlBox =
            new ServiceBox(Const.Service.SERVICES.POSTGRES_SQL,this.sc[Const.Service.SERVICES.POSTGRES_SQL],
               async (c) : Promise<Pg.Pool> =>
            {
                return new Pg.Pool(c);
            }, async (s) : Promise<Pg.Client> =>
            {
                return s.connect();

            });
        promises.push(this.postgresSqlBox.init());

        this.mongoDbBox =
            new ServiceBox(Const.Service.SERVICES.MONGO_DB,this.sc[Const.Service.SERVICES.MONGO_DB],
                async (c : object) : Promise<MongoClient> => {
                let url : string = c['url'];
                return await mongodb.MongoClient.connect(url,c);
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

    async getMySqlService(key : string = 'default') : Promise<MySql.Pool>
    {
        return this.mySqlServiceBox.getService(key);
    }

    isMySqlService(key : string = 'default') : boolean
    {
        return this.mySqlServiceBox.isServiceExists(key);
    }

    async getNodeMailerService(key : string = 'default') : Promise<nodeMailer.Transporter>
    {
        return this.nodeMailerServiceBox.getService(key);
    }

    isNodeMailerService(key : string = 'default') : boolean
    {
        return this.nodeMailerServiceBox.isServiceExists(key);
    }

    async getPostgresSqlService(key : string = 'default') : Promise<Pg.Client>
    {
        return this.postgresSqlBox.getService(key);
    }

    isPostgresSqlService(key : string = 'default') : boolean
    {
        return this.postgresSqlBox.isServiceExists(key);
    }

    async getMongoDbService(key : string = 'default') : Promise<MongoClient>
    {
        return this.mongoDbBox.getService(key);
    }

    isMongoDbService(key : string = 'default') : boolean
    {
        return this.mongoDbBox.isServiceExists(key);
    }

    // noinspection JSUnusedGlobalSymbols
    isCustomService(serviceName : string,key : string = 'default') : boolean
    {
        if(this.customServices[serviceName] instanceof ServiceBox)
        {
            return this.customServices[serviceName].isServiceExists(key);
        }
        else {
            return false;
        }
    }

    async getCustomService(serviceName : string,key : string = 'default') : Promise<any>
    {
        if(this.customServices[serviceName] instanceof ServiceBox)
        {
            return this.customServices[serviceName].getService(key);
        }
        else
        {
            throw new ServiceNotFoundError(serviceName,key);
        }
    }

}

export = ServiceEngine;