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
    getZationVersion() : number
    {
        return this.worker._serverVersion;
    }

    // noinspection JSUnusedGlobalSymbols
    getServerStartedTimeStamp() : number
    {
        return this.worker._serverStartedTimeStamp;
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerStartedTimeStamp() : number
    {
        return this.worker._workerStartedTimeStamp;
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerId() : number
    {
        return this.worker.id;
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerFullId() : number
    {
        return this.worker.getWorkerFullId();
    }

    //Part Auth

    // noinspection JSUnusedGlobalSymbols
    publishAuthOut(userId) : void
    {
        this.exchangeEngine.publishAuthOut(userId);
    }

    // noinspection JSUnusedGlobalSymbols
    publishReAuth(userId) : void
    {
        this.exchangeEngine.publishReAuth(userId);
    }

    //Part Crypto

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    hashSha512(string,salt)
    {
        return this.hashIn('sha512',string,salt);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    hashIn(hash,string,salt)
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
    getRandomString(length)
    {
        return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    generateUUID()
    {
        return UUID.generateUUID();
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    publishToSpecifyUser(userId,eventName,data,cb)
    {
        this.exchangeEngine.publishInUserCh(userId,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubSpecifyUser(userId,eventName,data,cb)
    {
        this.publishToSpecifyUser(userId,eventName,data,cb)
    }

    // noinspection JSUnusedGlobalSymbols
    publishToSpecifyUsers(userIds,eventName,data,cb)
    {
        this.exchangeEngine.publishInUserChannels(userIds,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubSpecifyUsers(userIds,eventName,data,cb)
    {
        this.publishToSpecifyUsers(userIds,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAll(eventName,data,cb)
    {
        this.exchangeEngine.publishInAllCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAll(eventName,data,cb)
    {
        this.publishToAll(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAuthUserGroup(authUserGroup, eventName, data, cb)
    {
        this.exchangeEngine.publishInAuthUserGroupCh(authUserGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAuthUserGroup(authUserGroup, eventName, data, cb)
    {
        this.publishToAuthUserGroup(authUserGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToDefaultUserGroup(eventName, data, cb)
    {
        this.exchangeEngine.publishInDefaultUserGroupCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubDefaultUserGroup(eventName, data, cb)
    {
        this.publishToDefaultUserGroup(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAllAuthUserGroups(eventName, data, cb)
    {
       this.exchangeEngine.publishToAllAuthUserGroupCh(eventName,data,this.zc,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAllAuthUserGroups(eventName, data, cb)
    {
        this.publishToAllAuthUserGroups(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToCustomIdChannel(channel, id, eventName, data, cb)
    {
        this.exchangeEngine.publishToCustomIdChannel(channel,id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubCustomIdChannel(channel, id, eventName, data, cb)
    {
        this.publishToCustomIdChannel(channel,id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToCustomChannel(channel, eventName, data, cb)
    {
        this.exchangeEngine.publishToCustomChannel(channel, eventName, data, cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubCustomChannel(channel, eventName, data, cb)
    {
        this.publishToCustomChannel(channel, eventName, data, cb);
    }

    //Part Database -> MySql

    // noinspection JSUnusedGlobalSymbols
    mySqlQuery(query,serviceKey = 'default')
    {
        return new Promise((resolve, reject) =>
        {
            this.serviceEngine.getMySqlService(serviceKey).query(query,(error, results, fields) =>
            {
                if(error) {reject(error);}
                else{resolve({results : results, fields : fields});}
            });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    mySqlPrepareQuery(query,inserts,serviceKey = 'default')
    {
        return this.serviceEngine.getMySqlService(serviceKey).format(query,inserts);
    }

    // noinspection JSUnusedGlobalSymbols
    getMySql(serviceKey = 'default')
    {
        return this.serviceEngine.getMySqlService(serviceKey);
    }

    //Part Database -> PostgreSql

    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    getPostgreSql(serviceKey = 'default')
    {
        return this.serviceEngine.getPostgresSqlService(serviceKey);
    }

    //Part Database -> MongoDb

    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    getMongoDb(serviceKey = 'default')
    {
        return this.serviceEngine.getMongoDbService(serviceKey);
    }

    //Part NodeMailer

    // noinspection JSUnusedGlobalSymbols
    sendMail(mailOptions,serviceKey = 'default')
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
    getNodeMailer(serviceKey = 'default')
    {
        return this.serviceEngine.getNodeMailerService(serviceKey);
    }

    //Part Custom Services

    // noinspection JSUnusedGlobalSymbols
    getCustomService(name,serviceKey = 'default')
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