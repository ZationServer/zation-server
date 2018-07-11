/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ChExchangeEngine = require("../helper/channel/chExchangeEngine");
import ServiceEngine    = require("../helper/services/serviceEngine");
import ZationConfig     = require("../main/zationConfig");
import ZationWorker     = require("../main/zationWorker");
import Const            = require('../helper/constants/constWrapper');
let    crypto : any     = require('crypto');
let    IP : any         = require('ip');
import UUID             = require('../helper/tools/uuid');
import ExchangeEngine   = require('../helper/channel/chExchangeEngine');

import MySql            = require("mysql");
import {FieldInfo} from "mysql";



class SmallBag
{
    protected readonly exchangeEngine : ChExchangeEngine;
    protected readonly serviceEngine : ServiceEngine;
    protected readonly zc : ZationConfig;
    protected readonly worker : ZationWorker;
    
    constructor(worker : ZationWorker,exchangeEngine : ExchangeEngine = new ExchangeEngine(worker.scServer))
    {
        this.exchangeEngine = exchangeEngine;
        this.serviceEngine = worker.getServiceEngine();
        this.zc = worker.getZationConfig();
        this.worker = worker;
    }

    //PART Server
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getServerIpAddress() : string
    {
        return IP.address();
    }

    // noinspection JSUnusedGlobalSymbols
    getServerPort() : number
    {
        return this.zc.getMain(Const.Main.KEYS.PORT);
    }

    // noinspection JSUnusedGlobalSymbols
    getAppName() : string
    {
        return this.zc.getMain(Const.Main.KEYS.APP_NAME);
    }

    // noinspection JSUnusedGlobalSymbols
    getZationVersion() : string
    {
        return this.worker.getServerVersion();
    }

    // noinspection JSUnusedGlobalSymbols
    getServerStartedTimeStamp() : number
    {
        return this.worker.getServerStartedTime();
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerStartedTimeStamp() : number
    {
        return this.worker.getWorkerStartedTime();
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerId() : number
    {
        return this.worker.getWorkerId();
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerFullId() : string
    {
        return this.worker.getFullWorkerId()
    }

    //Part Auth

    // noinspection JSUnusedGlobalSymbols
    publishAuthOut(userId : string | number) : void
    {
        this.exchangeEngine.publishAuthOut(userId);
    }

    // noinspection JSUnusedGlobalSymbols
    publishReAuth(userId : string | number) : void
    {
        this.exchangeEngine.publishReAuth(userId);
    }

    //Part Crypto

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    hashSha512(string : string,salt ?: string) : string
    {
        return this.hashIn('sha512',string,salt);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    hashIn(hash : string,string : string,salt ?: string) : string
    {
        if(salt !== undefined)
        {
            return crypto.createHmac(hash,salt).update(string).digest('hex');
        }
        else
        {
            return crypto.createHash(hash).update(string).digest('hex');
        }
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    getRandomString(length : number) : string
    {
        return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    generateUUID() : string
    {
        return UUID.generateUUID();
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    publishToSpecifyUser(userId : string | number,eventName :string,data : object = {},cb ?: Function) : void
    {
        this.exchangeEngine.publishInUserCh(userId,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubSpecifyUser(userId : string | number,eventName :string,data : object = {},cb ?: Function) : void
    {
        this.publishToSpecifyUser(userId,eventName,data,cb)
    }

    // noinspection JSUnusedGlobalSymbols
    publishToSpecifyUsers(userIds : (string | number)[],eventName : string,data : object = {},cb ?: Function) : void
    {
        this.exchangeEngine.publishInUserChannels(userIds,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubSpecifyUsers(userIds : (string | number)[],eventName : string,data : object = {},cb ?: Function) : void
    {
        this.publishToSpecifyUsers(userIds,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAll(eventName : string,data : object = {},cb ?: Function) : void
    {
        this.exchangeEngine.publishInAllCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAll(eventName : string,data : object = {},cb ?: Function) : void
    {
        this.publishToAll(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAuthUserGroup(authUserGroup : string, eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.exchangeEngine.publishInAuthUserGroupCh(authUserGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAuthUserGroup(authUserGroup : string, eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToAuthUserGroup(authUserGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToDefaultUserGroup(eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.exchangeEngine.publishInDefaultUserGroupCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubDefaultUserGroup(eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToDefaultUserGroup(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAllAuthUserGroups(eventName : string, data : object = {}, cb ?: Function) : void
    {
       this.exchangeEngine.publishToAllAuthUserGroupCh(eventName,data,this.zc,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAllAuthUserGroups(eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToAllAuthUserGroups(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToCustomIdChannel(channel : string, id : string, eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.exchangeEngine.publishToCustomIdChannel(channel,id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubCustomIdChannel(channel : string, id : string, eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToCustomIdChannel(channel,id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToCustomChannel(channel : string, eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.exchangeEngine.publishToCustomChannel(channel, eventName, data, cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubCustomChannel(channel : string, eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToCustomChannel(channel, eventName, data, cb);
    }

    //Part Database -> MySql

    // noinspection JSUnusedGlobalSymbols
    mySqlQuery(query ,serviceKey : string = 'default') : Promise<Object>
    {
        return new Promise((resolve, reject) =>
        {
            this.serviceEngine.getMySqlService(serviceKey).query(query,(error, results, fields : MySql.FieldInfo[]) =>
            {
                if(error) {reject(error);}
                else{resolve({results : results, fields : fields});}
            });
        });
    }

    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    mySqlPrepareQuery(query,inserts,stringifyObjects?: boolean, timeZone?: string) : string
    {
        return MySql.format(query,inserts,stringifyObjects,timeZone);
    }

    // noinspection JSUnusedGlobalSymbols
    getMySql(serviceKey : string = 'default') : MySql.Pool | undefined
    {
        return this.serviceEngine.getMySqlService(serviceKey);
    }

    //Part Database -> PostgreSql

    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    getPostgreSql(serviceKey : string = 'default')
    {
        return this.serviceEngine.getPostgresSqlService(serviceKey);
    }

    //Part Database -> MongoDb

    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    getMongoDb(serviceKey : string = 'default')
    {
        return this.serviceEngine.getMongoDbService(serviceKey);
    }

    //Part NodeMailer

    // noinspection JSUnusedGlobalSymbols
    sendMail(mailOptions : object,serviceKey : string = 'default') : Promise<object>
    {
        return new Promise((resolve, reject) =>
        {
            this.serviceEngine.getNodeMailerService(serviceKey).sendMail(mailOptions,(error, info) =>
            {
                if(error) {reject(error);}
                else {resolve(info);}
            });
        });
    }
    // noinspection JSUnusedGlobalSymbols
    getNodeMailer(serviceKey : string = 'default')
    {
        return this.serviceEngine.getNodeMailerService(serviceKey);
    }

    //Part Custom Services

    // noinspection JSUnusedGlobalSymbols
    getCustomService(name : string,serviceKey : string = 'default')
    {
        return this.serviceEngine.getCustomService(name,serviceKey);
    }

    //Part Amazon s3
    // noinspection JSUnusedGlobalSymbols
    uploadFileToBucket()
    {
        //TODO

    }

    // noinspection JSUnusedGlobalSymbols
    getFileFromBucket()
    {
        //TODO

    }

    //Part TempDb Variables
    // noinspection JSUnusedGlobalSymbols
    async getTempDbVar(key)
    {
        //TODO


    }

    // noinspection JSUnusedGlobalSymbols
    async setTempDbVar(key,value)
    {
        //TODO

    }

}

export = SmallBag;