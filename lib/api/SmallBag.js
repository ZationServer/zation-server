/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const            = require('../helper/constants/constWrapper');
const crypto           = require('crypto');
const IP               = require('ip');
const UUID             = require('./../helper/tools/uuid');
const ExchangeEngine   = require('./../helper/channel/chExchangeEngine');

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
        return this._zc.getMain(Const.Main.PORT);
    }

    // noinspection JSUnusedGlobalSymbols
    getAppName()
    {
        return this._zc.getMain(Const.Main.APP_NAME);
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
    publishAuthOut(id)
    {
        this._exchangeEngine.publishAuthOut(id);
    }

    // noinspection JSUnusedGlobalSymbols
    publishReAuth(id)
    {
        this._exchangeEngine.publishReAuth(id);
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
    publishToSpecifyUser(id,eventName,data,cb)
    {
        this._exchangeEngine.publishInUserCh(id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToSpecifyUsers(ids,eventName,data,cb)
    {
        this._exchangeEngine.publishInUserChannels(ids,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAll(eventName,data,cb)
    {
        this._exchangeEngine.publishInAllCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAuthGroup(authGroup,eventName,data,cb)
    {
        this._exchangeEngine.publishInAuthGroupCh(authGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToDefaultGroup(eventName,data,cb)
    {
        this._exchangeEngine.publishInDefaultGroupCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAllAuthGroups(eventName,data,cb)
    {
        let groups = this._zc.getApp(Const.App.GROUPS)[Const.App.GROUPS_AUTH_GROUPS];
        for(let k in groups)
        {
            if(groups.hasOwnProperty(k))
            {
                this.publishToAuthGroup(groups[k],eventName,data,cb);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    publishInSpecialChannel(channel,id,eventName,data,cb)
    {
        this._exchangeEngine.publishInSpecialChannel(channel,id,eventName,data,cb);
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

    //Part User Services

    getService(name)
    {


    }

}

module.exports = SmallBag;