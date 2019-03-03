/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {Socket}      from "../helper/sc/socket";
import fetch, {Request, RequestInit, Response} from 'node-fetch';
import {WorkerChTaskActions}        from "../helper/constants/workerChTaskActions";
import {WorkerChTargets}            from "../helper/constants/workerChTargets";
import {AsymmetricKeyPairs}         from "../helper/infoObjects/asymmetricKeyPairs";
import {WorkerMessageActions}       from "../helper/constants/workerMessageActions";
import {ErrorConfig, ErrorConstruct} from "../helper/configs/errorConfig";
import {ZationChannel, ZationToken} from "../helper/constants/internal";

const    crypto : any       = require('crypto');
const    IP : any           = require('ip');
const    crypto2 : any      = require("crypto2");
import ChExchangeEngine = require("../helper/channel/chExchangeEngine");
import ServiceEngine   = require("../helper/services/serviceEngine");
import ZationConfig    = require("../main/zationConfig");
import ZationWorker    = require("../main/zationWorker");
import ExchangeEngine  = require('../helper/channel/chExchangeEngine');
import TaskError       = require("./TaskError");
import ChTools         = require("../helper/channel/chTools");
import IdTools         = require("../helper/tools/idTools");
import ObjectPath      = require("../helper/tools/objectPath");
import TokenTools      = require("../helper/token/tokenTools");
import TaskErrorBag    = require("./TaskErrorBag");
import TaskErrorBuilder = require("../helper/builder/taskErrorBuilder");
import {InternMainConfig} from "../helper/configs/mainConfig";
import {AppConfig}        from "../helper/configs/appConfig";
import {ChannelConfig}    from "../helper/configs/channelConfig";
import {EventConfig}      from "../helper/configs/eventConfig";
import {ServiceConfig}    from "../helper/configs/serviceConfig";
import Base64Tools      = require("../helper/tools/base64Tools");
import {byteLength}       from "byte-length";

const uuidV4                = require('uuid/v4');
const uniqid                = require('uniqid');


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

    //PART CONFIG ACCESS
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the zation config.
     */
    getZationConfig() : ZationConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the app config.
     */
    getAppConfig() : AppConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.appConfig;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the channel config.
     */
    getChannelConfig() : ChannelConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.channelConfig;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the error config.
     */
    getErrorConfig() : ErrorConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.errorConfig;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the event config.
     */
    getEventConfig() : EventConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.eventConfig;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the main config.
     */
    getMainConfig() : InternMainConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.mainConfig;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the service config.
     */
    getServiceConfig() : ServiceConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.serviceConfig;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns an main config variable with object path.
     * Which you can define in the variables property in the main config.
     * @param path
     */
    getMainConfigVariable<V>(path ?: string | string[]) : V
    {
        return ObjectPath.get(this.zc.mainConfig.variables,path);
    }

    //PART Server
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the server ip address.
     */
    getServerIpAddress() : string {
        // noinspection TypeScriptValidateJSTypes
        return IP.address();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server port.
     */
    getServerPort() : number
    {
        return this.zc.mainConfig.port;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server instance id.
     */
    getServerInstanceId() : string
    {
        return this.worker.options.instanceId;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the app name.
     */
    getAppName() : string
    {
        return this.zc.mainConfig.appName;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in debug mode.
     */
    isDebugMode() : boolean
    {
        return this.zc.isDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in debug mode.
     */
    isDebug() : boolean
    {
        return this.zc.isDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server hostname.
     */
    getServerHostname() : string
    {
        return this.zc.mainConfig.hostname;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in secure.
     */
    getServerSecure() : boolean
    {
        return this.zc.mainConfig.secure;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server path.
     */
    getServerPath() : string
    {
        return this.zc.mainConfig.path;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in start debug mode.
     */
    isStartDebugMode() : boolean
    {
        return this.zc.isStartDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation version.
     */
    getZationVersion() : string
    {
        return this.worker.getServerVersion();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the started time stamp from this server.
     */
    getServerStartedTimeStamp() : number
    {
        return this.worker.getServerStartedTime();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the started time stamp from this worker.
     */
    getWorkerStartedTimeStamp() : number
    {
        return this.worker.getWorkerStartedTime();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the worker id.
     */
    getWorkerId() : number
    {
        return this.worker.getWorkerId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the full worker id. (includes the node process id)
     * So this id is unique for every restart from this worker.
     */
    getWorkerFullId() : string
    {
        return this.worker.getFullWorkerId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation worker instance.
     * This only for advance use cases.
     */
    getWorker() : ZationWorker
    {
        return this.worker;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this worker is the leader.
     */
    isLeaderWorker() : boolean
    {
        return this.worker.isLeader;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this server instance is the leader of the cluster.
     * Notice that this server can lose his leader ship again!
     * If cluster mode is not active (means only one server is running without state server)
     * it will returns always true.
     */
    async isLeaderServer() : Promise<boolean>
    {
        return (await this.worker.sendToZationMaster({action : WorkerMessageActions.IS_LEADER})).isLeader;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kill all workers,brokers and the master.
     * @param error
     * Error or message for server crash information.
     */
    async killServer(error : Error | string) : Promise<void>
    {
        await this.worker.killServer(error);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server url with protocol,hostname and port.
     * @example
     * https://myhost:3000
     */
    getServerUrl() : string
    {
        return `${this.zc.mainConfig.secure ? 'https' : 'http'}://${this.zc.mainConfig.hostname}:${this.zc.mainConfig.port}`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation server url with protocol,hostname,port and path.
     * @example
     * https://myhost:3000/path
     */
    getZationServerUrl() : string
    {
        return`${this.zc.mainConfig.secure ? 'https' : 'http'}://${this.zc.mainConfig.hostname}:${this.zc.mainConfig.port}${this.zc.mainConfig.path}`;
    }

    //Part Crypto

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Hash an string with sha512.
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
     * Hash an string.
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
     * Returns an random string.
     * @param length
     */
    generateRandomString(length : number = 16) : string
    {
        return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random number with fixed digits count.
     * @param digits
     */
    generateFixedRandomNumber(digits : number = 8) : number
    {
        return Math.floor(Math.pow(10, digits-1) + Math.random() * 9 * Math.pow(10, digits-1));
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random number in a range.
     * @param min
     * @param max
     */
    generateRangeRandomNumber(min : number = 0, max : number = 10) : number
    {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random boolean.
     * @param chanceForTrue
     */
    generateRandomBoolean(chanceForTrue : number = 0.5) : boolean
    {
        return Math.random() <= chanceForTrue;
    }

    //Asymmetric Encryption
    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an object with private an public key for Asymmetric Encryption.
     * @example
     * const { privateKey, publicKey } = await getAsyncKeyPair();
     *
     */
    async getAsymmetricKeyPair() : Promise<AsymmetricKeyPairs>
    {
        return await crypto2.createKeyPair();
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Encrypts a message with the publicKey and returns the encrypted message.
     * @example
     * const encryptedMessage = await asymmetricEncrypt('MY-MESSAGE','PUBLIC-KEY');
     * @param message
     * @param publicKey
     */
    async asymmetricEncrypt(message : string, publicKey : string) : Promise<string>
    {
        return await crypto2.encrypt.rsa(message,publicKey);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Decrypts the message with the privateKey and returns the decrypted message.
     * @example
     * const decryptedMessage = await asymmetricDecrypt('ENCRYPTED-MESSAGE','PRIVATE-KEY');
     * @param encryptedMessage
     * @param privateKey
     */
    async asymmetricDecrypt(encryptedMessage : string, privateKey : string) : Promise<string>
    {
        return await crypto2.decrypt.rsa(encryptedMessage,privateKey);
    }

    //Symmetric Encryption
    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Generates an password that you can use for Symmetric Encryption.
     * @example
     * const password = await generatePassword();
     * @param secret
     */
    async generatePassword(secret : String = this.generateRandomString()) : Promise<string>
    {
        return await crypto2.createPassword(secret);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Generates an initialization vector that you can use for Symmetric Encryption.
     * @example
     * const password = await generateIv();
     */
    async generateIv() : Promise<string>
    {
        return await crypto2.createIv();
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Encrypts a message with a password and initialization vector than returns the encrypted message.
     * @example
     * const encryptedMessage = await symmetricEncrypt('secret information',password,iv);
     * @param message
     * @param password
     * @param iv
     */
    async symmetricEncrypt(message : string,password : string,iv : string) : Promise<string>
    {
        return await crypto2.encrypt.aes256cbc(message,password,iv);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Decrypts a message with a password and initialization vector than returns the decrypted message.
     * @example
     * const password = await symmetricDecrypt(encryptedMessage,password,iv);
     * @param encryptedMessage
     * @param password
     * @param iv
     */
    async symmetricDecrypt(encryptedMessage : string,password : string,iv : string) : Promise<string>
    {
        return await crypto2.decrypt.aes256cbc(encryptedMessage, password, iv);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Creates an signature from an message with a privateKey and returns the signature.
     * @example
     * const signature = await asymmetricSign(message,privateKey);
     * @param message
     * @param privateKey
     */
    async asymmetricSign(message : string,privateKey : string) : Promise<string>
    {
        // noinspection TypeScriptValidateJSTypes
        return await crypto2.sign(message, privateKey);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Verify the signature with the publicKey and message and returns if the signature is valid.
     * @example
     * const signature = await asymmetricVerify(message,publicKey,signature);
     * @param message
     * @param publicKey
     * @param signature
     */
    async asymmetricVerify(message : string,publicKey : string,signature : string) : Promise<boolean>
    {
        // noinspection TypeScriptValidateJSTypes
        return await crypto2.verify(message,publicKey,signature);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
      * @description
      * Returns an generated uuid v4.
      */
    generateUUIDv4() : string {
        return uuidV4();
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an generated unique id.
     * By using npm package 'uniqid'.
     */
    generateUniqueId() : string {
        return uniqid();
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish to an user channel or channels.
     * @example
     * publishToUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * publishToUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array.
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
     * Publish to an user channel or channels.
     * @example
     * pubUser('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * pubUser(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array.
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
     * Publish to all channel.
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
     * Publish to all channel.
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
     * Publish to auth user group or groups.
     * @example
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
     * Publish to auth user group or groups.
     * @example
     * pubAuthUserGroup('admin','userRegistered',{userId : '1'});
     * pubAuthUserGroup(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups.
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
     * Publish to default user group.
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
     * Publish to default user group.
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
     * Publish in all auth user groups.
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
     * Publish in all auth user groups.
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
     * Publish in an custom id Channel.
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
     * Publish in an custom id Channel.
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
     * Publish in an custom channel.
     * @example
     * publishToCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * publishToCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels.
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
     * Publish in an custom channel or channels.
     * @example
     * pubCustomChannel('messageChannel','message',{message : 'hello',fromUserId : '1'});
     * pubCustomChannel(['messageChannel','otherChannel'],'message',{message : 'hello',fromUserId : '1'});
     * @param channel or an array of channels.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubCustomChannel(channel : string | string[], eventName : string, data : object = {},srcSocketSid ?: string) : Promise<void>
    {
        return await this.publishToCustomChannel(channel,eventName,data,srcSocketSid);
    }

    //Part Custom Services

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns this service, if it exist otherwise it will throw an ServiceNotFoundError error.
     * @throws ServiceNotFoundError
     * @param  name
     * the name of the service.
     * @param  serviceKey
     * the key to the service.
     */
    async getService<S>(name : string,serviceKey : string = 'default') : Promise<S>
    {
        return await this.serviceEngine.getService<S>(name,serviceKey);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the service with this key is exist and can be used.
     * @param name
     * the name of the service.
     * @param  serviceKey
     * the key to the service.
     */
    isService(name : string,serviceKey : string = 'default') : boolean
    {
        return this.serviceEngine.isService(name,serviceKey);
    }

    //Part Errors

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns a taskError builder.
     * For easy create an task error.
     */
    buildTaskError() : TaskErrorBuilder {
        return new TaskErrorBuilder();
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns a new taskError by using the constructor.
     * @param errorConstruct
     * Create a new error construct
     * or get one from the errorConfig by using the method getErrorConstruct on the bag/smallBag.
     * @param info
     * The error info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    newTaskError(errorConstruct : ErrorConstruct = {}, info ?: object | string) : TaskError
    {
        return new TaskError(errorConstruct,info);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns a new taskErrorBag by using the constructor.
     * With the bag you can collect task errors
     * and throw them later all together.
     * Then all errors are sent to the client.
     * @example
     * buildTaskErrorBag(myError,myError2).throw();
     * @param taskError
     */
    newTaskErrorBag(...taskError : TaskError[]) : TaskErrorBag
    {
        return new TaskErrorBag(...taskError);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns taskError construct from the error config file.
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
     * Returns taskError with info that is build from the error construct from error config file.
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
     * Throws an taskError with info that is build from the error construct from error config file.
     * @throws ErrorNotFoundError
     * @param errorName
     * @param info
     */
    throwTaskError(errorName : string,info : object = {}) : void
    {
        const errorOp = this.zc.getError(name);
        throw new TaskError(errorOp,info);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throws an new taskError with info that is build with the taskError constructor.
     * @throws ErrorNotFoundError
     * @param errorConstruct
     * @param info
     */
    throwNewTaskError(errorConstruct : ErrorConstruct = {}, info ?: object | string) : void
    {
        throw this.newTaskError(errorConstruct,info);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Checks if the error construct with this name is exist and can be used.
     * @param name
     */
    isErrorConstruct(name : string) : boolean
    {
        return this.zc.isError(name);
    }

    //Part Http
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    /**
     * @description
     * Fetch method witch can be use to make an http request.
     * Look in npm package 'node-fetch'.
     * @param url
     * @param init
     */
    async fetch(url: string | Request, init?: RequestInit): Promise<Response>
    {
        return await fetch(url,init);
    }

    //Part Channel KickOut

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with userId from an custom id channel (server side).
     * @example
     * kickUserCustomIdCh('user20','chatGroup');
     * kickUserCustomIdCh(['tom39','lara23'],'image','2');
     * kickUserCustomIdCh(['tom39','lara23'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array.
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
     * KickOut all sockets on the complete system with userId from an custom channel (server side).
     * @example
     * kickUserCustomCh('user20','chatGroup');
     * kickUserCustomCh(['tom39','lara23'],'image');
     * kickUserCustomCh(['tom39','lara23'],'image','EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array.
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
     * KickOut all sockets on the complete system with userId from all channel (server side).
     * @example
     * kickUserAllCh('user20');
     * kickUserAllCh(['tom39','lara23']);
     * kickUserAllCh(['tom39','lara23'],'EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array.
     * @param exceptSocketSids
     */
    async kickUserAllCh(userId : number | string | (number | string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS,WorkerChTaskActions.KICK_OUT,userId,exceptSocketSids,{ch : ZationChannel.ALL});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with userId from auth user group channel (server side).
     * @example
     * kickUserAuthUserGroupCh('user20','user');
     * kickUserAuthUserGroupCh(['tom39','lara23'],'user');
     * kickUserAuthUserGroupCh(['tom39','lara23'],'user','EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array.
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
     * KickOut all sockets on the complete system with userId from default user group channel (server side).
     * @example
     * kickUserDefaultUserGroupCh('user20');
     * kickUserDefaultUserGroupCh(['tom39','lara23']);
     * kickUserDefaultUserGroupCh(['tom39','lara23'],'EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array.
     * @param exceptSocketSids
     */
    async kickUserDefaultUserGroupCh(userId : number | string | (number | string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.USER_IDS,WorkerChTaskActions.KICK_OUT,userId,exceptSocketSids,{ch : ZationChannel.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from an custom id channel (server side).
     * @example
     * kickTokenCustomIdCh('TOKEN-UUID1','chatGroup');
     * kickTokenCustomIdCh(['TOKEN-UUID1','TOKEN-UUID2'],'image','2');
     * kickTokenCustomIdCh(['TOKEN-UUID1','TOKEN-UUID2'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param channel is optional, if it is not given the sockets with tokenId will be kicked out from all custom id channels.
     * @param id is optional, if it is not given the sockets with tokenId will be kicked out from all ids of this channel.
     * @param exceptSocketSids
     */
    async kickTokensCustomIdCh(tokenId : string | string[], channel ?: string, id ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomIdChannelName(channel,id);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from an custom channel (server side).
     * @example
     * kickTokenCustomCh('TOKEN-UUID1','chatGroup');
     * kickTokenCustomCh(['TOKEN-UUID1','TOKEN-UUID2'],'image','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param channel is optional, if it is not given the sockets with tokenId will be kicked out from all custom channels.
     * @param exceptSocketSids
     */
    async kickTokensCustomCh(tokenId : string | string[], channel ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomChannelName(channel);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from all channel (server side).
     * @example
     * kickTokenAllCh('TOKEN-UUID1');
     * kickTokenCustomCh(['TOKEN-UUID1','TOKEN-UUID2'],'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param exceptSocketSids
     */
    async kickTokensAllCh(tokenId : string | string[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch : ZationChannel.ALL});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from auth user group channel (server side).
     * @example
     * kickTokenAuthUserGroupCh('TOKEN-UUID1','user');
     * kickTokenAuthUserGroupCh(['TOKEN-UUID1','TOKEN-UUID2'],'user','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param authUserGroup is optional, if it is not given the socket with token id will be kicked out from all auth user group channels.
     * @param exceptSocketSids
     */
    async kickTokensAuthUserGroupCh(tokenId : string | string[],authUserGroup ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch : ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from default user group channel (server side).
     * @example
     * kickTokenDefaultUserGroupCh('TOKEN-UUID1');
     * kickTokenDefaultUserGroupCh(['TOKEN-UUID1','TOKEN-UUID2'],'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param exceptSocketSids
     */
    async kickTokensDefaultUserGroupCh(tokenId : string | string[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.KICK_OUT,tokenId,exceptSocketSids,{ch : ZationChannel.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from an custom id channel.
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
     * Kick out all sockets on the complete system from an custom channel.
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
     * Kick out all sockets on the complete system from all channel.
     * @example
     * kickOutAllSocketsAllCh();
     * @param exceptSocketSids
     */
    async kickAllSocketsAllCh(exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch : ZationChannel.ALL});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from auth user group channel.
     * @example
     * kickOutAllSocketsAuthUserGroupCh();
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
     * Kick out all sockets on the complete system from default user group channel.
     * @example
     * kickOutAllSocketsDefaultUserGroupCh();
     * @param exceptSocketSids
     */
    async kickAllSocketsDefaultUserGroupCh(exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.ALL_SOCKETS,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch : ZationChannel.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with sid from an custom id channel (server side).
     * @example
     * kickSocketsCustomIdCh('SOCKET-SID','chatGroup');
     * kickSocketsCustomIdCh(['SOCKET-SID-1','SOCKET-SID-2'],'image','2');
     * @param socketSid or more socketSids in an array.
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
     * KickOut all sockets on the complete system with sid from an custom channel (server side).
     * @example
     * kickSocketsCustomCh('SOCKET-SID','chatGroup');
     * kickSocketsCustomCh(['SOCKET-SID-1','SOCKET-SID-2'],'image');
     * @param socketSid or more socketSids in an array.
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
     * KickOut all sockets on the complete system with sid from all channel (server side).
     * @example
     * kickSocketsAllCh('SOCKET-SID');
     * kickSocketsAllCh(['SOCKET-SID-1','SOCKET-SID-2']);
     * @param socketSid or more socketSids in an array.
     */
    async kickSocketsAllCh(socketSid : string | string[]) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.KICK_OUT,socketSid,[],{ch : ZationChannel.ALL});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with sid from auth user group channel (server side).
     * @example
     * kickSocketsAuthUserGroupCh('SOCKET-SID','user');
     * kickSocketsAuthUserGroupCh(['SOCKET-SID-1','SOCKET-SID-2'],'user');
     * @param socketSid or more socketSids in an array.
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
     * KickOut all sockets on the complete system with sid from default user group channel (server side).
     * @example
     * kickSocketsDefaultUserGroupCh('SOCKET-SID');
     * kickSocketsDefaultUserGroupCh(['SOCKET-SID-1','SOCKET-SID-2']);
     * @param socketSid or more socketSids in an array.
     */
    async kickSocketsDefaultUserGroupCh(socketSid : string | string[]) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.KICK_OUT,socketSid,[],{ch : ZationChannel.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system which belongs to the auth user groups from an custom id channel (server side).
     * @example
     * kickAuthUserGroupsCustomIdCh('user','chatGroup');
     * kickAuthUserGroupsCustomIdCh(['user','admin'],'image','2');
     * kickAuthUserGroupsCustomIdCh(['user','admin'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param channel is optional, if it is not given the sockets will be kicked out from all custom id channels.
     * @param id is optional, if it is not given the sockets will be kicked out from all ids of this channel.
     * @param exceptSocketSids
     */
    async kickAuthUserGroupsCustomIdCh(authUserGroup : string | null | (string)[],channel ?: string, id ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomIdChannelName(channel,id);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS,WorkerChTaskActions.KICK_OUT,
            authUserGroup || [],exceptSocketSids,{ch,all : authUserGroup === null});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system which belongs to the auth user groups from an custom channel (server side).
     * @example
     * kickAuthUserGroupsCustomCh('user','chatGroup');
     * kickAuthUserGroupsCustomCh(['user','admin'],'image','EXCEPT-SOCKET-SID');
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param channel is optional, if it is not given the sockets will be kicked out from all custom channels.
     * @param exceptSocketSids
     */
    async kickAuthUserGroupsCustomCh(authUserGroup : string | null | (string)[],channel ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomChannelName(channel);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS,WorkerChTaskActions.KICK_OUT,
            authUserGroup || [],exceptSocketSids,{ch,all : authUserGroup === null});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system which belongs to the auth user groups from all channel (server side).
     * @example
     * kickAuthUserGroupsAllCh('user');
     * kickAuthUserGroupsAllCh(['user','admin'],'EXCEPT-SOCKET-SID');
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param exceptSocketSids
     */
    async kickAuthUserGroupsAllCh(authUserGroup : string | null | (string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS,WorkerChTaskActions.KICK_OUT,
            authUserGroup || [],exceptSocketSids,{ch : ZationChannel.ALL,all : authUserGroup === null});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system which belongs to the default user group from an custom id channel (server side).
     * @example
     * kickDefaultUserGroupCustomIdCh();
     * kickDefaultUserGroupCustomIdCh('image','2');
     * kickDefaultUserGroupCustomIdCh('image',undefined,'EXCEPT-SOCKET-SID');
     * @param channel is optional, if it is not given the sockets will be kicked out from all custom id channels.
     * @param id is optional, if it is not given the sockets will be kicked out from all ids of this channel.
     * @param exceptSocketSids
     */
    async kickDefaultUserGroupCustomIdCh(channel ?: string, id ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomIdChannelName(channel,id);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system which belongs to the default user group from an custom channel (server side).
     * @example
     * kickDefaultUserGroupCustomCh();
     * kickDefaultUserGroupCustomCh('image');
     * kickDefaultUserGroupCustomCh('image','EXCEPT-SOCKET-SID');
     * @param channel is optional, if it is not given the sockets will be kicked out from all custom id channels.
     * @param exceptSocketSids
     */
    async kickDefaultUserGroupCustomCh(channel ?: string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        const ch = ChTools.buildCustomChannelName(channel);
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system which belongs to the default user group from all channel (server side).
     * @example
     * kickDefaultUserGroupAllCh();
     * kickDefaultUserGroupAllCh('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async kickDefaultUserGroupAllCh(exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP,WorkerChTaskActions.KICK_OUT,[],exceptSocketSids,{ch : ZationChannel.ALL});
    }

    //Part Extra Emit
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system with user id (server side).
     * @example
     * emitUser('joel2','myEvent',{myData : 'test'});
     * emitUser('joel2','myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array.
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
     * Emit to all sockets on complete system with token id (server side).
     * @example
     * emitToken('TOKEN-UUID1','myEvent',{myData : 'test'});
     * emitToken('TOKEN-UUID2','myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitTokens(tokenId : string | string[],event : string,data : any = {},exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.EMIT,tokenId,exceptSocketSids,{event,data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system (server side).
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
     * Emit to all sockets with sid on complete system (server side).
     * @example
     * emitSockets('SOCKET-SID','myEvent',{myData : 'test'});
     * emitSockets(['SOCKET-SID-1','SOCKET-SID-2'],'myEvent',{myData : 'test'});
     * @param socketSid or more socketSids in an array.
     * @param event
     * @param data
     */
    async emitSockets(socketSid : string | string[],event : string,data : any = {}) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.EMIT,socketSid,[],{event,data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to specific auth user groups on complete system (server side).
     * @example
     * emitAuthUserGroups('admin','myEvent',{myData : 'test'});
     * emitAuthUserGroups(['user','admin'],'myEvent',{myData : 'test'});
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitAuthUserGroups(authUserGroup : string | null | (string)[],event : string,data : any = {},exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS,WorkerChTaskActions.EMIT,authUserGroup || [],exceptSocketSids,{event,data,all : authUserGroup === null});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to default user group on complete system (server side).
     * @example
     * emitDefaultUserGroup('myEvent',{myData : 'test'});
     * emitDefaultUserGroup('myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitDefaultUserGroup(event : string,data : any = {},exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP,WorkerChTaskActions.EMIT,[],exceptSocketSids,{event,data});
    }

    //Part Security

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system with user id (server side).
     * @example
     * disconnectUser(['tim902','leonie23']);
     * disconnectUser('tim902');
     * disconnectUser('tim902','EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array.
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
     * Disconnect all sockets on complete system with token id (server side).
     * @example
     * disconnectToken(['TOKEN-UUID1','TOKEN-UUID2']);
     * disconnectToken('TOKEN-UUID1');
     * disconnectToken('TOKEN-UUID1','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param exceptSocketSids
     */
    async disconnectTokens(tokenId : string | string[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.DISCONNECT,tokenId,exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system (server side).
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
     * Disconnect all sockets on complete system with sid (server side).
     * @example
     * disconnectSockets(['SOCKET-SID-1','SOCKET-SID-2']);
     * disconnectSockets('SOCKET-SID');
     * @param socketSid or more socketSids in an array.
     */
    async disconnectSockets(socketSid : string | string[]) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.DISCONNECT,socketSid,[]);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system which belongs to the auth user groups (server side).
     * @example
     * disconnectAuthUserGroups('admin');
     * disconnectAuthUserGroups(['user','admin'],'EXCEPT-SOCKET-SID');
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param exceptSocketSids
     */
    async disconnectAuthUserGroups(authUserGroup : string | null | (string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS,WorkerChTaskActions.DISCONNECT,authUserGroup || [],exceptSocketSids,{all : authUserGroup === null});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets which belongs to default user group on complete system (server side).
     * @example
     * disconnectDefaultUserGroup();
     * disconnectDefaultUserGroup('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async disconnectDefaultUserGroup(exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP,WorkerChTaskActions.DISCONNECT,[],exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system with user id/s (server side).
     * @example
     * deauthenticateUser(['tim902','leonie23']);
     * deauthenticateUser('tim902');
     * deauthenticateUser('tim902','EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array.
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
     * Deauthenticate all sockets on complete system with token id/s (server side).
     * @example
     * deauthenticateToken(['TOKEN-UUID1','TOKEN-UUID2']);
     * deauthenticateToken('TOKEN-UUID2');
     * deauthenticateToken('TOKEN-UUID2','EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param exceptSocketSids
     */
    async deauthenticateTokens(tokenId : string | string[] | string,exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.TOKEN_IDS,WorkerChTaskActions.DEAUTHENTICATE,tokenId,exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system (server side).
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
     * Deauthenticate all sockets on complete system with sid (server side).
     * @example
     * deauthenticateSockets(['SOCKET-SID-1','SOCKET-SID-2']);
     * deauthenticateSockets('SOCKET-SID');
     * @param socketSid or more socketSids in an array.
     */
    async deauthenticateSockets(socketSid : string | string[] | string) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS,WorkerChTaskActions.DEAUTHENTICATE,socketSid,[]);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system which belongs to the auth user groups (server side).
     * @example
     * deauthenticateAuthUserGroups('admin');
     * deauthenticateAuthUserGroups(['user','admin'],'EXCEPT-SOCKET-SID');
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param exceptSocketSids
     */
    async deauthenticateAuthUserGroups(authUserGroup : string | null | (string)[],exceptSocketSids : string[] | string = []) : Promise<void>
    {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS,WorkerChTaskActions.DEAUTHENTICATE,authUserGroup || [],exceptSocketSids,{all : authUserGroup === null});
    }

    //Part Socket Tools

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns user id from socket (if authenticated and has one).
     * @example
     * getUserIdFromSocket(sc);
     * @param socket
     */
    getUserIdFromSocket(socket : Socket) : string | number | undefined {
        return TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.zationUserId),socket);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns user group from socket (if authenticated).
     * @example
     * getUserIdFromSocket(sc);
     * @param socket
     */
    getAuthUserGroupFromSocket(socket : Socket) : string | undefined {
        return TokenTools.getSocketTokenVariable(nameof<ZationToken>(s => s.zationAuthUserGroup),socket);
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
     * Set socket variable (server side) with object path.
     * @example
     * setSocketVariable('email','example@gmail.com');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     */
    setSocketVariableWithSocket(socket : Socket,path : string | string[],value : any) : void
    {
        ObjectPath.set(socket.zationSocketVariables,path,value);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Has socket variable (server side) with object path.
     * @example
     * hasSocketVariable('email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    hasSocketVariableWithSocket(socket : Socket,path ?: string | string[]) : boolean
    {
        return ObjectPath.has(socket.zationSocketVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Get socket variable (server side) with object path.
     * @example
     * getSocketVariable('email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    getSocketVariableWithSocket<R>(socket : Socket,path ?: string | string[]) : R
    {
        return ObjectPath.get(socket.zationSocketVariables,path);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Delete socket variable (server side) with object path.
     * @example
     * deleteSocketVariable('email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    deleteSocketVariableWithSocket(socket : Socket,path ?: string | string[]) : void
    {
        if(!!path) {
            ObjectPath.del(socket.zationSocketVariables,path);
        }
        else {
            socket.zationSocketVariables = {};
        }
    }

    //Worker storage
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a worker variable (server side) with object path.
     * @example
     * setWorkerVariable('email','example@gmail.com');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     */
    setWorkerVariable(path : string | string[],value : any) : void {
        ObjectPath.set(this.worker.getWorkerVariableStorage(),path,value);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Has a worker variable (server side) with object path.
     * @example
     * hasWorkerVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    hasWorkerVariable(path ?: string | string[]) : boolean {
        return ObjectPath.has(this.worker.getWorkerVariableStorage(),path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Get worker variable (server side) with object path.
     * @example
     * getWorkerVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    getWorkerVariable<R>(path ?: string | string[]) : R {
        return ObjectPath.get(this.worker.getWorkerVariableStorage(),path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a worker variable (server side) with object path.
     * @example
     * deleteWorkerVariable('email');
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    deleteWorkerVariable(path ?: string | string[]) : void {
        if(!!path) {
            ObjectPath.del(this.worker.getWorkerVariableStorage(),path);
        }
        else {
            this.worker.setWorkerVariableStorage({});
        }
    }

    //Part Base64Tools

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    /**
     * @description
     * Calculate the byte size from an encoded base64 string.
     * @example
     * base64ByteSize("ENCODED-BASE64");
     * @param encodedBase64
     * The encoded base64 string.
     */
    base64ByteSize(encodedBase64 : string) : number {
        return Base64Tools.getByteSize(encodedBase64);
    }

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the mimeType and mimeSubType of an encoded base64 string.
     * @example
     * base64ContentInfo("ENCODED-BASE64");
     * @param encodedBase64
     * The encoded base64 string.
     * @return
     * Can be null if the base64 string has no content type.
     * Otherwise, it is an object with the properties: mimeSubType, mimeType.
     */
    base64ContentInfo(encodedBase64 : string) : null | {mimeSubType : string, mimeType : string} {
        return Base64Tools.getContentInfo(encodedBase64);
    }

    // ByteTools

    // noinspection JSMethodCanBeStatic, JSUnusedGlobalSymbols
    /**
     * @description
     * Calculate the byte size from an utf-8 string.
     * By using the npm package byte-length.
     * @example
     * stringByteSize("UTF-8_STRING");
     * @param string
     * The utf-8 string.
     */
    stringByteSize(string : string) : number {
        return byteLength(string);
    }

    //Part Worker

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socket with the socketId.
     * You have only access to sockets they are connected to this worker.
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
     * Returns the clients of the worker.
     * Key are socketIds and value are sockets.
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
     * Returns the number of connected clients to this worker.
     * @example
     * getWorkerConnectedClientsCount();
     */
    getWorkerConnectedClientsCount() : number {
        return this.worker.getStatus().clientCount;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns http requests per minute.
     */
    getWorkerHttpRequestPerMinute() : number {
        return this.worker.getStatus().httpRPM;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns web sockets requests per minute.
     */
    getWorkerWsRequestPerMinute() : number {
        return this.worker.getStatus().wsRPM;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns all sockets from this worker that subscribes the custom channel.
     * @example
     * getWorkerSocketSubsCustomCh('CH-NAME');
     */
    getWorkerSocketSubsCustomCh(channel : string) : Socket[] {
        return this.worker.getCustomChToScMapper().getValues(channel);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns all sockets from this worker that subscribes the custom id channel.
     * @example
     * getWorkerSocketSubsCustomIdCh('CH-NAME','ID');
     */
    getWorkerSocketSubsCustomIdCh(channel : string, id : string) : Socket[] {
        return this.worker.getCustomIdChToScMapper().getValues(`${channel}.${id}`);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the socketSids from socketId.
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
     * Returns the sockets with the tokenId.
     * You have only have access to sockets they are connected to this worker.
     * @example
     * getSocketIdsWithTokenId('TOKEN-ID');
     * @param tokenId
     */
    getSocketsWithTokenId(tokenId : string) : Socket[]
    {
        return this.worker.getTokenIdToScMapper().getValues(tokenId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the sockets with the userId.
     * You have only have access to sockets they are connected to this worker.
     * @example
     * getSocketIdsWithUserId('tom1554');
     * @param userId
     */
    getSocketsWithUserId(userId : string) : Socket[]
    {
        return this.worker.getUserToScMapper().getValues(userId);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns object with authUserGroups as key and value with count of connected clients (only this worker).
     */
    getWorkerAuthUserGroupsCount() : object {
       const res = {};
       const authGroups = this.worker.getAEPreparedPart().getAuthGroups();
       for(let group in authGroups) {
           if(authGroups.hasOwnProperty(group)) {
               res[group] = this.worker.getAuthUserGroupToScMapper().getLengthFromKey(group);
           }
       }
       return res;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns count of connected default user groups sockets (only this worker).
     */
    getWorkerDefaultUserGroupCount() : number {
        return this.worker.getDefaultUserGroupSet().getLength();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns count of connected only panel sockets (only this worker).
     */
    getWorkerOnlyPanelSocketsCount() : number {
        return this.worker.getDefaultUserGroupSet().getLength();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns count of auth user group sockets (only this worker).
     */
    getWorkerAuthUserGroupCount(authUserGroup : string) : number {
        return this.worker.getAuthUserGroupToScMapper().getLengthFromKey(authUserGroup);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns object with authUserGroups as key and value with array of sockets (only this worker).
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
     * Returns array of default user group sockets (only this worker).
     */
    getWorkerDefaultUserGroupSockets() : Socket[] {
        return this.worker.getDefaultUserGroupSet().toArray();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns array of only panel sockets (only this worker).
     */
    getWorkerOnlyPanelSockets() : Socket[] {
        return this.worker.getPanelUserSet().toArray();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns array of auth user group sockets (only this worker).
     */
    getWorkerAuthUserGroupSockets(authUserGroup : string) : Socket[] {
        return this.worker.getAuthUserGroupToScMapper().getValues(authUserGroup);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Send message to all workers on compete system.
     * You can react on the message with the workerMessage event in the event config.
     */
    async sendWorkerMessage(data : any) : Promise<void> {
        await this.exchangeEngine.publishTaskToWorker
        (WorkerChTargets.THIS_WORKER,WorkerChTaskActions.MESSAGE, [],[],{data : data});
    }
}

export = SmallBag;