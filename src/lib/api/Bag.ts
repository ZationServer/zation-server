/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import UpSocket                                             from "../main/sc/socket";
import fetch, {Request, RequestInit, Response}              from 'node-fetch';
import {WorkerChMapTaskActions, WorkerChSpecialTaskActions} from "../main/constants/workerChTaskActions";
import {WorkerChTargets}                                    from "../main/constants/workerChTargets";
import AsymmetricKeyPairs                                   from "../main/internalApi/asymmetricKeyPairs";
import {WorkerMessageActions}                               from "../main/constants/workerMessageActions";
import BackErrorConstruct                                   from "../main/constants/backErrorConstruct";
import {ZationCustomEventNamespace, ZationToken}            from "../main/constants/internal";
import {InternalMainConfig}                                 from "../main/config/definitions/mainConfig";
import {AppConfig}                                          from "../main/config/definitions/appConfig";
import {EventConfig}                                        from "../main/config/definitions/eventConfig";
import {ServiceConfig}                                      from "../main/config/definitions/serviceConfig";
import {byteLength}                                         from "byte-length";

const crypto : any                                          = require('crypto');
const IP : any                                              = require('ip');
const crypto2 : any                                         = require("crypto2");
const uuidV4                                                = require('uuid/v4');
const uniqid                                                = require('uniqid');
import ZationWorker                                         = require("../core/zationWorker");
import {SyncTokenActions}                                   from "../main/constants/syncTokenActions";
import {StartMode}                                          from "../..";
import BackErrorBuilder                                     from "../main/builder/backErrorBuilder";
import BackError                                            from "./BackError";
import BackErrorBag                                         from "./BackErrorBag";
import ChannelBagEngine                                     from "../main/channel/channelBagEngine";
import ServiceEngine                                        from "../main/services/serviceEngine";
import ZationConfig                                         from "../main/config/manager/zationConfig";
import ObjectPath                                           from "../main/utils/objectPath";
import Result                                               from "./Result";
import Logger                                               from "../main/logger/logger";
import ChUtils                                              from "../main/channel/chUtils";
import SidBuilder                                           from "../main/utils/sidBuilder";
import TokenUtils                                           from "../main/token/tokenUtils";
import ObjectPathSequenceImp                                from "../main/internalApi/objectPathSequence/objectPathSequenceImp";
import ObjectPathActionSequenceImp                          from "../main/internalApi/objectPathSequence/objectPathActionSequenceImp";
import Base64Utils                                          from "../main/utils/base64Utils";
import ZationConfigFull                                     from "../main/config/manager/zationConfigFull";
import CloneUtils                                           from "../main/utils/cloneUtils";
import {JwtSignOptions,JwtVerifyOptions}                    from "../main/constants/jwt";
import ApiLevelUtils, {ApiLevelSwitch, ApiLevelSwitchFunction} from "../main/apiLevel/apiLevelUtils";
import {ZationChannel}                                         from "../main/channel/channelDefinitions";
import {DataBoxFamilyClass}                                    from "./dataBox/DataBoxFamily";
import DataBoxFamilyContainer                                  from "../main/dataBox/container/dataBoxFamilyContainer";
import DataBoxContainer                                        from "../main/dataBox/container/dataBoxContainer";
import {DataBoxClass}                                          from "./dataBox/DataBox";
import DataBoxUtils                                            from "../main/dataBox/dataBoxUtils";
import ScServer                                                from "../main/sc/scServer";
// noinspection TypeScriptPreferShortImport
import {ObjectPathSequence}                                    from "../main/internalApi/objectPathSequence/objectPathSequence";

export default class Bag {
    protected readonly exchangeEngine: ChannelBagEngine;
    protected readonly serviceEngine: ServiceEngine;
    protected readonly zc: ZationConfigFull;
    protected readonly worker: ZationWorker;

    constructor(worker: ZationWorker, exchangeEngine: ChannelBagEngine) {
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
    getZationConfig(): ZationConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the root path of the project.
     * In a typescript project, it will return the path to the dist folder.
     */
    getRootPath(): string {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.rootPath;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns if the server runs in test mode.
     */
    inTestMode(): boolean {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.inTestMode();
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns if the server runs in normal mode.
     */
    inNormalMode(): boolean {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.inNormalMode();
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the start mode of the server.
     */
    getStartMode(): StartMode {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.getStartMode();
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the app config.
     */
    getAppConfig(): AppConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.appConfig;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the event config.
     */
    getEventConfig(): EventConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.eventConfig;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the main config.
     */
    getMainConfig(): InternalMainConfig {
        // noinspection TypeScriptValidateJSTypes
        return this.zc.mainConfig;
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the service config.
     */
    getServiceConfig(): ServiceConfig {
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
    getMainConfigVariable<V = any>(path ?: string | string[]): V {
        return ObjectPath.get(this.zc.mainConfig.variables, path);
    }

    //Part Auth

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the name of the default user group.
     */
    getDefaultUserGroupName(): string {
        // noinspection TypeScriptValidateJSTypes
        return this.worker.getAEPreparedPart().getDefaultGroup();
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Checks if it is an auth user group name.
     */
    isAuthUserGroupName(name: string): boolean {
        // noinspection TypeScriptValidateJSTypes
        return this.worker.getAEPreparedPart().isAuthGroup(name);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns an array with all auth user group names.
     */
    getAuthUserGroupNames(): string[] {
        // noinspection TypeScriptValidateJSTypes
        return Object.keys(this.worker.getAEPreparedPart().getAuthGroups());
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns true if the server is using the token state check.
     */
    isUseTokenStateCheck() : boolean {
        return this.worker.getAEPreparedPart().isUseTokenStateCheck();
    }

    //PART Server
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the server ip address.
     */
    getServerIpAddress(): string {
        // noinspection TypeScriptValidateJSTypes
        return IP.address();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server port.
     */
    getServerPort(): number {
        return this.zc.mainConfig.port;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server instance id.
     */
    getServerInstanceId(): string {
        return this.worker.options.instanceId;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the app name.
     */
    getAppName(): string {
        return this.zc.mainConfig.appName;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in debug mode.
     */
    isDebugMode(): boolean {
        return this.zc.isDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in debug mode.
     */
    isDebug(): boolean {
        return this.zc.isDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server hostname.
     */
    getServerHostname(): string {
        return this.zc.mainConfig.hostname;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in secure.
     */
    getServerSecure(): boolean {
        return this.zc.mainConfig.secure;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server path.
     */
    getServerPath(): string {
        return this.zc.mainConfig.path;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if the server is running in start debug mode.
     */
    isStartDebugMode(): boolean {
        return this.zc.isStartDebug();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation server version.
     */
    getZationVersion(): string {
        return this.worker.getServerVersion();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the started time stamp of this server.
     */
    getServerStartedTimeStamp(): number {
        return this.worker.getServerStartedTime();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the started time stamp of this worker.
     */
    getWorkerStartedTimeStamp(): number {
        return this.worker.getWorkerStartedTime();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the worker id.
     */
    getWorkerId(): number {
        return this.worker.getWorkerId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the full worker id. (includes the node process id)
     * Means that this id is unique for every worker process,
     * also for every worker restart.
     */
    getWorkerFullId(): string {
        return this.worker.getFullWorkerId();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation worker instance.
     * This only for advance use cases.
     */
    getWorker(): ZationWorker {
        return this.worker;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this worker is the leader.
     */
    isLeaderWorker(): boolean {
        return this.worker.isLeader;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this worker process is a respawn process.
     */
    isRespawn(): boolean {
        return this.worker.isRespawn();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns if this server instance is the leader of the cluster.
     * Notice that this server can lose his leader ship again!
     * If cluster mode is not active (means only one server is running without state server)
     * it will return always true.
     */
    async isLeaderServer(): Promise<boolean> {
        return (await this.worker.sendToZationMaster({action: WorkerMessageActions.IS_LEADER})).isLeader;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kill all workers,brokers and the master.
     * @param error
     * Error or message for server crash information.
     */
    async killServer(error: Error | string): Promise<void> {
        await this.worker.killServer(error);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the server url with protocol,hostname and port.
     * @example
     * https://myhost:3000
     */
    getServerUrl(): string {
        return `${this.zc.mainConfig.secure ? 'https' : 'http'}://${this.zc.mainConfig.hostname}:${this.zc.mainConfig.port}`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the zation server url with protocol,hostname,port and path.
     * @example
     * https://myhost:3000/path
     */
    getZationServerUrl(): string {
        return `${this.zc.mainConfig.secure ? 'https' : 'http'}://${this.zc.mainConfig.hostname}:${this.zc.mainConfig.port}${this.zc.mainConfig.path}`;
    }

    //Part Crypto

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random string.
     * @param length
     */
    generateRandomString(length: number = 16): string {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random number with fixed digits count.
     * @param digits
     */
    generateFixedRandomNumber(digits: number = 8): number {
        return Math.floor(Math.pow(10, digits - 1) + Math.random() * 9 * Math.pow(10, digits - 1));
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random number in a range.
     * @param min
     * @param max
     */
    generateRangeRandomNumber(min: number = 0, max: number = 10): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an random boolean.
     * @param chanceForTrue
     */
    generateRandomBoolean(chanceForTrue: number = 0.5): boolean {
        return Math.random() <= chanceForTrue;
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Hash an string with sha512.
     * @param string
     * @param salt
     */
    hashSha512(string: string, salt ?: string): string {
        return this.hashIn('sha512', string, salt);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Hash an string.
     * @param hash
     * @param string
     * @param salt
     */
    hashIn(hash: string, string: string, salt ?: string): string {
        if (salt !== undefined) {
            return crypto.createHmac(hash, salt).update(string).digest('hex');
        } else {
            return crypto.createHash(hash).update(string).digest('hex');
        }
    }

    //Asymmetric Encryption
    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an object with private an public key for Asymmetric Encryption.
     * @example
     * const { privateKey, publicKey } = await getAsymmetricKeyPair();
     *
     */
    async getAsymmetricKeyPair(): Promise<AsymmetricKeyPairs> {
        return crypto2.createKeyPair();
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
    async asymmetricEncrypt(message: string, publicKey: string): Promise<string> {
        return crypto2.encrypt.rsa(message, publicKey);
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
    async asymmetricDecrypt(encryptedMessage: string, privateKey: string): Promise<string> {
        return crypto2.decrypt.rsa(encryptedMessage, privateKey);
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
    async generatePassword(secret: String = this.generateRandomString()): Promise<string> {
        return crypto2.createPassword(secret);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Generates an initialization vector that you can use for Symmetric Encryption.
     * @example
     * const password = await generateIv();
     */
    async generateIv(): Promise<string> {
        return crypto2.createIv();
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
    async symmetricEncrypt(message: string, password: string, iv: string): Promise<string> {
        return crypto2.encrypt.aes256cbc(message, password, iv);
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
    async symmetricDecrypt(encryptedMessage: string, password: string, iv: string): Promise<string> {
        return crypto2.decrypt.aes256cbc(encryptedMessage, password, iv);
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
    async asymmetricSign(message: string, privateKey: string): Promise<string> {
        // noinspection TypeScriptValidateJSTypes
        return crypto2.sign(message, privateKey);
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
    async asymmetricVerify(message: string, publicKey: string, signature: string): Promise<boolean> {
        // noinspection TypeScriptValidateJSTypes
        return crypto2.verify(message, publicKey, signature);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an generated uuid v4.
     */
    generateUUIDv4(): string {
        return uuidV4();
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns an generated unique id.
     * By using npm package 'uniqid'.
     */
    generateUniqueId(): string {
        return uniqid();
    }

    //Part sign and verify token

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Sign a token. This method is only for advanced use cases.
     * It will not create a token that is based on a zation token structure,
     * also it will not attach this token to any client or request.
     * It will use the default server settings,
     * but you can override some options by providing jwt sign options as a second argument.
     * The return value is the signed token as a string.
     * @example
     * await signToken({someVariable : 'Hello'},{expiresIn : 200});
     * @param data
     * @param jwtOptions
     */
    async signToken(data: object, jwtOptions: JwtSignOptions = {}): Promise<string> {
        return TokenUtils.signToken(data, this.zc, jwtOptions);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Verify a token. This method can be used to verify signed tokens based on the secret key of the server.
     * A use case for this method could be to verify tokens in an express middleware.
     * The return value is the plain decrypted token.
     * @example
     * await verifyToken('djf09ejd103je32ije0');
     * @param signedToken
     * @param jwtOptions
     * @throws BackError with names: tokenExpiredError, jsonWebTokenError or unknownTokenVerifyError.
     */
    async verifyToken(signedToken: string, jwtOptions: JwtVerifyOptions = {}): Promise<Record<string, any>> {
        return TokenUtils.verifyToken(signedToken, this.zc, jwtOptions);
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an user channel or channels.
     * @example
     * publishInUserCh('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * publishInUserCh(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishInUserCh(userId: string | number | (number | string)[], eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.exchangeEngine.publishInUserCh(userId, eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an user channel or channels.
     * @example
     * pubUserCh('paul10','message',{message : 'hello',fromUserId : 'luca34'});
     * pubUserCh(['paul10','lea1'],'message',{message : 'hello',fromUserId : 'luca34'});
     * @param userId or more userIds in array.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubUserCh(userId: string | number | (number | string)[], eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.publishInUserCh(userId, eventName, data, srcSocketSid)
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all channel.
     * @example
     * publishInAllCh('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishInAllCh(eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.exchangeEngine.publishInAllCh(eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all channel.
     * @example
     * pubAllCh('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubAllCh(eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.publishInAllCh(eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in auth user group channel/s.
     * @example
     * publishInAuthUserGroupCh('admin','userRegistered',{userId : '1'});
     * publishInAuthUserGroupCh(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishInAuthUserGroupCh(authUserGroup: string | string[], eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.exchangeEngine.publishInAuthUserGroupCh(authUserGroup, eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in auth user group channel/s.
     * @example
     * pubAuthUserGroupCh('admin','userRegistered',{userId : '1'});
     * pubAuthUserGroupCh(['admin','superAdmin'],'userRegistered',{userId : '1'});
     * @param authUserGroup or an array of auth user groups.
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubAuthUserGroupCh(authUserGroup: string | string[], eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.publishInAuthUserGroupCh(authUserGroup, eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in default user group channel.
     * @example
     * publishInDefaultUserGroupCh('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishInDefaultUserGroupCh(eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.exchangeEngine.publishInDefaultUserGroupCh(eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in default user group channel.
     * @example
     * pubDefaultUserGroupCh('message',{message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubDefaultUserGroupCh(eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.publishInDefaultUserGroupCh(eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups channels.
     * @example
     * publishInAllAuthUserGroupsCh('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async publishInAllAuthUserGroupsCh(eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.exchangeEngine.publishInAllAuthUserGroupCh(eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in all auth user groups channels.
     * @example
     * pubAllAuthUserGroupsCh('message',{fromUserId : '1',message : 'hello'});
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     */
    async pubAllAuthUserGroupsCh(eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.publishInAllAuthUserGroupsCh(eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel.
     * @example
     * publishInCustomCh({name : 'imageChannel', id : 'image2'},'like',{fromUserId : '1'});
     * publishInCustomCh({name : 'publicChat'},'msg',{msg : 'Hello',fromUserId : '1'});
     * @param target
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     * @throws UnknownCustomCh
     */
    async publishInCustomCh(target : {name : string,id ?: string}, eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.exchangeEngine.publishInCustomCh(target, eventName, data, srcSocketSid);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Publish in an custom channel.
     * @example
     * publishInCustomCh({name : 'imageChannel', id : 'image2'},'like',{fromUserId : '1'});
     * publishInCustomCh({name : 'publicChat'},'msg',{msg : 'Hello',fromUserId : '1'});
     * @param target
     * @param eventName
     * @param data
     * @param srcSocketSid
     * If this param is undefined, will be published anonymously.
     * @throws UnknownCustomCh
     */
    async pubCustomCh(target : {name : string,id ?: string}, eventName: string, data: object = {}, srcSocketSid ?: string): Promise<void> {
        return this.publishInCustomCh(target,eventName,data,srcSocketSid);
    }

    //Part Custom Services

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the service, if it exists otherwise, it will throw a ServiceNotFoundError error.
     * @throws ServiceNotFoundError
     * @param  serviceName
     * @param  configName Default: 'default'
     */
    async getService<S = any>(serviceName: string, configName: string = 'default'): Promise<S> {
        return this.serviceEngine.getService<S>(serviceName, configName);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * This function returns a boolean that indicates if the service with the given service and configuration name exists.
     * @param serviceName
     * @param configName Default: 'default'
     */
    hasService(serviceName: string, configName: string = 'default'): boolean {
        return this.serviceEngine.hasService(serviceName, configName);
    }

    //Part Errors

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns a BackError builder.
     * For easy create an BackError.
     */
    buildBackError(): BackErrorBuilder {
        return new BackErrorBuilder();
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns a new BackError by using the constructor.
     * @param backErrorConstruct
     * @param info
     * The BackError info is a dynamic object which contains more detailed information.
     * For example, with an inputNotMatchWithMinLength error,
     * the info object could include what the length of the input is and
     * what the minimum length is.
     */
    newBackError(backErrorConstruct: BackErrorConstruct = {}, info ?: object | string): BackError {
        return new BackError(backErrorConstruct, info);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns a new BackErrorBag by using the constructor.
     * With the bag you can collect BackErrors
     * and throw them later all together.
     * Then all errors are sent to the client.
     * @example
     * newBackErrorBag(myError,myError2).throw();
     * @param backError
     */
    newBackErrorBag(...backError: BackError[]): BackErrorBag {
        return new BackErrorBag(...backError);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Throws an new BackError with info that is build with the BackError constructor.
     * @param errorConstruct
     * @param info
     */
    throwNewBackError(errorConstruct: BackErrorConstruct = {}, info ?: object | string): void {
        throw this.newBackError(errorConstruct, info);
    }

    //Part Result
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns a new result by using the constructor.
     * That you can return to the client.
     * With the result object you have the possibility to add a status code.
     * Rather than just a result.
     * @param result
     * @param statusCode
     */
    newResult(result ?: any, statusCode ?: string | number): Result {
        return new Result(result, statusCode);
    }

    //Part Logger

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log info into the log file,
     * notice that it only works when the log to file is activated in the main config.
     * @param args
     */
    logInfoToFile(...args: any[]): void {
        const sl = Logger.getSimpleLogger();
        if (sl) {
            sl.info(...args);
        }
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log error into the log file,
     * notice that it only works when the log to file is activated in the main config.
     * @param args
     */
    logErrorToFile(...args: any[]): void {
        const sl = Logger.getSimpleLogger();
        if (sl) {
            sl.error(...args);
        }
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log fatal into the log file,
     * notice that it only works when the log to file is activated in the main config.
     * @param args
     */
    logFatalToFile(...args: any[]): void {
        const sl = Logger.getSimpleLogger();
        if (sl) {
            // noinspection TypeScriptValidateJSTypes
            sl.fatal(...args);
        }
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log warn into the log file,
     * notice that it only works when the log to file is activated in the main config.
     * @param args
     */
    logWarnToFile(...args: any[]): void {
        const sl = Logger.getSimpleLogger();
        if (sl) {
            sl.warn(...args);
        }
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log warn into the console,
     * notice that it only appears when the debug mode is active.
     * @param args
     */
    logDebugWarn(...args: any[]): void {
        Logger.printDebugWarning(...args);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log info into the console,
     * notice that it only appears when the debug mode is active.
     * @param args
     */
    logDebugInfo(...args: any[]): void {
        Logger.printDebugInfo(...args);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log info into the console,
     * notice that it only appears when the debug mode is active.
     * @param args
     */
    logDebugBusy(...args: any[]): void {
        Logger.printDebugBusy(...args);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log warn into the console.
     * @param args
     */
    logWarn(...args: any[]): void {
        Logger.printWarning(...args);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log info into the console.
     * @param args
     */
    logInfo(...args: any[]): void {
        Logger.printInfo(...args);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Log busy into the console.
     * @param args
     */
    logBusy(...args: any[]): void {
        Logger.printBusy(...args);
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
    async fetch(url: string | Request, init?: RequestInit): Promise<Response> {
        return fetch(url, init);
    }

    //Part Channel KickOut

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with userId from an custom channel (server side).
     * @example
     * kickUserCustomCh('user20','chatGroup');
     * kickUserCustomCh(['tom39','lara23'],'image','2');
     * kickUserCustomCh(['tom39','lara23'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param userId or more user ids in an array.
     * @param name is optional, if it is not given the users will be kicked out from all custom channels.
     * @param id only provide an id if you want to kick the socket from a specific member of a custom channel family.
     * @param exceptSocketSids
     */
    async kickUserCustomCh(userId: number | string | (number | string)[], name ?: string, id ?: string, exceptSocketSids: string[] | string = []): Promise<void> {
        const ch = ChUtils.buildCustomChannelName(name, id);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChMapTaskActions.KICK_OUT, userId, exceptSocketSids, {ch});
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
    async kickUserAllCh(userId: number | string | (number | string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChMapTaskActions.KICK_OUT, userId, exceptSocketSids, {ch: ZationChannel.ALL});
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
    async kickUserAuthUserGroupCh(userId: number | string | (number | string)[], authUserGroup ?: string, exceptSocketSids: string[] | string = []): Promise<void> {
        const ch = ChUtils.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChMapTaskActions.KICK_OUT, userId, exceptSocketSids, {ch: ch});
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
    async kickUserDefaultUserGroupCh(userId: number | string | (number | string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChMapTaskActions.KICK_OUT, userId, exceptSocketSids, {ch: ZationChannel.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with token id from an custom channel (server side).
     * @example
     * kickTokenCustomCh('TOKEN-UUID1','publicChat');
     * kickTokenCustomCh(['TOKEN-UUID1','TOKEN-UUID2'],'image','2');
     * kickTokenCustomCh(['TOKEN-UUID1','TOKEN-UUID2'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param name is optional, if it is not given the sockets with tokenId will be kicked out from all custom channels.
     * @param id only provide an id if you want to kick the socket from a specific member of a custom channel family.
     * @param exceptSocketSids
     */
    async kickTokensCustomCh(tokenId: string | string[], name ?: string, id ?: string, exceptSocketSids: string[] | string = []): Promise<void> {
        const ch = ChUtils.buildCustomChannelName(name, id);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.TOKEN_IDS, WorkerChMapTaskActions.KICK_OUT, tokenId, exceptSocketSids, {ch});
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
    async kickTokensAllCh(tokenId: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.TOKEN_IDS, WorkerChMapTaskActions.KICK_OUT, tokenId, exceptSocketSids, {ch: ZationChannel.ALL});
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
    async kickTokensAuthUserGroupCh(tokenId: string | string[], authUserGroup ?: string, exceptSocketSids: string[] | string = []): Promise<void> {
        const ch = ChUtils.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.TOKEN_IDS, WorkerChMapTaskActions.KICK_OUT, tokenId, exceptSocketSids, {ch: ch});
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
    async kickTokensDefaultUserGroupCh(tokenId: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.TOKEN_IDS, WorkerChMapTaskActions.KICK_OUT, tokenId, exceptSocketSids, {ch: ZationChannel.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from an custom channel.
     * @example
     * kickOutAllSocketsCustomCh('CUSTOM-CH-NAME','ID');
     * kickOutAllSocketsCustomCh('CUSTOM-CH-NAME');
     * @param name is optional, if it is not given the sockets will be kicked out from all custom channels.
     * @param id only provide an id if you want to kick the socket from a specific member of a custom channel family.
     * @param exceptSocketSids
     */
    async kickAllSocketsCustomCh(name ?: string, id ?: string, exceptSocketSids: string[] | string = []): Promise<void> {
        const ch = ChUtils.buildCustomChannelName(name, id);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.ALL_SOCKETS, WorkerChMapTaskActions.KICK_OUT, [], exceptSocketSids, {ch: ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from all channel.
     * @example
     * kickOutAllSocketsAllCh();
     * @param exceptSocketSids
     */
    async kickAllSocketsAllCh(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.ALL_SOCKETS, WorkerChMapTaskActions.KICK_OUT, [], exceptSocketSids, {ch: ZationChannel.ALL});
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
    async kickAllSocketsAuthUserGroupCh(authUserGroup ?: string, exceptSocketSids: string[] | string = []): Promise<void> {
        const ch = ChUtils.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.ALL_SOCKETS, WorkerChMapTaskActions.KICK_OUT, [], exceptSocketSids, {ch: ch});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Kick out all sockets on the complete system from default user group channel.
     * @example
     * kickOutAllSocketsDefaultUserGroupCh();
     * @param exceptSocketSids
     */
    async kickAllSocketsDefaultUserGroupCh(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.ALL_SOCKETS, WorkerChMapTaskActions.KICK_OUT, [], exceptSocketSids, {ch: ZationChannel.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system with sid from an custom channel (server side).
     * @example
     * kickSocketsCustomCh('SOCKET-SID','publicChat');
     * kickSocketsCustomCh(['SOCKET-SID-1','SOCKET-SID-2'],'image','2');
     * @param socketSid or more socketSids in an array.
     * @param name is optional, if it is not given the sockets will be kicked out from all custom channels.
     * @param id only provide an id if you want to kick the socket from a specific member of a custom channel family.
     */
    async kickSocketsCustomCh(socketSid: string | string[], name ?: string, id ?: string): Promise<void> {
        const ch = ChUtils.buildCustomChannelName(name, id);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChMapTaskActions.KICK_OUT, socketSid, [], {ch});
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
    async kickSocketsAllCh(socketSid: string | string[]): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChMapTaskActions.KICK_OUT, socketSid, [], {ch: ZationChannel.ALL});
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
    async kickSocketsAuthUserGroupCh(socketSid: string | string[], authUserGroup ?: string): Promise<void> {
        const ch = ChUtils.buildAuthUserGroupChName(authUserGroup);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChMapTaskActions.KICK_OUT, socketSid, [], {ch: ch});
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
    async kickSocketsDefaultUserGroupCh(socketSid: string | string[]): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChMapTaskActions.KICK_OUT, socketSid, [], {ch: ZationChannel.DEFAULT_USER_GROUP});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system which belongs to the auth user groups from an custom channel (server side).
     * @example
     * kickAuthUserGroupsCustomCh('user','publicChat');
     * kickAuthUserGroupsCustomCh(['user','admin'],'image','2');
     * kickAuthUserGroupsCustomCh(['user','admin'],'image',undefined,'EXCEPT-SOCKET-SID');
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param name is optional, if it is not given the sockets will be kicked out from all custom channels.
     * @param id only provide an id if you want to kick the socket from a specific member of a custom channel family.
     * @param exceptSocketSids
     */
    async kickAuthUserGroupsCustomCh(authUserGroup: string | null | (string)[], name ?: string, id ?: string, exceptSocketSids: string[] | string = []): Promise<void> {
        const ch = ChUtils.buildCustomChannelName(name, id);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS, WorkerChMapTaskActions.KICK_OUT,
            authUserGroup || [], exceptSocketSids, {ch, all: authUserGroup === null});
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
    async kickAuthUserGroupsAllCh(authUserGroup: string | null | (string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS, WorkerChMapTaskActions.KICK_OUT,
            authUserGroup || [], exceptSocketSids, {ch: ZationChannel.ALL, all: authUserGroup === null});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * KickOut all sockets on the complete system which belongs to the default user group from an custom channel (server side).
     * @example
     * kickDefaultUserGroupCustomCh();
     * kickDefaultUserGroupCustomCh('publicChat');
     * kickDefaultUserGroupCustomCh('image','2');
     * kickDefaultUserGroupCustomCh('image',undefined,'EXCEPT-SOCKET-SID');
     * @param name is optional, if it is not given the sockets will be kicked out from all custom channels.
     * @param id only provide an id if you want to kick the socket from a specific member of a custom channel family.
     * @param exceptSocketSids
     */
    async kickDefaultUserGroupCustomCh(name ?: string, id ?: string, exceptSocketSids: string[] | string = []): Promise<void> {
        const ch = ChUtils.buildCustomChannelName(name, id);
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP, WorkerChMapTaskActions.KICK_OUT, [], exceptSocketSids, {ch});
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
    async kickDefaultUserGroupAllCh(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP, WorkerChMapTaskActions.KICK_OUT, [], exceptSocketSids, {ch: ZationChannel.ALL});
    }

    //Part Extra Emit
    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system with user id (server side).
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @example
     * emitUser('joel2','myEvent',{myData : 'test'});
     * emitUser('joel2','myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param userId or more userIds in an array.
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitUser(userId: number | string | (number | string)[], event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChMapTaskActions.EMIT, userId, exceptSocketSids, {event:ZationCustomEventNamespace+event,data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system with token id (server side).
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @example
     * emitToken('TOKEN-UUID1','myEvent',{myData : 'test'});
     * emitToken('TOKEN-UUID2','myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param tokenId or more tokenIds in an array.
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitTokens(tokenId: string | string[], event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.TOKEN_IDS, WorkerChMapTaskActions.EMIT, tokenId, exceptSocketSids, {event:ZationCustomEventNamespace+event, data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets on complete system (server side).
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @example
     * emitAllSockets('myEvent',{myData : 'test'});
     * emitAllSockets('myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitAllSockets(event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.ALL_SOCKETS, WorkerChMapTaskActions.EMIT, [], exceptSocketSids, {event:ZationCustomEventNamespace+event, data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to all sockets with sid on complete system (server side).
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @example
     * emitSockets('SOCKET-SID','myEvent',{myData : 'test'});
     * emitSockets(['SOCKET-SID-1','SOCKET-SID-2'],'myEvent',{myData : 'test'});
     * @param socketSid or more socketSids in an array.
     * @param event
     * @param data
     */
    async emitSockets(socketSid: string | string[], event: string, data: any = {}): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChMapTaskActions.EMIT, socketSid, [], {event:ZationCustomEventNamespace+event, data});
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to specific auth user groups on complete system (server side).
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @example
     * emitAuthUserGroups('admin','myEvent',{myData : 'test'});
     * emitAuthUserGroups(['user','admin'],'myEvent',{myData : 'test'});
     * @param authUserGroup or more authUserGroups in an array
     * or null witch stands for all auth user groups
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitAuthUserGroups(authUserGroup: string | null | (string)[], event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS, WorkerChMapTaskActions.EMIT, authUserGroup || [], exceptSocketSids, {
            event:ZationCustomEventNamespace+event,
            data,
            all: authUserGroup === null
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Emit to default user group on complete system (server side).
     * It uses the custom zation event namespace
     * (so you cannot have name conflicts with internal event names).
     * @example
     * emitDefaultUserGroup('myEvent',{myData : 'test'});
     * emitDefaultUserGroup('myEvent',{myData : 'test'},'EXCEPT-SOCKET-SID');
     * @param event
     * @param data
     * @param exceptSocketSids
     */
    async emitDefaultUserGroup(event: string, data: any = {}, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP, WorkerChMapTaskActions.EMIT, [], exceptSocketSids, {event:ZationCustomEventNamespace+event, data});
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
    async disconnectUser(userId: number | string | (number | string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChMapTaskActions.DISCONNECT, userId, exceptSocketSids);
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
    async disconnectTokens(tokenId: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.TOKEN_IDS, WorkerChMapTaskActions.DISCONNECT, tokenId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Disconnect all sockets on complete system (server side).
     * @example
     * disconnectAllSockets('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async disconnectAllSockets(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.ALL_SOCKETS, WorkerChMapTaskActions.DISCONNECT, [], exceptSocketSids);
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
    async disconnectSockets(socketSid: string | string[]): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChMapTaskActions.DISCONNECT, socketSid, []);
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
    async disconnectAuthUserGroups(authUserGroup: string | null | (string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS, WorkerChMapTaskActions.DISCONNECT, authUserGroup || [], exceptSocketSids, {all: authUserGroup === null});
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
    async disconnectDefaultUserGroup(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.DEFAULT_USER_GROUP, WorkerChMapTaskActions.DISCONNECT, [], exceptSocketSids);
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
    async deauthenticateUser(userId: number | string | (number | string)[] | number | string, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.USER_IDS, WorkerChMapTaskActions.DEAUTHENTICATE, userId, exceptSocketSids);
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
    async deauthenticateTokens(tokenId: string | string[] | string, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.TOKEN_IDS, WorkerChMapTaskActions.DEAUTHENTICATE, tokenId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Deauthenticate all sockets on complete system (server side).
     * @example
     * deauthenticateAllSockets('EXCEPT-SOCKET-SID');
     * @param exceptSocketSids
     */
    async deauthenticateAllSockets(exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.ALL_SOCKETS, WorkerChMapTaskActions.DEAUTHENTICATE, [], exceptSocketSids);
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
    async deauthenticateSockets(socketSid: string | string[] | string): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.SOCKETS_SIDS, WorkerChMapTaskActions.DEAUTHENTICATE, socketSid, []);
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
    async deauthenticateAuthUserGroups(authUserGroup: string | null | (string)[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishMapTaskToWorker
        (WorkerChTargets.AUTH_USER_GROUPS, WorkerChMapTaskActions.DEAUTHENTICATE, authUserGroup || [], exceptSocketSids, {all: authUserGroup === null});
    }

    //Part Socket Tools

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the user id from socket.
     * @example
     * getUserIdFromSocket(sc);
     * @param socket
     * @throws AuthenticationError if socket is not authenticated.
     */
    getUserIdFromSocket(socket: UpSocket): string | number | undefined {
        return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationUserId), socket.authToken);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Returns the auth user group from the socket
     * or undefined if the socket is not authenticated.
     * @example
     * getUserIdFromSocket(sc);
     * @param socket
     */
    getAuthUserGroupFromSocket(socket: UpSocket): string | undefined {
        try {
            return TokenUtils.getTokenVariable(nameof<ZationToken>(s => s.zationAuthUserGroup), socket.authToken);
        } catch (e) {
            return undefined;
        }
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the socketId from the socketSid.
     * @example
     * socketSidToSocketId('SOCKET-SID');
     * @param socketSid
     */
    socketSidToSocketId(socketSid: string): string {
        return SidBuilder.socketSidToSocketId(socketSid);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the server instance id from the socketSid.
     * @example
     * socketSidToSeverId(SOCKET-SID');
     * @param socketSid
     */
    socketSidToSeverId(socketSid: string): string {
        return SidBuilder.socketSidToServerInstanceId(socketSid);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Returns the worker id from the socketSid.
     * @example
     * socketSidToWorkerId('SOCKET-SID');
     * @param socketSid
     */
    socketSidToWorkerId(socketSid: string): string {
        return SidBuilder.socketSidToWorkerId(socketSid);
    }

    //Part ServerSocketVariable

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Set socket variable (server side) with object path.
     * @example
     * setSocketVariable(socket,'email','example@gmail.com');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     */
    setSocketVariableWithSocket(socket: UpSocket, path: string | string[], value: any): void {
        ObjectPath.set(socket.zationSocketVariables, path, value);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Has socket variable (server side) with object path.
     * @example
     * hasSocketVariable(socket,'email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    hasSocketVariableWithSocket(socket: UpSocket, path ?: string | string[]): boolean {
        return ObjectPath.has(socket.zationSocketVariables, path);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Get socket variable (server side) with object path.
     * @example
     * getSocketVariable(socket,'email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    getSocketVariableWithSocket<R = any>(socket: UpSocket, path ?: string | string[]): R {
        return ObjectPath.get(socket.zationSocketVariables, path);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Delete socket variable (server side) with object path.
     * @example
     * deleteSocketVariable(socket,'email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     */
    deleteSocketVariableWithSocket(socket: UpSocket, path ?: string | string[]): void {
        if (!!path) {
            ObjectPath.del(socket.zationSocketVariables, path);
        } else {
            socket.zationSocketVariables = {};
        }
    }

    //token variables

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Set a token variable with object path on a socket.
     * Every change on the token will update the authentication of the socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await setTokenVariableWithSocket(socket,'person.email','example@gmail.com');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async setTokenVariableWithSocket(socket: UpSocket, path: string | string[], value: any): Promise<void> {
        const ctv = CloneUtils.deepClone(TokenUtils.getCustomTokenVariables(socket.authToken));
        ObjectPath.set(ctv, path, value);
        await TokenUtils.setSocketCustomVar(ctv, socket);
    }

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    /**
     * @description
     * Delete a token variable with object path on a socket.
     * Every change on the token will update the authentication of the socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await deleteTokenVariableWithSocket(socket,'person.email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    async deleteTokenVariableWithSocket(socket: UpSocket, path ?: string | string[]): Promise<void> {
        if (!!path) {
            const ctv = CloneUtils.deepClone(TokenUtils.getCustomTokenVariables(socket.authToken));
            ObjectPath.del(ctv, path);
            await TokenUtils.setSocketCustomVar(ctv, socket);
        } else {
            await TokenUtils.setSocketCustomVar({}, socket);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token variables on a socket.
     * Useful if you want to make several changes.
     * This will do everything in one and saves performance.
     * Every change on the token will update the authentication of the socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * await seqEditTokenVariablesWithSocket()
     *       .delete('person.lastName')
     *       .set('person.name','Luca')
     *       .set('person.email','example@gmail.com')
     *       .commit();
     * @throws AuthenticationError if the socket is not authenticated.
     */
    seqEditTokenVariablesWithSocket(socket: UpSocket): ObjectPathSequence {
        return new ObjectPathSequenceImp(CloneUtils.deepClone(
            TokenUtils.getCustomTokenVariables(socket.authToken)),
            async (obj) => {
                await TokenUtils.setSocketCustomVar(obj, socket);
            });
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Check has a token variable with object path on a socket.
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * hasTokenVariableWithSocket(socket,'person.email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    hasTokenVariableWithSocket(socket: UpSocket, path ?: string | string[]): boolean {
        return ObjectPath.has(TokenUtils.getCustomTokenVariables(socket.authToken), path);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * @description
     * Get a token variable with object path from a socket.
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * Check that the socket is authenticated (has a token).
     * @example
     * getTokenVariableWithSocket(socket,'person.email');
     * @param socket
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @throws AuthenticationError if the socket is not authenticated.
     */
    getTokenVariableWithSocket<R = any>(socket: UpSocket, path ?: string | string[]): R {
        return ObjectPath.get(TokenUtils.getCustomTokenVariables(socket.authToken), path);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token variable on all tokens with a specific user id with object path.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * await setTokenVariableOnUserId('USER_ID','person.email','example@gmail.com');
     * @param userId
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     * @param exceptSocketSids
     */
    async setTokenVariableOnUserId(userId: string | number, path: string | string[], value: any, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishUpdateUserTokenWorkerTask
        ([{action: SyncTokenActions.SET, params: [path, value]}], userId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token variable on all tokens with a specific user id with object path.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * await deleteTokenVariableOnUserId('USER_ID','person.email');
     * @param userId
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param exceptSocketSids
     */
    async deleteTokenVariableOnUserId(userId: string | number, path ?: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishUpdateUserTokenWorkerTask
        ([{action: SyncTokenActions.DELETE, params: [path]}], userId, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token variables on all tokens with a specific user id.
     * Useful if you want to make several changes.
     * This will do everything in one and saves performance.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * await seqEditTokenVariablesOnUserId('USER_ID')
     *       .delete('person.lastName')
     *       .set('person.name','Luca')
     *       .set('person.email','example@gmail.com')
     *       .commit();
     * @param userId
     * @param exceptSocketSids
     */
    seqEditTokenVariablesOnUserId(userId: string | number, exceptSocketSids: string[] | string = []): ObjectPathSequence {
        return new ObjectPathActionSequenceImp(async (actions) => {
            if (actions.length > 0) {
                await this.exchangeEngine.publishUpdateUserTokenWorkerTask
                (actions, userId, exceptSocketSids);
            }
        });
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set a token variable on all tokens with a specific auth user group with object path.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * await setTokenVariableOnGroup('AUTH-USER-GROUP','person.email','example@gmail.com');
     * @param authUserGroup
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param value
     * @param exceptSocketSids
     */
    async setTokenVariableOnGroup(authUserGroup: string, path: string | string[], value: any, exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishUpdateGroupTokenWorkerTask
        ([{action: SyncTokenActions.SET, params: [path, value]}], authUserGroup, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Delete a token variable on all tokens with a specific auth user group with object path.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * await deleteTokenVariableOnGroup('AUTH-USER-GROUP','person.email');
     * @param authUserGroup
     * @param path
     * The path to the variable, you can split the keys with a dot or an string array.
     * @param exceptSocketSids
     */
    async deleteTokenVariableOnGroup(authUserGroup: string, path ?: string | string[], exceptSocketSids: string[] | string = []): Promise<void> {
        await this.exchangeEngine.publishUpdateGroupTokenWorkerTask
        ([{action: SyncTokenActions.DELETE, params: [path]}], authUserGroup, exceptSocketSids);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Sequence edit the token variables on all tokens with a specific auth user group.
     * Useful if you want to make several changes.
     * This will do everything in one and saves performance.
     * Every change on the token will update the authentication of each socket. (Like a new authentication on top)
     * Notice that the token variables are separated from the main zation token variables.
     * That means there can be no naming conflicts with zation variables.
     * You can access this variables on client and server side.
     * But only change, delete or set on the server.
     * @example
     * await seqEditTokenVariablesOnGroup('AUTH-USER-GROUP')
     *       .delete('person.lastName')
     *       .set('person.name','Luca')
     *       .set('person.email','example@gmail.com')
     *       .commit();
     * @param authUserGroup
     * @param exceptSocketSids
     */
    seqEditTokenVariablesOnGroup(authUserGroup: string, exceptSocketSids: string[] | string = []): ObjectPathSequence {
        return new ObjectPathActionSequenceImp(async (actions) => {
            if (actions.length > 0) {
                await this.exchangeEngine.publishUpdateGroupTokenWorkerTask
                (actions, authUserGroup, exceptSocketSids);
            }
        });
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
    setWorkerVariable(path: string | string[], value: any): void {
        ObjectPath.set(this.worker.getWorkerVariableStorage(), path, value);
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
    hasWorkerVariable(path ?: string | string[]): boolean {
        return ObjectPath.has(this.worker.getWorkerVariableStorage(), path);
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
    getWorkerVariable<R = any>(path ?: string | string[]): R {
        return ObjectPath.get(this.worker.getWorkerVariableStorage(), path);
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
    deleteWorkerVariable(path ?: string | string[]): void {
        if (!!path) {
            ObjectPath.del(this.worker.getWorkerVariableStorage(), path);
        } else {
            this.worker.setWorkerVariableStorage({});
        }
    }

    //Part ApiLevel

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    /**
     * Build a closure for selecting the API level.
     * The closure will return the correct mapped value with the best compatible API level.
     * If there is no compatible API level, the closure returns undefined.
     * Notice if you always have a 1 in the mapped values as an API level the closure will always return a value.
     * @param apiLevelSwitch
     * @example
     * const switch = createApiLevelSwitcher<string>({
     *     1 : 'apiLevel1',
     *     5 : 'apiLevel5',
     *     8 : 'apiLevel8',
     *     2 : 'apiLevel2'
     * });
     * console.log(switch(7)); // apiLevel5
     * console.log(switch(20)); // apiLevel8
     * console.log(switch(1)); // apiLevel1
     */
    createApiLevelSwitcher<T>(apiLevelSwitch : ApiLevelSwitch<T>) : ApiLevelSwitchFunction<T> {
        return ApiLevelUtils.createApiLevelSwitcher<T>(apiLevelSwitch);
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
    base64ByteSize(encodedBase64: string): number {
        return Base64Utils.getByteSize(encodedBase64);
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
     * Otherwise, it is an object with the properties: mimeSubType (png,jpg...), mimeType (image,video...).
     */
    base64ContentInfo(encodedBase64: string): null | { mimeSubType: string, mimeType: string } {
        return Base64Utils.getContentInfo(encodedBase64);
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
    stringByteSize(string: string): number {
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
    getWorkerSocket(socketId: string): UpSocket | undefined {
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
    getWorkerClients(): Record<string,UpSocket> {
        return this.worker.scServer.clients;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the sc server from worker.
     */
    getScServer() : ScServer {
        return this.worker.scServer;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns the number of connected clients to this worker.
     * @example
     * getWorkerConnectedClientsCount();
     */
    getWorkerConnectedClientsCount(): number {
        return this.worker.getStatus().clientCount;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns http requests per minute.
     */
    getWorkerHttpRequestPerMinute(): number {
        return this.worker.getStatus().httpRPM;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns web sockets requests per minute.
     */
    getWorkerWsRequestPerMinute(): number {
        return this.worker.getStatus().wsRPM;
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
    convertSocketIdToSid(...socketIds: string[]): string[] {
        const res: string[] = [];
        socketIds.forEach((id) => {
            let socket: UpSocket | undefined = this.getWorkerSocket(id);
            if (!!socket) {
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
    getSocketsWithTokenId(tokenId : string) : UpSocket[]
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
    getSocketsWithUserId(userId : string) : UpSocket[]
    {
        return this.worker.getUserIdToScMapper().getValues(userId);
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
    getWorkerDefaultUserGroupSockets() : UpSocket[] {
        return this.worker.getDefaultUserGroupSet().toArray();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns array of only panel sockets (only this worker).
     */
    getWorkerOnlyPanelSockets() : UpSocket[] {
        return this.worker.getPanelUserSet().toArray();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Returns array of auth user group sockets (only this worker).
     */
    getWorkerAuthUserGroupSockets(authUserGroup : string) : UpSocket[] {
        return this.worker.getAuthUserGroupToScMapper().getValues(authUserGroup);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Send a message to all workers on the complete system.
     * You can react to the message with the worker message event in the event config.
     */
    async sendWorkerMessage(data : any) : Promise<void> {
        await this.exchangeEngine.publishSpecialTaskToWorker
        (WorkerChSpecialTaskActions.MESSAGE, {data : data});
    }

    //Part DataBoxes

    /**
     * This function helps to access your DataBoxes.
     * You only need to call the method with the classes of the DataBoxes.
     * It returns a DataBoxContainer or DataBoxFamilyContainer.
     * With these containers, you can interact with one or more boxes.
     * So, for example, if you have two DataBoxes with different API levels from the same type,
     * you can communicate directly with both.
     * It is recommended if you use this method in a controller
     * that you prepare the creation of the Container in the initialize method.
     * @example
     * dataBox(ProfileDataBoxFamilyV1,ProfileDataBoxFamilyV2);
     * dataBox(PublicChatDataBox);
     * @param dataBoxes
     * The classes of the DataBoxes.
     */
    dataBox(...dataBoxes : DataBoxFamilyClass[]) : DataBoxFamilyContainer;
    /**
     * This function helps to access your DataBoxes.
     * You only need to call the method with the classes of the DataBoxes.
     * It returns a DataBoxContainer or DataBoxFamilyContainer.
     * With these containers, you can interact with one or more boxes.
     * So, for example, if you have two DataBoxes with different API levels from the same type,
     * you can communicate directly with both.
     * It is recommended if you use this method in a controller
     * that you prepare the creation of the Container in the initialize method.
     * @example
     * dataBox(ProfileDataBoxFamilyV1,ProfileDataBoxFamilyV2);
     * dataBox(PublicChatDataBox);
     * @param dataBoxes
     * The classes of the DataBoxes.
     */
    dataBox(...dataBoxes : DataBoxClass[]) : DataBoxContainer;
    /**
     * This function helps to access your DataBoxes.
     * You only need to call the method with the classes of the DataBoxes.
     * It returns a DataBoxContainer or DataBoxFamilyContainer.
     * With these containers, you can interact with one or more boxes.
     * So, for example, if you have two DataBoxes with different API levels from the same type,
     * you can communicate directly with both.
     * It is recommended if you use this method in a controller
     * that you prepare the creation of the Container in the initialize method.
     * @example
     * dataBox(ProfileDataBoxFamilyV1,ProfileDataBoxFamilyV2);
     * dataBox(PublicChatDataBox);
     * @param dataBoxes
     * The classes of the DataBoxes.
     */
    dataBox(...dataBoxes : DataBoxFamilyClass[] | DataBoxClass[]) : DataBoxFamilyContainer | DataBoxContainer {
       return DataBoxUtils.getDbContainer(dataBoxes);
    }
}
