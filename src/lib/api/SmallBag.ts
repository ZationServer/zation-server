/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Socket} from "../helper/socket/socket";

const    crypto : any   = require('crypto');
const    IP : any       = require('ip');
import ChExchangeEngine = require("../helper/channel/chExchangeEngine");
import ServiceEngine    = require("../helper/services/serviceEngine");
import ZationConfig     = require("../main/zationConfig");
import ZationWorker     = require("../main/zationWorker");
import Const            = require('../helper/constants/constWrapper');
import UUID             = require('../helper/tools/uuid');
import ExchangeEngine   = require('../helper/channel/chExchangeEngine');
import MySql            = require("mysql");
import Pg               = require('pg');
import nodeMailer       = require('nodemailer');
import {MongoClient}      from "mongodb";
import {Options}          from "nodemailer/lib/mailer";
import TaskError        = require("./TaskError");
import fetch,{Request, RequestInit, Response} from 'node-fetch';
import ChTools          = require("../helper/channel/chTools");
import {WorkerChTaskActions} from "../helper/constants/workerChTaskActions";
import IdTools          = require("../helper/tools/idTools");
import ObjectPath       = require("../helper/tools/objectPath");

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
     * Returns an generated uuid
     */
    generateUUID() : string {
        return UUID.generateUUID();
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
     * KickOut all sockets on complete system with userId from an custom id channel (server side)
     * @example
     * kickUserCustomIdCh('user20','chatGroup');
     * kickUserCustomIdCh(['tom39','lara23'],'image','2');
     * kickUserCustomIdCh(['tom39','lara23'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array
     * @param channel
     * @param id is optional, if it is not given the users will be kicked out from all ids of this channel.
     * @param exceptSocketSids
     */
    async kickUserCustomIdCh(userId : number | string | (number | string)[], channel : string, id ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        let ch = ChTools.buildCustomIdChannelName(channel,id);
        return await
            this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.KICK_OUT_USER_IDS_FROM_CH,userId,exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on complete system with userId from an custom channel (server side)
     * @example
     * kickUserCustomCh('user20','chatGroup');
     * kickUserCustomCh(['tom39','lara23'],'image');
     * kickUserCustomCh(['tom39','lara23'],'image','EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array
     * @param channel
     * @param exceptSocketSids
     */
    async kickUserCustomCh(userId : number | string | (number | string)[], channel : string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        let ch = ChTools.buildCustomChannelName(channel);
        return await
            this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.KICK_OUT_USER_IDS_FROM_CH,userId,exceptSocketSids,{ch});
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on complete system with token id from an custom id channel (server side)
     * @example
     * kickTokenCustomIdCh('TOKEN-UUID1','chatGroup');
     * kickTokenCustomIdCh(['TOKEN-UUID1,'TOKEN-UUID2'],'image','2');
     * kickTokenCustomIdCh(['TOKEN-UUID1,'TOKEN-UUID2'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param tokenId
     * @param channel
     * @param id is optional, if it is not given the sockets with tokenId will be kicked out from all ids of this channel.
     * @param exceptSocketSids
     */
    async kickTokenCustomIdCh(tokenId : string | string[], channel : string, id ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        let ch = ChTools.buildCustomIdChannelName(channel,id);
        return await
            this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.KICK_OUT_TOKEN_IDS_FROM_CH,tokenId,exceptSocketSids,{ch});
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on complete system with token id from an custom channel (server side)
     * @example
     * kickTokenCustomCh('TOKEN-UUID1','chatGroup');
     * kickTokenCustomCh(['TOKEN-UUID1,'TOKEN-UUID2'],'image','EXCEPT-SOCKET-SID');
     * @param tokenId
     * @param channel
     * @param exceptSocketSids
     */
    async kickTokenCustomCh(tokenId : string | string[], channel : string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        let ch = ChTools.buildCustomChannelName(channel);
        return await
            this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.KICK_OUT_TOKEN_IDS_FROM_CH,tokenId,exceptSocketSids,{ch});
    }

    //Part Extra Emit
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system with user id (server side)
     * @example
     * emitUser('joel2','myEvent',{myData : 'test'});
     * emitUser('joel2','myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param userIds
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitUser(userIds : (number | string)[],event : string,data : any = {},exceptSocketSids : string[] | string = []) : Promise<void>
    {
        return await
            this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.EMIT_USER_IDS,userIds,exceptSocketSids,{event,data});
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system with token id (server side)
     * @example
     * emitToken('TOKEN-UUID1','myEvent',{myData : 'test'});
     * emitToken('TOKEN-UUID2','myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param tokenIds
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitToken(tokenIds : string[],event : string,data : any = {},exceptSocketSids : string[] | string = []) : Promise<void>
    {
        return await
            this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.EMIT_TOKEN_IDS,tokenIds,exceptSocketSids,{event,data});
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
     * @param userIds
     * @param exceptSocketSids
     */
    async disconnectUser(userIds : (number | string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        return await this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.DISCONNECT_USER_IDS,userIds,exceptSocketSids);
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system with token id (server side)
     * @example
     * disconnectToken(['TOKEN-UUID1','TOKEN-UUID2']);
     * disconnectToken('TOKEN-UUID1');
     * disconnectToken('TOKEN-UUID1','EXCEPT-SOCKET-SID'');
     * @param tokenIds
     * @param exceptSocketSids
     */
    async disconnectToken(tokenIds : string[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        return await this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.DISCONNECT_TOKEN_IDS,tokenIds,exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system with user id/s (server side)
     * @example
     * deauthenticateUser(['tim902','leonie23']);
     * deauthenticateUser('tim902');
     * deauthenticateUser('tim902','EXCEPT-SOCKET-SID');
     * @param userIds
     * @param exceptSocketSids
     */
    async deauthenticateUser(userIds : (number | string)[] | number | string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        return await this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.DEAUTHENTICATE_USER_IDS,userIds,exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system with token id/s (server side)
     * @example
     * deauthenticateToken(['TOKEN-UUID1','TOKEN-UUID2']);
     * deauthenticateToken('TOKEN-UUID2');
     * deauthenticateToken('TOKEN-UUID2','EXCEPT-SOCKET-SID');
     * @param tokenIds
     * @param exceptSocketSids
     */
    async deauthenticateToken(tokenIds : string[] | string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        return await this.exchangeEngine.publishTaskToWorker(WorkerChTaskActions.DEAUTHENTICATE_TOKEN_IDS,tokenIds,exceptSocketSids);
    }

    //Part SocketId Tools
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
     * Set socket variable (server side) with object path
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
     * Has socket variable (server side) with object path
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
     * Get socket variable (server side) with object path
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
     * Delete socket variable (server side) with object path
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
     * Returns the socket with the socketId
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
     * Returns the socketIds from socket with the tokenId
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
     * Returns the socketSids from socket with the tokenId
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

    //Part Amazon s3
    // noinspection JSUnusedGlobalSymbols
    /*
    uploadFileToBucket()
    {
        //TODO

    }

    // noinspection JSUnusedGlobalSymbols
    getFileFromBucket()
    {
        //TODO

    }
    */
}

export = SmallBag;