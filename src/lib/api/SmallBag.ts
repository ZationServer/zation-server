/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Socket}             from "../helper/sc/socket";
import {MongoClient}        from "mongodb";
import {Options}            from "nodemailer/lib/mailer";
import fetch, {Request, RequestInit, Response} from 'node-fetch';
import {WorkerChTaskActions} from "../helper/constants/workerChTaskActions";
import {WorkerChTargets}     from "../helper/constants/workerChTargets";

const    crypto : any       = require('crypto');
const    IP : any           = require('ip');
import ChExchangeEngine     = require("../helper/channel/chExchangeEngine");
import ServiceEngine        = require("../helper/services/serviceEngine");
import ZationConfig         = require("../main/zationConfig");
import ZationWorker         = require("../main/zationWorker");
import Const                = require('../helper/constants/constWrapper');
const  uuidV4               = require('uuid/v4');
const uniqid                = require('uniqid');
import ExchangeEngine       = require('../helper/channel/chExchangeEngine');
import MySql                = require("mysql");
import Pg                   = require('pg');
import nodeMailer           = require('nodemailer');
import TaskError            = require("./TaskError");
import ChTools              = require("../helper/channel/chTools");
import IdTools              = require("../helper/tools/idTools");
import ObjectPath           = require("../helper/tools/objectPath");
import TokenTools           = require("../helper/token/tokenTools");

class SmallBag
{
    protected readonly exchangeEngine : ChExchangeEngine;
    protected readonly serviceEngine : ServiceEngine;
    protected readonly zc : ZationConfig;
    protected readonly worker : ZationWorker;
    
    constructor(worker : ZationWorker,exchangeEngine : ExchangeEngine = new ExchangeEngine(worker))
    {
        this.exchangeEngine = exchangeEngine;
        this.serviceEngine = worker.getServiceEngine();
        this.zc = worker.getZationConfig();
        this.worker = worker;
    }

    //PART Server
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getServerIpAddress() : string {
        // noinspection TypeScriptValidateJSTypes
        return IP.address();
    }

    // noinspection JSUnusedGlobalSymbols
    getServerPort() : number
    {
        return this.zc.getMain(Const.Main.KEYS.PORT);
    }

    // noinspection JSUnusedGlobalSymbols
    getServerInstanceId() : string
    {
        return this.worker.options.instanceId;
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
        if(salt !== undefined) {
            return crypto.createHmac(hash,salt).update(string).digest('hex');
        }
        else {
            return crypto.createHash(hash).update(string).digest('hex');
        }
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random string
     * @param length
     */
    getRandomString(length : number = 16) : string
    {
        return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an generated uuid v4
     */
    generateUUIDv4() : string {
        return uuidV4();
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an generated unique id
     */
    generateUniqueId() : string {
        return uniqid();
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an user channel or channels
     * @example
     * publishToUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * publishToUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishToUser(userId : string | number | (number|string)[],eventName :string,data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.exchangeEngine.publishInUserCh(userId,eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an user channel or channels
     * @example
     * pubUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * pubUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubUser(userId : string | number | (number|string)[],eventName :string,data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.publishToUser(userId,eventName,data,srcSocketSid)
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to all channel
     * @example
     * publishToAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishToAll(eventName : string,data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.exchangeEngine.publishInAllCh(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to all channel
     * @example
     * pubAll('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubAll(eventName : string,data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.publishToAll(eventName,data,srcSocketSid);
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
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishToAuthUserGroup(authUserGroup : string | string[], eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.exchangeEngine.publishInAuthUserGroupCh(authUserGroup,eventName,data,srcSocketSid);
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
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubAuthUserGroup(authUserGroup : string | string[], eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.publishToAuthUserGroup(authUserGroup,eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to default user group
     * @example
     * publishToDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishToDefaultUserGroup(eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.exchangeEngine.publishInDefaultUserGroupCh(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to default user group
     * @example
     * pubDefaultUserGroup('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubDefaultUserGroup(eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.publishToDefaultUserGroup(eventName,data,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups
     * @example
     * publishToAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishToAllAuthUserGroups(eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.exchangeEngine.publishToAllAuthUserGroupCh(eventName,data,this.zc,srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups
     * @example
     * pubAllAuthUserGroups('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubAllAuthUserGroups(eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.publishToAllAuthUserGroups(eventName,data,srcSocketSid);
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
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishToCustomIdChannel(channel : string, id : string, eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.exchangeEngine.publishToCustomIdChannel(channel,id,eventName,data,srcSocketSid);
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
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubCustomIdChannel(channel : string, id : string, eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.publishToCustomIdChannel(channel,id,eventName,data,srcSocketSid);
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
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishToCustomChannel(channel : string | string[], eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return this.exchangeEngine.publishToCustomChannel(channel,eventName,data,srcSocketSid);
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
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubCustomChannel(channel : string | string[], eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.publishToCustomChannel(channel,eventName,data,srcSocketSid);
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

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns taskError with Info from the error config file
     * @throws ErrorNotFoundError
     * @param errorName
     */
    getErrorConstruct(errorName : string) : Object
    {
        return this.zc.getError(name);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns taskError with Info from the error config file
     * @throws ErrorNotFoundError
     * @param errorName
     * @param info
     */
    getTaskError(errorName : string,info : object = {}) : TaskError
    {
        const errorOp = this.zc.getError(name);
        return new TaskError(errorOp,info);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the error with this name is exist
     * and can be used.
     * @param name
     */
    isErrorConstruct(name : string) : boolean
    {
        return this.zc.isError(name);
    }

    //Part Http
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    async fetch(url: string | Request, init?: RequestInit): Promise<Response>
    {
        return await fetch(url,init);
    }

    //Part Channel KickOut

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with userId from an custom id channel (server side)
     * @example
     * kickUserCustomIdCh('user20','chatGroup');
     * kickUserCustomIdCh(['tom39','lara23'],'image','2');
     * kickUserCustomIdCh(['tom39','lara23'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array
     * @param channel is optional, if it is not given the users will be kicked out from all custom id channels.
     * @param id is optional, if it is not given the users will be kicked out from all ids of this channel.
     * @param exceptSocketSids
     */
    async kickUserCustomIdCh(userId : number | string | (number | string)[], channel ?: string, id ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomIdChannelName(channel,id);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChTaskActions.KICK_OUT,userId,exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with userId from an custom channel (server side)
     * @example
     * kickUserCustomCh('user20','chatGroup');
     * kickUserCustomCh(['tom39','lara23'],'image');
     * kickUserCustomCh(['tom39','lara23'],'image','EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array
     * @param channel is optional, if it is not given the users will be kicked out from all custom channels.
     * @param exceptSocketSids
     */
    async kickUserCustomCh(userId : number | string | (number | string)[], channel ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomChannelName(channel);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChTaskActions.KICK_OUT,userId,exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with userId from all channel (server side)
     * @example
     * kickUserAllCh('user20');
     * kickUserAllCh(['tom39','lara23']);
     * kickUserAllCh(['tom39','lara23'],'EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array
     * @param exceptSocketSids
     */
    async kickUserAllCh(userId : number | string | (number | string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS,WorkerChTaskActions.KICK_OUT,userId,exceptSocketSids,{ch : Const.Settings.CHANNEL.ALL});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with userId from auth user group channel (server side)
     * @example
     * kickUserAuthUserGroupCh('user20','user');
     * kickUserAuthUserGroupCh(['tom39','lara23'],'user');
     * kickUserAuthUserGroupCh(['tom39','lara23'],'user','EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array
     * @param authUserGroup is optional, if it is not given the users will be kicked out from all auth user group channels.
     * @param exceptSocketSids
     */
    async kickUserAuthUserGroupCh(userId : number | string | (number | string)[],authUserGroup ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS,WorkerChTaskActions.KICK_OUT,userId,exceptSocketSids,{ch : ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with userId from default user group channel (server side)
     * @example
     * kickUserDefaultUserGroupCh('user20');
     * kickUserDefaultUserGroupCh(['tom39','lara23']);
     * kickUserDefaultUserGroupCh(['tom39','lara23'],'EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array
     * @param exceptSocketSids
     */
    async kickUserDefaultUserGroupCh(userId : number | string | (number | string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS,WorkerChTaskActions.KICK_OUT,userId,exceptSocketSids,{ch : Const.Settings.CHANNEL.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from an custom id channel (server side)
     * @example
     * kickTokenCustomIdCh('TOKEN-UUID1','chatGroup');
     * kickTokenCustomIdCh(['TOKEN-UUID1,'TOKEN-UUID2'],'image','2');
     * kickTokenCustomIdCh(['TOKEN-UUID1,'TOKEN-UUID2'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array
     * @param channel is optional, if it is not given the sockets with tokenId will be kicked out from all custom id channels.
     * @param id is optional, if it is not given the sockets with tokenId will be kicked out from all ids of this channel.
     * @param exceptSocketSids
     */
    async kickTokenCustomIdCh(tokenId : string | string[], channel ?: string, id ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomIdChannelName(channel,id);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from an custom channel (server side)
     * @example
     * kickTokenCustomCh('TOKEN-UUID1','chatGroup');
     * kickTokenCustomCh(['TOKEN-UUID1,'TOKEN-UUID2'],'image','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array
     * @param channel is optional, if it is not given the sockets with tokenId will be kicked out from all custom channels.
     * @param exceptSocketSids
     */
    async kickTokenCustomCh(tokenId : string | string[], channel ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomChannelName(channel);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from all channel (server side)
     * @example
     * kickTokenAllCh('TOKEN-UUID1');
     * kickTokenCustomCh(['TOKEN-UUID1,'TOKEN-UUID2'],'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array
     * @param exceptSocketSids
     */
    async kickTokenAllCh(tokenId : string | string[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch : Const.Settings.CHANNEL.ALL});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from auth user group channel (server side)
     * @example
     * kickTokenAuthUserGroupCh('TOKEN-UUID1','user');
     * kickTokenAuthUserGroupCh(['TOKEN-UUID1,'TOKEN-UUID2'],'user','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array
     * @param authUserGroup is optional, if it is not given the sc with token id will be kicked out from all auth user group channels.
     * @param exceptSocketSids
     */
    async kickTokenAuthUserGroupCh(tokenId : string | string[],authUserGroup ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch : ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from default user group channel (server side)
     * @example
     * kickTokenDefaultUserGroupCh('TOKEN-UUID1');
     * kickTokenDefaultUserGroupCh(['TOKEN-UUID1,'TOKEN-UUID2'],'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array
     * @param exceptSocketSids
     */
    async kickTokenDefaultUserGroupCh(tokenId : string | string[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch : Const.Settings.CHANNEL.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from an custom id channel
     * @example
     * kickOutAllSocketsCustomIdCh('CUSTOM-CH-NAME','ID');
     * @param channel is optional, if it is not given the sockets will be kicked out from all custom id channels.
     * @param id is optional, if it is not given the sockets will be kicked out from all ids of this channel.
     * @param exceptSocketSids
     */
    async kickAllSocketsCustomIdCh(channel ?: string, id ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomIdChannelName(channel, id);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch : ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from an custom channel
     * @example
     * kickOutAllSocketsCustomCh('CUSTOM-CH-NAME');
     * @param channel is optional, if it is not given the sockets will be kicked out from all custom channels.
     * @param exceptSocketSids
     */
    async kickAllSocketsCustomCh(channel ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomChannelName(channel);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch : ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from all channel
     * @example
     * kickOutAllSocketsAllCh();
     * @param exceptSocketSids
     */
    async kickAllSocketsAllCh(exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch : Const.Settings.CHANNEL.ALL});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from auth user group channel
     * @example
     * kickOutAllSocketsAuthUserGroupCh() ;
     * @param authUserGroup is optional, if it is not given all sockets will be kicked out from all auth user group channels.
     * @param exceptSocketSids
     */
    async kickAllSocketsAuthUserGroupCh(authUserGroup ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch : ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from default user group channel
     * @example
     * kickOutAllSocketsDefaultUserGroupCh() ;
     * @param exceptSocketSids
     */
    async kickAllSocketsDefaultUserGroupCh(exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch : Const.Settings.CHANNEL.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with sid from an custom id channel (server side)
     * @example
     * kickSocketsCustomIdCh('SOCKET-SID','chatGroup');
     * kickSocketsCustomIdCh(['SOCKET-SID-1','SOCKET-SID-2'],'image','2');
     * @param socketSid or more socketSids in an array
     * @param channel is optional, if it is not given the sockets will be kicked out from all custom id channels.
     * @param id is optional, if it is not given the sockets will be kicked out from all ids of this channel.
     */
    async kickSocketsCustomIdCh(socketSid : string | string[], channel ?: string, id ?: string) : Promise<void>
    {
        const ch = ChTools.buildCustomIdChannelName(channel,id);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChTaskActions.KICK_OUT,socketSid,[],{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with sid from an custom channel (server side)
     * @example
     * kickSocketsCustomCh('SOCKET-SID','chatGroup');
     * kickSocketsCustomCh(['SOCKET-SID-1','SOCKET-SID-2'],'image');
     * @param socketSid or more socketSids in an array
     * @param channel is optional, if it is not given the sockets will be kicked out from all custom channels.
     */
    async kickSocketsCustomCh(socketSid : string | string[], channel ?: string) : Promise<void>
    {
        const ch = ChTools.buildCustomChannelName(channel);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChTaskActions.KICK_OUT,socketSid,[],{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with sid from all channel (server side)
     * @example
     * kickSocketsAllCh('SOCKET-SID');
     * kickSocketsAllCh(['SOCKET-SID-1','SOCKET-SID-2']);
     * @param socketSid or more socketSids in an array
     */
    async kickSocketsAllCh(socketSid : string | string[]) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.KICK_OUT,socketSid,[],{ch : Const.Settings.CHANNEL.ALL});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with sid from auth user group channel (server side)
     * @example
     * kickSocketsAuthUserGroupCh('SOCKET-SID','user');
     * kickSocketsAuthUserGroupCh(['SOCKET-SID-1','SOCKET-SID-2'],'user');
     * @param socketSid or more socketSids in an array
     * @param authUserGroup is optional, if it is not given the sockets will be kicked out from all auth user group channels.
     */
    async kickSocketsAuthUserGroupCh(socketSid : string | string[],authUserGroup ?: string) : Promise<void>
    {
        const ch = ChTools.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.KICK_OUT,socketSid,[],{ch : ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with sid from default user group channel (server side)
     * @example
     * kickSocketsDefaultUserGroupCh('SOCKET-SID');
     * kickSocketsDefaultUserGroupCh(['SOCKET-SID-1','SOCKET-SID-2']);
     * @param socketSid or more socketSids in an array
     */
    async kickSocketsDefaultUserGroupCh(socketSid : string | string[]) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.KICK_OUT,socketSid,[],{ch : Const.Settings.CHANNEL.DEFAULT_USER_GROUP});
    }

    //Part Extra Emit
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system with user id (server side)
     * @example
     * emitUser('joel2','myEvent',{myData : 'test'});
     * emitUser('joel2','myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitUser(userId : number | string | (number | string)[],event : string,data : any = {},exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS,WorkerChTaskActions.EMIT,userId,exceptSocketSids,{event,data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system with token id (server side)
     * @example
     * emitToken('TOKEN-UUID1','myEvent',{myData : 'test'});
     * emitToken('TOKEN-UUID2','myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitToken(tokenId : string | string[],event : string,data : any = {},exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.EMIT,tokenId,exceptSocketSids,{event,data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system (server side)
     * @example
     * emitAllSockets('myEvent',{myData : 'test'});
     * emitAllSockets('myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitAllSockets(event : string,data : any = {},exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.EMIT,[],exceptSocketSids,{event,data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets with sid on complete system (server side)
     * @example
     * emitSockets('SOCKET-SID','myEvent',{myData : 'test'});
     * emitSockets(['SOCKET-SID-1','SOCKET-SID-2'],'myEvent',{myData : 'test'});
     * @param socketSid or more socketSids in an array
     * @param event
     * @param data
     */
    async emitSockets(socketSid : string | string[],event : string,data : any = {}) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.EMIT,socketSid,[],{event,data});
    }


    //Part Security

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system with user id (server side)
     * @example
     * disconnectUser(['tim902','leonie23']);
     * disconnectUser('tim902');
     * disconnectUser('tim902','EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array
     * @param exceptSocketSids
     */
    async disconnectUser(userId : number | string | (number | string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS,WorkerChTaskActions.DISCONNECT,userId,exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system with token id (server side)
     * @example
     * disconnectToken(['TOKEN-UUID1','TOKEN-UUID2']);
     * disconnectToken('TOKEN-UUID1');
     * disconnectToken('TOKEN-UUID1','EXCEPT-SOCKET-SID'');
     * @param tokenId or more tokenIds in an array
     * @param exceptSocketSids
     */
    async disconnectToken(tokenId : string | string[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.DISCONNECT,tokenId,exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system (server side)
     * @example
     * disconnectAllSockets('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async disconnectAllSockets(exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.DISCONNECT,[],exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system with sid (server side)
     * @example
     * disconnectSockets(['SOCKET-SID-1','SOCKET-SID-2']);
     * disconnectSockets('SOCKET-SID');
     * @param socketSid or more socketSids in an array
     */
    async disconnectSockets(socketSid : string | string[]) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.DISCONNECT,socketSid,[]);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system with user id/s (server side)
     * @example
     * deauthenticateUser(['tim902','leonie23']);
     * deauthenticateUser('tim902');
     * deauthenticateUser('tim902','EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array
     * @param exceptSocketSids
     */
    async deauthenticateUser(userId : number | string | (number | string)[] | number | string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS,WorkerChTaskActions.DEAUTHENTICATE,userId,exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system with token id/s (server side)
     * @example
     * deauthenticateToken(['TOKEN-UUID1','TOKEN-UUID2']);
     * deauthenticateToken('TOKEN-UUID2');
     * deauthenticateToken('TOKEN-UUID2','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array
     * @param exceptSocketSids
     */
    async deauthenticateToken(tokenId : string | string[] | string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.DEAUTHENTICATE,tokenId,exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system (server side)
     * @example
     * deauthenticateAllSockets('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async deauthenticateAllSockets(exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.DEAUTHENTICATE,[],exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system with sid (server side)
     * @example
     * deauthenticateSockets(['SOCKET-SID-1','SOCKET-SID-2']);
     * deauthenticateSockets('SOCKET-SID');
     * @param socketSid or more socketSids in an array
     */
    async deauthenticateSockets(socketSid : string | string[] | string) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.DEAUTHENTICATE,socketSid,[]);
    }

    //Part Socket Tools

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns user id from sc (if authenticated and has one)
     * @example
     * getUserIdFromSocket(sc);
     * @param socket
     */
    getUserIdFromSocket(socket : Socket) : string | number | undefined {
        return TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.USER_ID,socket);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns user group from sc (if authenticated)
     * @example
     * getUserIdFromSocket(sc);
     * @param socket
     */
    getAuthUserGroupFromSocket(socket : Socket) : string | undefined {
        return TokenTools.getSocketTokenVariable(Const.Settings.TOKEN.AUTH_USER_GROUP,socket);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the socketId from the socketSid.
     * @example
     * socketSidToSocketId('SOCKET-SID');
     * @param socketSid
     */
    socketSidToSocketId(socketSid : string) : string
    {
        return IdTools.socketSidToSocketId(socketSid);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the server instance id from the socketSid.
     * @example
     * socketSidToSeverId(SOCKET-SID');
     * @param socketSid
     */
    socketSidToSeverId(socketSid : string) : string
    {
        return IdTools.socketSidToServerInstanceId(socketSid);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the worker id from the socketSid.
     * @example
     * socketSidToWorkerId('SOCKET-SID');
     * @param socketSid
     */
    socketSidToWorkerId(socketSid : string) : string
    {
        return IdTools.socketSidToWorkerId(socketSid);
    }

    //Part ServerSocketVariable

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Set sc variable (server side) with object path
     * @example
     * setSocketVariable('email','example@gmail.com');
     * @param socket
     * @param path
     * @param value
     */
    setSocketVariableWithSocket(socket : Socket,path : string | string[],value : any) : void
    {
        ObjectPath.set(socket[Const.Settings.SOCKET.VARIABLES],path,value);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Has sc variable (server side) with object path
     * @example
     * hasSocketVariable('email');
     * @param socket
     * @param path
     */
    hasSocketVariableWithSocket(socket : Socket,path ?: string | string[]) : boolean
    {
        return ObjectPath.has(socket[Const.Settings.SOCKET.VARIABLES],path);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Get sc variable (server side) with object path
     * @example
     * getSocketVariable('email');
     * @param socket
     * @param path
     */
    getSocketVariableWithSocket(socket : Socket,path ?: string | string[]) : any
    {
        return ObjectPath.get(socket[Const.Settings.SOCKET.VARIABLES],path);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Delete sc variable (server side) with object path
     * @example
     * deleteSocketVariable('email');
     * @param socket
     * @param path
     */
    deleteSocketVariableWithSocket(socket : Socket,path ?: string | string[]) : void
    {
        if(!!path) {
            ObjectPath.del(socket[Const.Settings.SOCKET.VARIABLES],path);
        }
        else {
            socket[Const.Settings.SOCKET.VARIABLES] = {};
        }
    }

    //Part Worker

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the sc with the socketId
     * You have only protocolAccess to sockets they are connected to this worker.
     * @example
     * getWorkerSocket('SOCKET-ID');
     * @param socketId
     */
    getWorkerSocket(socketId : string) : Socket | undefined
    {
        return this.worker.scServer.clients[socketId];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the clients of the worker
     * Key are socketIds and value are sockets
     * @example
     * getWorkerClients();
     */
    getWorkerClients() : object
    {
        return this.worker.scServer.clients;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the number of connected clients to this worker
     * @example
     * getWorkerConnectedClientsCount();
     */
    getWorkerConnectedClientsCount() : number {
        return this.worker.getStatus().clientCount;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns http requests per minute
     */
    getWorkerHttpRequestPerMinute() : number {
        return this.worker.getStatus().httpRPM;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns web sockets requests per minute
     */
    getWorkerWsRequestPerMinute() : number {
        return this.worker.getStatus().wsRPM;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns all sockets from this worker that subscribes the custom channel
     * @example
     * getWorkerSocketSubsCustomCh('CH-NAME');
     */
    getWorkerSocketSubsCustomCh(channel : string) : Socket[] {
        return this.worker.getCustomChToScMapper().getValues(channel);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns all sockets from this worker that subscribes the custom id channel
     * @example
     * getWorkerSocketSubsCustomIdCh('CH-NAME','ID');
     */
    getWorkerSocketSubsCustomIdCh(channel : string, id : string) : Socket[] {
        return this.worker.getCustomIdChToScMapper().getValues(`${channel}.${id}`);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socketSids from socketId
     * Only for ids they are found on the worker!
     * @example
     * convertSocketIdToSid('SOCKET-ID-1','SOCKET-ID-2');
     * @param socketIds
     */
    convertSocketIdToSid(...socketIds : string[]) : string[]
    {
        const res : string[] = [];
        socketIds.forEach((id) => {
            let socket : Socket | undefined = this.getWorkerSocket(id);
            if(!!socket) {
                res.push(socket.sid);
            }
        });
        return res;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socketIds from sc with the tokenId
     * You have only protocolAccess to socketsIds they are connected to this worker.
     * @example
     * getSocketIdsWithTokenId('TOKEN-ID');
     * @param tokenId
     */
    getSocketIdsWithTokenId(tokenId : string) : string[]
    {
        return this.worker.getTokenIdToScIdMapper().getValues(tokenId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socketSids from sc with the tokenId
     * You have only protocolAccess to socketsSids they are connected to this worker.
     * @example
     * getSocketSidsWithTokenId('TOKEN-ID');
     * @param tokenId
     */
    getSocketSidsWithTokenId(tokenId : string) : string[]
    {
        return this.convertSocketIdToSid(...this.getSocketIdsWithTokenId(tokenId));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socketIds from sockets with the userId
     * You have only protocolAccess to socketsIds they are connected to this worker.
     * @example
     * getSocketIdsWithUserId('tom1554');
     * @param userId
     */
    getSocketIdsWithUserId(userId : string) : string[]
    {
        return this.worker.getUserToScIdMapper().getValues(userId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description&
     * Returns the socketSids from sockets with the userId
     * You have only protocolAccess to socketsSids they are connected to this worker.
     * @example
     * getSocketSidsWithUserId('tom1554');
     * @param userId
     */
    getSocketSidsWithUserId(userId : string) : string[]
    {
        return this.convertSocketIdToSid(...this.getSocketIdsWithUserId(userId));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns object with authUserGroups as key
     * and value with count of connected clients (only this worker)
     */
    getWorkerAuthUserGroupsCount() : object {
       const res = {};
       const authGroups = this.worker.getAEPreparedPart().getAuthGroups();
       for(let group in authGroups) {
           if(authGroups.hasOwnProperty(group)) {
               res[group] = this.worker.getAuthUserGroupToScMapper().getValues(group).length;
           }
       }
       return res;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns count of connected default user groups sockets (only this worker)
     */
    getWorkerDefaultUserGroupCount() : number {
        return this.worker.getDefaultUserGroupsMap().length;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns count of auth user group sockets (only this worker)
     */
    getWorkerAuthUserGroupCount(authUserGroup : string) : number {
        return this.worker.getAuthUserGroupToScMapper().getValues(authUserGroup).length;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns object with authUserGroups as key
     * and value with array of sockets (only this worker)
     */
    getWorkerAuthUserGroupsSockets() : object {
        const res = {};
        const authGroups = this.worker.getAEPreparedPart().getAuthGroups();
        for(let group in authGroups) {
            if(authGroups.hasOwnProperty(group)) {
                res[group] = this.worker.getAuthUserGroupToScMapper().getValues(group);
            }
        }
        return res;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns array of default user group sockets (only this worker)
     */
    getWorkerDefaultUserGroupSockets() : Socket[] {
        return this.worker.getDefaultUserGroupsMap().toArray();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns array of auth user group sockets (only this worker)
     */
    getWorkerAuthUserGroupSockets(authUserGroup : string) : Socket[] {
        return this.worker.getAuthUserGroupToScMapper().getValues(authUserGroup);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Send message to all workers on compete system
     * You can react on the message with the workerMessage event in the event config.
     */
    async sendWorkerMessage(data : any) : Promise<void> {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.THIS_WORKER,WorkerChTaskActions.MESSAGE, [],[],{data : data});
    }
}

export = SmallBag;