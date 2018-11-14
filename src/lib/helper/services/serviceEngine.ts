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
import ZationWorker         = require("../../main/zationWorker");
import Logger               = require("../logger/logger");

class ServiceEngine
{
    private readonly sc : object;
    private readonly csc : object;

    private readonly customServices : Record<string,ServiceBox>;

    private mySqlBox : ServiceBox;
    private nodeMailerBox : ServiceBox;
    private postgresSqlBox : ServiceBox;
    private mongoDbBox : ServiceBox;

    private readonly worker : ZationWorker;
    private readonly zc : ZationConfig;

    constructor(zc : ZationConfig,worker : ZationWorker)
    {
        this.worker = worker;
        this.zc = zc;

        // @ts-ignore
        this.sc = zc.serviceConfig.services;
        // @ts-ignore
        this.csc = zc.serviceConfig.customServices;

        if(this.sc === undefined) {this.sc = {};}
        if(this.csc === undefined) {this.csc = {};}

        this.customServices = {};
    }

    async check() : Promise<void>
    {
        let errorBox : string[] = [];
        let promises : Promise<void>[] = [];

        promises.push(this.mySqlBox.check(errorBox));
        promises.push(this.nodeMailerBox.check(errorBox));
        promises.push(this.postgresSqlBox.check(errorBox));
        promises.push(this.mongoDbBox.check(errorBox));

        //custom services
        for(let k in this.customServices){
            if(this.customServices.hasOwnProperty(k)){
                promises.push(this.customServices[k].check(errorBox));
            }
        }

        await Promise.all(promises);

        if(errorBox.length > 0){
            const info = `Worker with id:${this.worker.id} has errors while checking the services -> \n ${errorBox.join('\n')}`;
            if(this.zc.mainConfig.killServerOnServicesError){
                await this.worker.killServer(info);
            }
            else{
                Logger.printDebugWarning(info);
            }
        }
    }

    async init() : Promise<void>
    {
        let promises : Promise<void>[] = [];
        const errorBox : string[] = [];

        this.mySqlBox =
            new ServiceBox
            (
                nameof<Service>(s => s.mySql),
                this.sc[nameof<Service>(s => s.mySql)],
                async (c) : Promise<MySql.Pool> => {
                    return MySql.createPool(c);
                },
                undefined,
                async (s) : Promise<void> =>
                {
                    await new Promise<void | string>((resolve, reject) => {
                        s.getConnection((err,connection)=>{
                            if(err){reject(err);}
                            else{
                                connection.release();
                                resolve();
                            }
                        });
                    });
                }
            );
        promises.push(this.mySqlBox.init(errorBox));

        this.nodeMailerBox =
            new ServiceBox
            (
                nameof<Service>(s => s.nodeMailer),
                this.sc[nameof<Service>(s => s.nodeMailer)],
                async (c) : Promise<nodeMailer.Transporter> => {
                    return nodeMailer.createTransport(c);
                },
                undefined,
                async (t) : Promise<void> =>
                {
                    await new Promise<void | string>((resolve, reject) => {
                        t.verify(function(err) {
                            if (err) {reject(err);}
                            else {resolve();}
                        });
                    });
                }
            );
        promises.push(this.nodeMailerBox.init(errorBox));

        this.postgresSqlBox =
            new ServiceBox
            (
                nameof<Service>(s => s.postgresSql),
                this.sc[nameof<Service>(s => s.postgresSql)],
                async (c) : Promise<Pg.Pool> => {
                   return new Pg.Pool(c);
                   },
                undefined,
                async (s : Pg.Pool) : Promise<void | string> => {
                    await new Promise<void | string>((resolve, reject) => {
                        s.connect((err,client,release)=>{
                            if(err){reject(err);}
                            else{
                                release();
                                resolve();
                            }
                        });
                    });
                });
        promises.push(this.postgresSqlBox.init(errorBox));

        this.mongoDbBox =
            new ServiceBox
            (
                nameof<Service>(s => s.mongoDb),
                this.sc[nameof<Service>(s => s.mongoDb)],
                async (c : object) : Promise<MongoClient> =>
                {
                    let url : string = c['url'];
                    return await mongodb.MongoClient.connect(url,c);
                },
                undefined,
                async (s) : Promise<void | string> => {

                }
            );
        promises.push(this.mongoDbBox.init(errorBox));

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
                promises.push(this.customServices[k].init(errorBox));
            }
        }
        await Promise.all(promises);

        if(errorBox.length > 0){
            const info = `Worker with id:${this.worker.id} has errors while creating the services -> \n ${errorBox.join('\n')}`;
            if(this.zc.mainConfig.killServerOnServicesError){
                await this.worker.killServer(info);
            }
            else{
                Logger.printDebugWarning(info);
            }
        }
    }

    async getMySqlService(key : string = 'default') : Promise<MySql.Pool>
    {
        return this.mySqlBox.getService(key);
    }

    isMySqlService(key : string = 'default') : boolean
    {
        return this.mySqlBox.isServiceExists(key);
    }

    async getNodeMailerService(key : string = 'default') : Promise<nodeMailer.Transporter>
    {
        return this.nodeMailerBox.getService(key);
    }

    isNodeMailerService(key : string = 'default') : boolean
    {
        return this.nodeMailerBox.isServiceExists(key);
    }

    async getPostgresSqlService(key : string = 'default') : Promise<Pg.Pool>
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

    async getCustomService<S>(serviceName : string,key : string = 'default') : Promise<S>
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