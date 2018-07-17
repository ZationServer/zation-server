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
import Pg               = require('pg');
import nodeMailer       = require('nodemailer');
import {MongoClient}      from "mongodb";
import {Options}          from "nodemailer/lib/mailer";

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
    /**
     * @description
     * Auth out an user
     * @param userId
     */
    publishAuthOut(userId : string | number) : void
    {
        this.exchangeEngine.publishAuthOut(userId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * ReAuth an user
     * @param userId
     */
    publishReAuth(userId : string | number) : void
    {
        this.exchangeEngine.publishReAuth(userId);
    }

    //Part Crypto

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Hash an string with sha512
     * @param string
     * @param salt
     */
    hashSha512(string : string,salt ?: string) : string
    {
        return this.hashIn('sha512',string,salt);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Hash an string
     * @param hash
     * @param string
     * @param salt
     */
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
    /**
     * @description
     * Returns an random string
     * @param length
     */
    getRandomString(length : number) : string
    {
        return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an generated uuid
     */
    generateUUID() : string
    {
        return UUID.generateUUID();
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an specify user channel or channels
     * @example
     * publishToSpecifyUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * publishToSpecifyUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array
     * @param eventName
     * @param data
     * @param cb
     */
    publishToSpecifyUser(userId : string | number | (number|string)[],eventName :string,data : object = {},cb ?: Function) : void
    {
        this.exchangeEngine.publishInUserCh(userId,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an specify user channel or channels
     * @example
     * pubSpecifyUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * pubSpecifyUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array
     * @param eventName
     * @param data
     * @param cb
     */
    pubSpecifyUser(userId : string | number | (number|string)[],eventName :string,data : object = {},cb ?: Function) : void
    {
        this.publishToSpecifyUser(userId,eventName,data,cb)
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to all channel
     * @example
     * publishToAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param cb
     */
    publishToAll(eventName : string,data : object = {},cb ?: Function) : void
    {
        this.exchangeEngine.publishInAllCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to all channel
     * @example
     * pubAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param cb
     */
    pubAll(eventName : string,data : object = {},cb ?: Function) : void
    {
        this.publishToAll(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to auth user group or groups
     * publishToAuthUserGroup('admin','userRegistered',{userId : '1'});
     * publishToAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups
     * @param eventName
     * @param data
     * @param cb
     */
    publishToAuthUserGroup(authUserGroup : string | string[], eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.exchangeEngine.publishInAuthUserGroupCh(authUserGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to auth user group or groups
     * @example
     * pubAuthUserGroup('admin','userRegistered',{userId : '1'});
     * pubAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups
     * @param eventName
     * @param data
     * @param cb
     */
    pubAuthUserGroup(authUserGroup : string | string[], eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToAuthUserGroup(authUserGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to default user group
     * @example
     * publishToDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param cb
     */
    publishToDefaultUserGroup(eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.exchangeEngine.publishInDefaultUserGroupCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to default user group
     * @example
     * pubDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param cb
     */
    pubDefaultUserGroup(eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToDefaultUserGroup(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups
     * @example
     * publishToAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param cb
     */
    publishToAllAuthUserGroups(eventName : string, data : object = {}, cb ?: Function) : void
    {
       this.exchangeEngine.publishToAllAuthUserGroupCh(eventName,data,this.zc,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups
     * @example
     * pubAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param cb
     */
    pubAllAuthUserGroups(eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToAllAuthUserGroups(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom id Channel
     * @example
     * publishToCustomIdChannel('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param cb
     */
    publishToCustomIdChannel(channel : string, id : string, eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.exchangeEngine.publishToCustomIdChannel(channel,id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom id Channel
     * @example
     * pubCustomIdChannel('imageChannel','image2','like',{fromUserId : '1'});
     * @param channel
     * @param id
     * @param eventName
     * @param data
     * @param cb
     */
    pubCustomIdChannel(channel : string, id : string, eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToCustomIdChannel(channel,id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel
     * @example
     * publishToCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * publishToCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels
     * @param eventName
     * @param data
     * @param cb
     */
    publishToCustomChannel(channel : string | string[], eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.exchangeEngine.publishToCustomChannel(channel, eventName, data, cb);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel or channels
     * @example
     * pubCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * pubCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels
     * @param eventName
     * @param data
     * @param cb
     */
    pubCustomChannel(channel : string | string[], eventName : string, data : object = {}, cb ?: Function) : void
    {
        this.publishToCustomChannel(channel, eventName, data, cb);
    }

    //Part Channel KickOut

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel or channels
     * @example
     * pubCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * pubCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param userId
     * @param channel or an array of channels
     * @param id
     * @param exceptTokenId
     */
    async kickUserFromCustomIdCh
    (
        userId : number | string | (number | string)[],
        channel : string,
        id ?: string,
        exceptTokenId ?: string[] | string
    ) : Promise<boolean>
    {
        return true;
    }

    async kickUserFromCustomCh
    (
        userId : number | string | (number | string)[],
        channel : string,
        exceptTokenId ?: string[] | string
    ) : Promise<boolean>
    {
        return true;
    }

    //Part Security

    async disconnectUser(userId : number | string | (number | string)[]) : Promise<boolean>
    {
        return true;
    }

    async disconnectToken(tokenId :  string | (string)[]) : Promise<boolean>
    {
        return true;
    }

    async deauthenticateUser(userId : number | string | (number | string)[]) : Promise<boolean>
    {
        return true;
    }

    async deauthenticateTokenId(tokenId :  string | (string)[]) : Promise<boolean>
    {
        return true;
    }

    //Part Database -> MySql

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Is for an mysql query
     * @example
     * const res = mySqlQuery('SELECT 1 + 1 AS solution');
     * const solution = res.results[0];
     * @throws ServiceNotFoundError
     * @param  query
     * @param  serviceKey
     * @return Promise<object>
     * The object has 2 fields,
     * one for the result ('result') and
     * one for the fields information ('fields')
     */
    mySqlQuery(query ,serviceKey : string = 'default') : Promise<object>
    {
        return new Promise(async (resolve, reject) =>
        {
            const service = await this.serviceEngine.getMySqlService(serviceKey);
            service.query(query,(error, results : object[], fields : MySql.FieldInfo[]) =>
            {
                if(error) {reject(error);}
                else{resolve({results : results, fields : fields});}
            });
        });
    }

    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    /**
     * @description
     * Format an mySql query
     * @example
     * mySqlFormat('SELECT * FROM ?? WHERE ?? = ?',['users', 'id', 10]);
     * @param  query
     * @param inserts
     * @param stringifyObjects?
     * @param  timeZone?
     * @return string
     */
    mySqlFormat(query: string, inserts: any[], stringifyObjects?: boolean, timeZone?: string) : string
    {
        return MySql.format(query,inserts,stringifyObjects,timeZone);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the service with this key is exist
     * and can be used.
     * @param  serviceKey
     */
    isMySql(serviceKey : string = 'default') : boolean
    {
        return this.serviceEngine.isMySqlService(serviceKey);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @throws ServiceNotFoundError
     * @param  serviceKey
     */
    async getMySql(serviceKey : string = 'default') : Promise<MySql.Pool>
    {
        return await this.serviceEngine.getMySqlService(serviceKey);
    }

    //Part Database -> PostgreSql

    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    /**
     * @throws ServiceNotFoundError
     * @param  serviceKey
     * the key to the service
     */
    async getPostgreSql(serviceKey : string = 'default') : Promise<Pg.Client>
    {
        return this.serviceEngine.getPostgresSqlService(serviceKey);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the service with this key is exist
     * and can be used.
     * @param  serviceKey
     */
    isPostgreSql(serviceKey : string = 'default') : boolean
    {
        return this.serviceEngine.isPostgresSqlService(serviceKey);
    }

    //Part Database -> MongoDb

    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    /**
     * @throws ServiceNotFoundError
     * @param  serviceKey
     * the key to the service
     */
    async getMongoDb(serviceKey : string = 'default') : Promise<MongoClient>
    {
        return this.serviceEngine.getMongoDbService(serviceKey);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the service with this key is exist
     * and can be used.
     * @param  serviceKey
     */
    isMongoDb(serviceKey : string = 'default') : boolean
    {
        return this.serviceEngine.isMongoDbService(serviceKey);
    }

    //Part NodeMailer

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Send an email, with use node mailer service
     * @example
     * let mailOptions = {
     *  from: '"Fred Foo 👻" <foo@example.com>', // sender address
     *  to: 'bar@example.com, baz@example.com', // list of receivers
     *  subject: 'Hello ✔', // Subject line
     *  text: 'Hello world?', // plain text body
     *  html: '<b>Hello world?</b>' // html body
     *  };
     * const info = await sendMail(mailOptions);
     * @throws ServiceNotFoundError
     * @param mailOptions
     * @param  serviceKey
     * @return Promise<object>
     * The object is an info object
     */
    sendMail(mailOptions : Options,serviceKey : string = 'default') : Promise<object>
    {
        return new Promise(async (resolve, reject) =>
        {
            const service = await this.serviceEngine.getNodeMailerService(serviceKey);
            service.sendMail(mailOptions,(error, info) =>
            {
                if(error) {reject(error);}
                else {resolve(info);}
            });
        });
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @throws ServiceNotFoundError
     * @param  serviceKey
     * the key to the service
     */
    async getNodeMailer(serviceKey : string = 'default') : Promise<nodeMailer.Transporter>
    {
        return await this.serviceEngine.getNodeMailerService(serviceKey);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the service with this key is exist
     * and can be used.
     * @param  serviceKey
     */
    isNodeMailer(serviceKey : string = 'default') : boolean
    {
        return this.serviceEngine.isNodeMailerService(serviceKey);
    }

    //Part Custom Services

    // noinspection JSUnusedGlobalSymbols
    /**
     * @throws ServiceNotFoundError
     * @param  name
     * The name of the custom service
     * @param  serviceKey
     * the key to the service
     */
    async getCustomService(name : string,serviceKey : string = 'default') : Promise<any>
    {
        return await this.serviceEngine.getCustomService(name,serviceKey);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the service with this key is exist
     * and can be used.
     * @param name
     * @param  serviceKey
     */
    isCustomService(name : string,serviceKey : string = 'default') : boolean
    {
        return this.serviceEngine.isCustomService(name,serviceKey);
    }

    //Part Errors

    getError(name)
    {


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
}

export = SmallBag;