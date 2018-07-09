/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../helper/constants/constWrapper');
const crypto           = require('crypto');
const IP               = require('ip');
const UUID             = require('../helper/tools/uuid');
const ExchangeEngine   = require('../helper/channel/chExchangeEngine');

class SmallBag
{
    constructor(worker,exchangeEngine = new ExchangeEngine(worker.scServer))
    {
        this._exchangeEngine = exchangeEngine;
        this._serviceEngine = worker.getServiceEngine();
        this._zc = worker.getZationConfig();
        this._worker = worker;
    }

    //PART Server

    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getServerIpAddress()
    {
        return IP.address();
    }

    // noinspection JSUnusedGlobalSymbols
    getServerPort()
    {
        return this._zc.getMain(Const.Main.KEYS.PORT);
    }

    // noinspection JSUnusedGlobalSymbols
    getAppName()
    {
        return this._zc.getMain(Const.Main.KEYS.APP_NAME);
    }

    // noinspection JSUnusedGlobalSymbols
    getZationVersion()
    {
        return this._worker._serverVersion;
    }

    // noinspection JSUnusedGlobalSymbols
    getServerStartedTimeStamp()
    {
        return this._worker._serverStartedTimeStamp;
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerStartedTimeStamp()
    {
        return this._worker._workerStartedTimeStamp;
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerId()
    {
        return this._worker.id;
    }

    // noinspection JSUnusedGlobalSymbols
    getWorkerFullId()
    {
        return this._worker.getWorkerFullId();
    }

    //Part Auth

    // noinspection JSUnusedGlobalSymbols
    publishAuthOut(userId)
    {
        this._exchangeEngine.publishAuthOut(userId);
    }

    // noinspection JSUnusedGlobalSymbols
    publishReAuth(userId)
    {
        this._exchangeEngine.publishReAuth(userId);
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
        this._exchangeEngine.publishInUserCh(userId,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubSpecifyUser(userId,eventName,data,cb)
    {
        this.publishToSpecifyUser(userId,eventName,data,cb)
    }

    // noinspection JSUnusedGlobalSymbols
    publishToSpecifyUsers(userIds,eventName,data,cb)
    {
        this._exchangeEngine.publishInUserChannels(userIds,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubSpecifyUsers(userIds,eventName,data,cb)
    {
        this.publishToSpecifyUsers(userIds,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAll(eventName,data,cb)
    {
        this._exchangeEngine.publishInAllCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAll(eventName,data,cb)
    {
        this.publishToAll(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAuthUserGroup(authUserGroup, eventName, data, cb)
    {
        this._exchangeEngine.publishInAuthUserGroupCh(authUserGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAuthUserGroup(authUserGroup, eventName, data, cb)
    {
        this.publishToAuthUserGroup(authUserGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToDefaultUserGroup(eventName, data, cb)
    {
        this._exchangeEngine.publishInDefaultUserGroupCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubDefaultUserGroup(eventName, data, cb)
    {
        this.publishToDefaultUserGroup(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAllAuthUserGroups(eventName, data, cb)
    {
       this._exchangeEngine.publishToAllAuthUserGroupCh(eventName,data,cb,this._zc);
    }

    // noinspection JSUnusedGlobalSymbols
    pubAllAuthUserGroups(eventName, data, cb)
    {
        this.publishToAllAuthUserGroups(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToCustomIdChannel(channel, id, eventName, data, cb)
    {
        this._exchangeEngine.publishToCustomIdChannel(channel,id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    pubCustomIdChannel(channel, id, eventName, data, cb)
    {
        this.publishToCustomIdChannel(channel,id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToCustomChannel(channel, eventName, data, cb)
    {
        this._exchangeEngine.publishToCustomChannel(channel, eventName, data, cb);
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
            this._serviceEngine.getMySqlService(serviceKey).query(query,(error, results, fields) =>
            {
                if(error) {reject(error);}
                else{resolve({results : results, fields : fields});}
            });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    mySqlPrepareQuery(query,inserts,serviceKey = 'default')
    {
        return this._serviceEngine.getMySqlService(serviceKey).format(query,inserts);
    }

    // noinspection JSUnusedGlobalSymbols
    getMySql(serviceKey = 'default')
    {
        return this._serviceEngine.getMySqlService(serviceKey);
    }

    //Part Database -> PostgreSql

    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    getPostgreSql(serviceKey = 'default')
    {
        return this._serviceEngine.getPostgresSqlService(serviceKey);
    }

    //Part Database -> MongoDb

    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    getMongoDb(serviceKey = 'default')
    {
        return this._serviceEngine.getMongoDbService(serviceKey);
    }

    //Part NodeMailer

    // noinspection JSUnusedGlobalSymbols
    sendMail(mailOptions,serviceKey = 'default')
    {
        return new Promise((resolve, reject) =>
        {
            this._serviceEngine.getNodeMailerService(serviceKey).sendMail(mailOptions,(error,info) =>
            {
                if(error) {reject(error);}
                else {resolve(info);}
            });
        });
    }
    // noinspection JSUnusedGlobalSymbols
    getNodeMailer(serviceKey = 'default')
    {
        return this._serviceEngine.getNodeMailerService(serviceKey);
    }

    //Part Custom Services

    // noinspection JSUnusedGlobalSymbols
    getCustomService(name,serviceKey = 'default')
    {
        return this._serviceEngine.getCustomService(name,serviceKey);
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