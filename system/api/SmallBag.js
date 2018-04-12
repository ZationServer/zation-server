/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const         = require('./../helper/constante/constWrapper');
const crypto        = require('crypto');
const ExchangeEngine= require('./../helper/channel/chExchangeEngine');

class SmallBag
{
    constructor(exchangeEngine,serviceEngine,zc)
    {
        this._exchangeEngine = exchangeEngine;
        this._serviceEngine = serviceEngine;
        this._zc = zc;
    }

    static getSmallBagFromWorker(worker)
    {
        let exchangeEngine = new ExchangeEngine(worker.scServer);
        return new SmallBag(exchangeEngine,worker.getServiceEngine(),worker.getZationConfig());
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
    getMySqlPool(serviceKey = 'default')
    {
        return this._serviceEngine.getMySqlService(serviceKey);
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
    getMailTransport(serviceKey = 'default')
    {
        return this._serviceEngine.getNodeMailerService(serviceKey);
    }

}

module.exports = SmallBag;