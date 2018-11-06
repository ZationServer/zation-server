/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ServiceBox           = require('./serviceBox');
import ServiceNotFoundError = require("./serviceNotFoundError");

import MySql                = require("mysql");
import Pg                   = require('pg');
import nodeMailer           = require('nodemailer');
import mongodb              = require('mongodb');
import {MongoClient}          from "mongodb";
import ZationConfig         = require("../../main/zationConfig");
import {CustomService, Service} from "../configs/serviceConfig";

class ServiceEngine
{
    private readonly sc : object;
    private readonly csc : object;

    private readonly customServices : object;

    private mySqlServiceBox : ServiceBox;
    private nodeMailerServiceBox : ServiceBox;
    private postgresSqlBox : ServiceBox;
    private mongoDbBox : ServiceBox;

    constructor(zc : ZationConfig)
    {
        // @ts-ignore
        this.sc = zc.serviceConfig.services;
        // @ts-ignore
        this.csc = zc.serviceConfig.customServices;

        if(this.sc === undefined) {this.sc = {};}
        if(this.csc === undefined) {this.csc = {};}

        this.customServices = {};
    }

    async init() : Promise<void>
    {
        let promises : Promise<void>[] = [];

        this.mySqlServiceBox =
            new ServiceBox(nameof<Service>(s => s.mySql),this.sc[nameof<Service>(s => s.mySql)],
                async (c) : Promise<MySql.Pool> =>
            {
                return MySql.createPool(c);
            });
        promises.push(this.mySqlServiceBox.init());

        this.nodeMailerServiceBox =
            new ServiceBox(nameof<Service>(s => s.nodeMailer),this.sc[nameof<Service>(s => s.nodeMailer)],
                async (c) : Promise<nodeMailer.Transporter> =>
            {
                return nodeMailer.createTransport(c);
            });
        promises.push(this.nodeMailerServiceBox.init());

        this.postgresSqlBox =
            new ServiceBox(nameof<Service>(s => s.postgresSql),this.sc[nameof<Service>(s => s.postgresSql)],
               async (c) : Promise<Pg.Pool> =>
            {
                return new Pg.Pool(c);
            }, async (s) : Promise<Pg.Client> =>
            {
                return s.connect();

            });
        promises.push(this.postgresSqlBox.init());

        this.mongoDbBox =
            new ServiceBox(nameof<Service>(s => s.mongoDb),this.sc[nameof<Service>(s => s.mongoDb)],
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
                let howToCreate = this.csc[k][nameof<CustomService>(s => s.create)];
                let howToGet    = this.csc[k][nameof<CustomService>(s => s.get)];
                //remove
                delete this.csc[k][nameof<CustomService>(s => s.create)];
                delete this.csc[k][nameof<CustomService>(s => s.get)];

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